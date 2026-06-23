import { jwtVerify, SignJWT } from "jose";
import { SESSION_IDLE_TIMEOUT_SECONDS } from "@/lib/session-config";

export type Role = "PLAYER" | "BRANCH_MANAGER" | "ADMIN";

function resolveAuthSecret(): string | null {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || null;
}

export type JWTPayload = {
  id: string;
  role: Role;
  branchId: string | null;
  mustChangePassword: boolean;
};

/** Use in Edge proxy (`src/proxy.ts`). Does not depend on Node-only modules. */
export async function verifyTokenForEdge(token: string): Promise<JWTPayload | null> {
  try {
    const secret = resolveAuthSecret();
    if (!secret) return null;
    const encoded = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, encoded);
    const sub = payload.sub;
    const role = payload.role as Role;
    if (!sub || !role) return null;
    if (!["PLAYER", "BRANCH_MANAGER", "ADMIN"].includes(role)) return null;
    const lastActivity = payload.lastActivity as number | undefined;
    if (typeof lastActivity === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now > lastActivity + SESSION_IDLE_TIMEOUT_SECONDS) return null;
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

/** Create a new token with current time as lastActivity (for sliding session in proxy). */
export async function createTokenForEdge(payload: JWTPayload): Promise<string> {
  const secret = resolveAuthSecret();
  if (!secret) throw new Error("JWT_SECRET is not set (or NEXTAUTH_SECRET fallback)");
  const encoded = new TextEncoder().encode(secret);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    role: payload.role,
    branchId: payload.branchId,
    mustChangePassword: payload.mustChangePassword ?? false,
    lastActivity: now,
  })
    .setSubject(payload.id)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(now + SESSION_IDLE_TIMEOUT_SECONDS)
    .setIssuedAt(now)
    .sign(encoded);
}
