import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_IDLE_TIMEOUT_SECONDS } from "@/lib/session-config";
import type { BranchPermission } from "@/lib/branch-permissions";

export type Role = "PLAYER" | "TEAM_LEAD" | "BRANCH_MANAGER" | "ADMIN";

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized", public actionName?: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type AuthSession = {
  id: string;
  role: Role;
  branchId: string | null;
  mustChangePassword?: boolean;
};

const AUTH_COOKIE_NAME = "mn_token";
/** @deprecated Use SESSION_IDLE_TIMEOUT_SECONDS from session-config */
const IDLE_TIMEOUT_SECONDS = SESSION_IDLE_TIMEOUT_SECONDS;

const ALL_ROLES: Role[] = ["PLAYER", "TEAM_LEAD", "BRANCH_MANAGER", "ADMIN"];

function resolveAuthSecret(): string | null {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || null;
}

/** True when session cookies can be signed (required for login on any host). */
export function isAuthSecretConfigured(): boolean {
  return Boolean(resolveAuthSecret());
}

function getJwtSecret(): Uint8Array {
  const secret = resolveAuthSecret();
  if (!secret) throw new Error("JWT_SECRET is not set (or NEXTAUTH_SECRET fallback)");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: {
  sub: string;
  role: Role;
  branchId: string | null;
  mustChangePassword?: boolean;
}): Promise<string> {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    role: payload.role,
    branchId: payload.branchId,
    mustChangePassword: payload.mustChangePassword ?? false,
    lastActivity: now,
  })
    .setSubject(payload.sub)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(now + IDLE_TIMEOUT_SECONDS)
    .setIssuedAt(now)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    const role = payload.role as Role;
    if (!sub || !role) return null;
    if (!ALL_ROLES.includes(role)) return null;
    const lastActivity = payload.lastActivity as number | undefined;
    if (typeof lastActivity === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now > lastActivity + IDLE_TIMEOUT_SECONDS) return null;
    }
    return {
      id: sub,
      role,
      branchId: (payload.branchId as string | null) ?? null,
      mustChangePassword: payload.mustChangePassword === true,
    };
  } catch {
    return null;
  }
}

export async function getServerAuthSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function hasPermission(requiredRoles: Role[], userRole: Role): boolean {
  return requiredRoles.includes(userRole);
}

/** Field staff roles that can scout, induct, and use the map. */
export const FIELD_STAFF_ROLES: Role[] = ["PLAYER", "TEAM_LEAD", "BRANCH_MANAGER", "ADMIN"];

export async function authorize(
  requiredRoles: Role[],
  actionName?: string
): Promise<AuthSession> {
  const session = await getServerAuthSession();
  if (!session) throw new UnauthorizedError("Not authenticated", actionName);
  if (!hasPermission(requiredRoles, session.role)) {
    throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
  }
  return session;
}

export type ActiveBranchGrant = {
  permission: BranchPermission;
  teamScopeKey: string;
};

export async function getActiveGrantsForUser(
  userId: string,
  branchId: string | null
): Promise<ActiveBranchGrant[]> {
  if (!branchId) return [];
  const now = new Date();
  const rows = await prisma.userPermissionGrant.findMany({
    where: {
      userId,
      branchId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { permission: true, teamScopeKey: true },
  });
  return rows.map((r) => ({
    permission: r.permission as BranchPermission,
    teamScopeKey: r.teamScopeKey,
  }));
}

async function syncTeamLeadRoleFromGrants(userId: string, branchId: string): Promise<boolean> {
  const grants = await getActiveGrantsForUser(userId, branchId);
  if (grants.length > 0) return false;
  const updated = await prisma.user.updateMany({
    where: { id: userId, role: "TEAM_LEAD" },
    data: { role: "PLAYER" },
  });
  return updated.count > 0;
}

export async function getActivePermissionsForSession(
  session: AuthSession
): Promise<BranchPermission[]> {
  if (session.role === "ADMIN" || session.role === "BRANCH_MANAGER") {
    return [
      "MANAGE_USERS",
      "MANAGE_TEAMS",
      "MANAGE_MISSIONS",
      "MANAGE_TERRITORY",
      "VIEW_REPORTS",
    ];
  }
  if (session.role !== "TEAM_LEAD" || !session.branchId) return [];
  if (await syncTeamLeadRoleFromGrants(session.id, session.branchId)) return [];
  const grants = await getActiveGrantsForUser(session.id, session.branchId);
  return [...new Set(grants.map((g) => g.permission))];
}

function grantCoversTeam(
  grants: ActiveBranchGrant[],
  permission: BranchPermission,
  targetTeamId?: string | null
): boolean {
  const matching = grants.filter((g) => g.permission === permission);
  if (matching.length === 0) return false;
  if (!targetTeamId) {
    return matching.some((g) => g.teamScopeKey === "");
  }
  return matching.some(
    (g) => g.teamScopeKey === "" || g.teamScopeKey === targetTeamId
  );
}

export type AuthorizeBranchActionContext = {
  branchId?: string | null;
  targetTeamId?: string | null;
};

/**
 * Authorize branch-scoped management actions.
 * ADMIN: global. BRANCH_MANAGER: own branch. TEAM_LEAD: active grant required.
 */
export async function authorizeBranchAction(
  permission: BranchPermission,
  actionName?: string,
  context?: AuthorizeBranchActionContext
): Promise<AuthSession> {
  const session = await getServerAuthSession();
  if (!session) throw new UnauthorizedError("Not authenticated", actionName);

  if (session.role === "ADMIN") return session;

  const targetBranchId = context?.branchId ?? session.branchId;
  if (!targetBranchId) {
    throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
  }

  if (session.role === "BRANCH_MANAGER") {
    if (session.branchId !== targetBranchId) {
      throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
    }
    return session;
  }

  if (session.role === "TEAM_LEAD") {
    if (session.branchId !== targetBranchId) {
      throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
    }
    const grants = await getActiveGrantsForUser(session.id, targetBranchId);
    if (grants.length === 0) {
      await syncTeamLeadRoleFromGrants(session.id, targetBranchId);
      throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
    }
    if (!grantCoversTeam(grants, permission, context?.targetTeamId)) {
      throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
    }
    return session;
  }

  throw new UnauthorizedError(`Insufficient permissions for ${actionName ?? "this action"}`, actionName);
}

export function isManagementRole(role: Role | null): boolean {
  return role === "ADMIN" || role === "BRANCH_MANAGER" || role === "TEAM_LEAD";
}

/** Non-admin roles scoped to a single branch via session.branchId. */
export function isBranchStaff(session: AuthSession): boolean {
  return (
    session.role === "PLAYER" ||
    session.role === "TEAM_LEAD" ||
    session.role === "BRANCH_MANAGER"
  );
}

export function sessionOwnsBranch(session: AuthSession, branchId: string | null | undefined): boolean {
  if (session.role === "ADMIN") return true;
  return Boolean(branchId && session.branchId === branchId);
}

export { AUTH_COOKIE_NAME, IDLE_TIMEOUT_SECONDS };
