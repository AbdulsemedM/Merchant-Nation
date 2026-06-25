import { prisma } from "@/lib/prisma";
import type { Role as PrismaRole } from "@prisma/client";
import {
  authorize,
  authorizeBranchAction,
  getActiveGrantsForUser,
  type AuthSession,
} from "@/lib/auth";
import {
  BRANCH_PERMISSIONS,
  teamScopeKeyFromTeamId,
  type BranchPermission,
} from "@/lib/branch-permissions";
import { logActivity } from "@/backend/services/activity-log-service";

export type DelegationGrantInput = {
  userId: string;
  permissions: BranchPermission[];
  teamId?: string | null;
  expiresAt?: Date | null;
};

export type DelegationGrantRow = {
  permission: BranchPermission;
  teamScopeKey: string;
  expiresAt: Date | null;
  grantedAt: Date;
};

function assertCanManageDelegation(session: AuthSession, branchId: string) {
  if (session.role === "ADMIN") return;
  if (session.role === "BRANCH_MANAGER" && session.branchId === branchId) return;
  throw new Error("Only branch managers can delegate permissions in their branch.");
}

export async function getDelegationGrantsForUser(
  userId: string,
  branchId: string
): Promise<DelegationGrantRow[]> {
  const session = await authorize(["ADMIN", "BRANCH_MANAGER"], "getDelegationGrantsForUser");
  if (session.role === "BRANCH_MANAGER") {
    if (!session.branchId || session.branchId !== branchId) {
      throw new Error("You can only view delegation for your branch.");
    }
  }
  const now = new Date();
  const rows = await prisma.userPermissionGrant.findMany({
    where: {
      userId,
      branchId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "asc" },
    select: {
      permission: true,
      teamScopeKey: true,
      expiresAt: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    permission: r.permission as BranchPermission,
    teamScopeKey: r.teamScopeKey,
    expiresAt: r.expiresAt,
    grantedAt: r.createdAt,
  }));
}

export async function grantDelegation(input: DelegationGrantInput): Promise<void> {
  const session = await authorize(["ADMIN", "BRANCH_MANAGER"], "grantDelegation");

  if (input.userId === session.id) {
    throw new Error("You cannot delegate permissions to yourself.");
  }

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      name: true,
      role: true,
      branchId: true,
      team: { select: { branchId: true } },
    },
  });
  if (!target) throw new Error("User not found.");

  const targetBranchId = target.branchId ?? target.team?.branchId ?? null;
  if (!targetBranchId) throw new Error("User must belong to a branch.");

  if (session.role === "BRANCH_MANAGER") {
    if (!session.branchId || session.branchId !== targetBranchId) {
      throw new Error("You can only delegate within your branch.");
    }
  }

  if (target.role !== ("PLAYER" as PrismaRole) && target.role !== ("TEAM_LEAD" as PrismaRole)) {
    throw new Error("Delegation can only be granted to players or team leads.");
  }

  const permissions = [...new Set(input.permissions)];
  for (const p of permissions) {
    if (!BRANCH_PERMISSIONS.includes(p)) {
      throw new Error(`Invalid permission: ${p}`);
    }
  }
  if (permissions.length === 0) throw new Error("Select at least one permission.");

  if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
    throw new Error("Expiry date must be in the future.");
  }

  const teamScopeKey = teamScopeKeyFromTeamId(input.teamId);
  if (teamScopeKey) {
    const team = await prisma.team.findUnique({
      where: { id: teamScopeKey },
      select: { branchId: true },
    });
    if (!team || team.branchId !== targetBranchId) {
      throw new Error("Team must belong to the user's branch.");
    }
  }

  assertCanManageDelegation(session, targetBranchId);

  await prisma.$transaction(async (tx) => {
    if (target.role === ("PLAYER" as PrismaRole)) {
      await tx.user.update({
        where: { id: target.id },
        data: { role: "TEAM_LEAD" as PrismaRole },
      });
    }

    for (const permission of permissions) {
      await tx.userPermissionGrant.upsert({
        where: {
          userId_branchId_permission_teamScopeKey: {
            userId: target.id,
            branchId: targetBranchId,
            permission,
            teamScopeKey,
          },
        },
        create: {
          userId: target.id,
          branchId: targetBranchId,
          permission,
          grantedById: session.id,
          teamScopeKey,
          expiresAt: input.expiresAt ?? null,
          revokedAt: null,
        },
        update: {
          grantedById: session.id,
          expiresAt: input.expiresAt ?? null,
          revokedAt: null,
        },
      });
    }

    // Revoke permissions removed from this save (same team scope).
    await tx.userPermissionGrant.updateMany({
      where: {
        userId: target.id,
        branchId: targetBranchId,
        teamScopeKey,
        permission: { notIn: permissions },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  });

  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true },
  });

  await logActivity(session, actor?.name ?? "User", "USER_DELEGATION_GRANT", {
    entityType: "User",
    entityId: target.id,
    branchId: targetBranchId,
    metadata: {
      targetName: target.name,
      permissions,
      teamScopeKey: teamScopeKey || null,
      expiresAt: input.expiresAt?.toISOString() ?? null,
    },
  });
}

export async function revokeDelegation(
  userId: string,
  permissions?: BranchPermission[]
): Promise<void> {
  const session = await authorize(["ADMIN", "BRANCH_MANAGER"], "revokeDelegation");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      branchId: true,
      team: { select: { branchId: true } },
    },
  });
  if (!target) throw new Error("User not found.");

  const targetBranchId = target.branchId ?? target.team?.branchId ?? null;
  if (!targetBranchId) throw new Error("User must belong to a branch.");

  if (session.role === "BRANCH_MANAGER") {
    if (!session.branchId || session.branchId !== targetBranchId) {
      throw new Error("You can only revoke delegation within your branch.");
    }
  }

  assertCanManageDelegation(session, targetBranchId);

  const now = new Date();
  const revokeFilter =
    permissions && permissions.length > 0
      ? { permission: { in: permissions } }
      : {};

  await prisma.userPermissionGrant.updateMany({
    where: {
      userId,
      branchId: targetBranchId,
      revokedAt: null,
      ...revokeFilter,
    },
    data: { revokedAt: now },
  });

  const remaining = await getActiveGrantsForUser(userId, targetBranchId);
  if (remaining.length === 0 && target.role === ("TEAM_LEAD" as PrismaRole)) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PLAYER" as PrismaRole },
    });
  }

  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true },
  });

  await logActivity(session, actor?.name ?? "User", "USER_DELEGATION_REVOKE", {
    entityType: "User",
    entityId: userId,
    branchId: targetBranchId,
    metadata: {
      targetName: target.name,
      permissions: permissions ?? "all",
    },
  });
}

/** TEAM_LEAD self-check for team-scoped target operations. */
export async function assertTeamLeadCanAccessTarget(
  session: AuthSession,
  permission: BranchPermission,
  targetUserId: string
): Promise<void> {
  if (session.role !== "TEAM_LEAD" || !session.branchId) return;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { teamId: true, branchId: true, team: { select: { branchId: true } } },
  });
  if (!target) throw new Error("User not found.");

  const targetBranchId = target.branchId ?? target.team?.branchId ?? null;
  await authorizeBranchAction(permission, "accessTargetUser", {
    branchId: targetBranchId,
    targetTeamId: target.teamId,
  });
}
