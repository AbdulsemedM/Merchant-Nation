import { prisma } from "@/lib/prisma";
import {
  authorize,
  authorizeBranchAction,
  getActiveGrantsForUser,
  getServerAuthSession,
  UnauthorizedError,
  type Role,
  hashPassword,
} from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import { logActivity } from "@/backend/services/activity-log-service";
import { assertTeamLeadCanAccessTarget } from "@/backend/services/delegation-service";
import * as branchesService from "@/backend/services/branches-service";

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: Role;
  teamId?: string | null;
  branchId?: string | null;
  /** When creating BRANCH_MANAGER, pass branch from branches.json; resolved to branchId */
  branchCode?: string | null;
};

function isPrismaConnectionError(e: unknown): boolean {
  if (e && typeof e === "object" && "name" in e) {
    const name = (e as { name?: string }).name;
    if (name === "PrismaClientInitializationError" || name === "PrismaClientKnownRequestError") return true;
  }
  if (e && typeof e === "object" && "message" in e) {
    const msg = String((e as { message?: unknown }).message ?? "");
    if (msg.includes("Authentication failed") || msg.includes("database server")) return true;
  }
  return false;
}

export async function getCurrentUser(userId?: string | null) {
  try {
    if (userId) {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          rank: true,
          xp: true,
          role: true,
          branchId: true,
          team: { select: { name: true, branchId: true } },
          branch: { select: { name: true } },
        },
      });
      return u ?? null;
    }
    return null;
  } catch (e) {
    if (isPrismaConnectionError(e)) return null;
    throw e;
  }
}

export async function getProfileStats(userId: string, options: { branchId?: string | null; role?: string }) {
  const { branchId, role } = options;
  const isAdmin = role === "ADMIN";
  const scopeBranchId = isAdmin ? null : branchId ?? null;

  try {
    const [cellsScouted, zonesCaptured, merchantsInducted, tasksApproved] = await Promise.all([
      // Territory cells with status SCOUTED (in branch or all)
      scopeBranchId == null
        ? prisma.territoryCell.count({ where: { status: "SCOUTED" } })
        : prisma.territoryCell.count({
            where: { branchId: scopeBranchId, status: "SCOUTED" },
          }),
      // Zones with status CAPTURED (in branch or all)
      scopeBranchId == null
        ? prisma.zone.count({ where: { status: "CAPTURED" } })
        : prisma.zone.count({
            where: { branchId: scopeBranchId, status: "CAPTURED" },
          }),
      // Merchants inducted: by lead's zone branch (or all)
      scopeBranchId == null
        ? prisma.merchant.count()
        : prisma.merchant.count({
            where: { lead: { zone: { branchId: scopeBranchId } } },
          }),
      // Mission tasks approved (in branch or all)
      scopeBranchId == null
        ? prisma.missionTask.count({ where: { status: "APPROVED" } })
        : prisma.missionTask.count({
            where: {
              status: "APPROVED",
              mission: { branchId: scopeBranchId },
            },
          }),
    ]);

    return {
      zonesScouted: cellsScouted,
      merchantsInducted,
      zonesCaptured,
      missionsCompleted: tasksApproved,
    };
  } catch (e) {
    if (isPrismaConnectionError(e)) {
      return {
        zonesScouted: 0,
        merchantsInducted: 0,
        zonesCaptured: 0,
        missionsCompleted: 0,
      };
    }
    throw e;
  }
}

export async function getLeaderboard(limit = 20, branchId?: string | null) {
  try {
    const session = await getServerAuthSession();
    if (!session) return [];

    let effectiveBranchId = branchId ?? null;
    if (session.role === "BRANCH_MANAGER" || session.role === "PLAYER" || session.role === "TEAM_LEAD") {
      const self = await getCurrentUser(session.id);
      effectiveBranchId =
        session.branchId ?? self?.branchId ?? self?.team?.branchId ?? null;
      if (!effectiveBranchId) return [];
    }

    const where = effectiveBranchId
      ? {
          role: "PLAYER" as Role,
          OR: [{ branchId: effectiveBranchId }, { team: { branchId: effectiveBranchId } }],
        }
      : { role: "PLAYER" as Role };

    const rows = await prisma.user.findMany({
      where,
      orderBy: { xp: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        rank: true,
        xp: true,
        branchId: true,
        team: { select: { branchId: true } },
        scoutedLeads: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { zone: { select: { code: true } } },
        },
        _count: { select: { ownedZones: true, scoutedLeads: true } },
      },
    });

    const branchIds = Array.from(
      new Set(
        rows
          .map((u) => u.branchId ?? u.team?.branchId ?? null)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const managers =
      branchIds.length > 0
        ? await prisma.user.findMany({
            where: {
              role: "BRANCH_MANAGER",
              OR: [{ branchId: { in: branchIds } }, { team: { branchId: { in: branchIds } } }],
            },
            select: {
              name: true,
              branchId: true,
              team: { select: { branchId: true } },
            },
            orderBy: { name: "asc" },
          })
        : [];

    const managerByBranchId = new Map<string, string>();
    for (const m of managers) {
      const bId = m.branchId ?? m.team?.branchId ?? null;
      if (!bId) continue;
      if (!managerByBranchId.has(bId)) managerByBranchId.set(bId, m.name);
    }

    return rows.map(({ _count, scoutedLeads, team, branchId, ...u }) => {
      const resolvedBranchId = branchId ?? team?.branchId ?? null;
      return {
        ...u,
        zones: _count.ownedZones,
        scouts: _count.scoutedLeads,
        managerName: resolvedBranchId ? managerByBranchId.get(resolvedBranchId) ?? "—" : "—",
        latestZoneCode: scoutedLeads[0]?.zone?.code ?? "—",
      };
    });
  } catch (e) {
    if (isPrismaConnectionError(e)) return [];
    throw e;
  }
}

/** Leaderboard data for dashboard: top N entries + current user's position and entry. */
export async function getLeaderboardForDashboard(limit: number, currentUserId: string, branchId?: string | null) {
  const all = await getLeaderboard(limit * 3, branchId);
  const currentIndex = all.findIndex((u) => u.id === currentUserId);
  const currentUserEntry = currentIndex >= 0 ? all[currentIndex] : null;
  const position = currentIndex >= 0 ? currentIndex + 1 : null;
  const entries = all.slice(0, limit);
  return { entries, position, currentUserEntry };
}

export async function getUsersForAdmin(
  branchIdFilter?: string | null,
  options?: { limit?: number; offset?: number }
): Promise<{
  users: {
    id: string;
    name: string;
    role: string;
    teamName: string | null;
    branchName: string | null;
    teamId: string | null;
    branchId: string | null;
  }[];
  total: number;
}> {
  const session = await authorizeBranchAction("MANAGE_USERS", "getUsersForAdmin", {
    branchId: branchIdFilter ?? undefined,
  });
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const offset = Math.max(options?.offset ?? 0, 0);

  try {
    if (session.role === "ADMIN") {
      const where =
        branchIdFilter != null
          ? { role: { not: "ADMIN" as Role }, OR: [{ branchId: branchIdFilter }, { team: { branchId: branchIdFilter } }] }
          : { role: { not: "ADMIN" as Role } };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { name: "asc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            name: true,
            role: true,
            teamId: true,
            branchId: true,
            team: { select: { id: true, name: true, branchId: true } },
            branch: { select: { name: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          teamName: u.team?.name ?? null,
          branchName: u.branch?.name ?? null,
          teamId: u.teamId ?? u.team?.id ?? null,
          branchId: u.branchId ?? u.team?.branchId ?? null,
        })),
        total,
      };
    }

    const teamLeadScopeKeys =
      session.role === "TEAM_LEAD" && session.branchId
        ? (await getActiveGrantsForUser(session.id, session.branchId))
            .filter((g) => g.permission === "MANAGE_USERS")
            .map((g) => g.teamScopeKey)
        : null;

    const teamLeadTeamFilter =
      teamLeadScopeKeys && teamLeadScopeKeys.length > 0 && !teamLeadScopeKeys.includes("")
        ? { teamId: { in: teamLeadScopeKeys } }
        : {};

    const where = {
      role: { in: ["PLAYER", "TEAM_LEAD"] as Role[] },
      OR: [{ branchId: session.branchId }, { team: { branchId: session.branchId } }],
      ...teamLeadTeamFilter,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { name: "asc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          role: true,
          teamId: true,
          branchId: true,
          team: { select: { id: true, name: true, branchId: true } },
          branch: { select: { name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        teamName: u.team?.name ?? null,
        branchName: u.branch?.name ?? null,
        teamId: u.teamId,
        branchId: u.branchId ?? u.team?.branchId ?? null,
      })),
      total,
    };
  } catch (e) {
    if (isPrismaConnectionError(e)) return { users: [], total: 0 };
    throw e;
  }
}

export async function createUser(data: CreateUserData) {
  const session = await authorizeBranchAction("MANAGE_USERS", "createUser");

  let resolvedBranchId: string | null = data.branchId ?? null;
  if (session.role === "ADMIN" && data.role !== "ADMIN") {
    if (data.branchId) resolvedBranchId = data.branchId;
    else if (data.role === "BRANCH_MANAGER" && data.branchCode) {
      const branch = await prisma.branch.findUnique({
        where: { branchCode: data.branchCode },
        select: { id: true },
      });
      resolvedBranchId = branch?.id ?? null;
    }
  }

  if (session.role === "BRANCH_MANAGER" || session.role === "TEAM_LEAD") {
    if (data.role !== "PLAYER") throw new Error("You can only create PLAYER users.");
    if (!session.branchId) throw new Error("Branch manager has no branch assigned.");
    resolvedBranchId = session.branchId;
    if (data.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: data.teamId },
        select: { branchId: true },
      });
      if (team?.branchId !== session.branchId) throw new Error("Team must be in your branch.");
      if (session.role === "TEAM_LEAD") {
        await authorizeBranchAction("MANAGE_USERS", "createUser", {
          branchId: session.branchId,
          targetTeamId: data.teamId,
        });
      }
    }
  } else {
    if ((data.role === "ADMIN" || data.role === "BRANCH_MANAGER") && session.role !== "ADMIN") {
      throw new Error("Only ADMIN can create ADMIN or BRANCH_MANAGER users.");
    }
  }

  const emailNorm = data.email.trim().toLowerCase();
  if (!emailNorm) throw new Error("Email is required.");
  if (!data.password || data.password.length < 6) throw new Error("Password must be at least 6 characters.");

  if (data.role === "PLAYER" && !resolvedBranchId && data.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      select: { branchId: true },
    });
    resolvedBranchId = team?.branchId ?? null;
  }

  const passwordHash = await hashPassword(data.password);
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: emailNorm,
        passwordHash,
        mustChangePassword: true,
        role: data.role,
        teamId: data.role === "ADMIN" ? null : data.teamId ?? undefined,
        branchId: data.role === "ADMIN" ? null : resolvedBranchId ?? undefined,
      },
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      throw new Error("A user with this email already exists.");
    }
    throw e;
  }

  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true },
  });

  await logActivity(session, actor?.name ?? "User", "USER_CREATE", {
    entityType: "User",
    entityId: user.id,
    branchId: resolvedBranchId,
    metadata: { name: user.name, role: user.role },
  });

  return user;
}

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await authorize(["ADMIN"], "updateUserRole");
  if (newRole === "TEAM_LEAD") {
    throw new Error(
      "Use the Delegation panel on the Users page to promote a player to TEAM_LEAD with permissions."
    );
  }
  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      ...(newRole === "ADMIN" && { branchId: null, teamId: null }),
    },
  });

  if (before?.role === "TEAM_LEAD" || newRole === "PLAYER") {
    await prisma.userPermissionGrant.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true },
  });

  await logActivity(session, actor?.name ?? "Admin", "USER_UPDATE_ROLE", {
    entityType: "User",
    entityId: userId,
    metadata: { targetName: before?.name, oldRole: before?.role, newRole },
  });
}

export type UpdateUserData = {
  name?: string;
  email?: string | null;
  teamId?: string | null;
};

/** Branch manager or team lead can update name, email, team for users in their branch. */
export async function updateUser(userId: string, data: UpdateUserData) {
  const session = await authorizeBranchAction("MANAGE_USERS", "updateUser");
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true, teamId: true, team: { select: { branchId: true } }, name: true },
  });
  if (!target) throw new Error("User not found");

  const targetBranchId = target.branchId ?? target.team?.branchId ?? null;
  if (session.role === "BRANCH_MANAGER" || session.role === "TEAM_LEAD") {
    if (!session.branchId || targetBranchId !== session.branchId) {
      throw new Error("You can only edit users in your branch.");
    }
    await assertTeamLeadCanAccessTarget(session, "MANAGE_USERS", userId);
  }

  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, teamId: true },
  });

  if (session.role === "TEAM_LEAD" && data.teamId !== undefined && data.teamId) {
    await authorizeBranchAction("MANAGE_USERS", "updateUserTeam", {
      branchId: targetBranchId,
      targetTeamId: data.teamId,
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.teamId !== undefined && { teamId: data.teamId || null }),
    },
  });

  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true },
  });

  await logActivity(session, actor?.name ?? "User", "USER_UPDATE", {
    entityType: "User",
    entityId: userId,
    branchId: targetBranchId,
    metadata: { targetName: before?.name, updates: data },
  });
}

const DISPLAY_NAME_MIN_LEN = 1;
const DISPLAY_NAME_MAX_LEN = 120;

/** Any signed-in user may update only their own display name (for leaderboards and UI). */
export async function updateMyDisplayName(
  rawName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerAuthSession();
  if (!session) return { ok: false, error: "Not signed in." };

  const name = rawName.trim().replace(/\s+/g, " ");
  if (name.length < DISPLAY_NAME_MIN_LEN) {
    return { ok: false, error: "Enter a display name (at least one character)." };
  }
  if (name.length > DISPLAY_NAME_MAX_LEN) {
    return {
      ok: false,
      error: `Display name must be ${DISPLAY_NAME_MAX_LEN} characters or fewer.`,
    };
  }

  try {
    const before = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    });
    if (!before) return { ok: false, error: "Account not found." };
    if (before.name === name) return { ok: true };

    await prisma.user.update({
      where: { id: session.id },
      data: { name },
    });

    const actor = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    });

    await logActivity(session, actor?.name ?? name, "USER_PROFILE_NAME_UPDATE", {
      entityType: "User",
      entityId: session.id,
      branchId: session.branchId,
      metadata: { previousName: before.name, newName: name, selfService: true },
    });

    return { ok: true };
  } catch (e) {
    if (isPrismaConnectionError(e)) {
      return { ok: false, error: "Could not reach the database. Try again shortly." };
    }
    console.error("[updateMyDisplayName]", e);
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

/** Branch manager or team lead can reset password for users in their branch. */
export async function resetUserPassword(userId: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const session = await authorizeBranchAction("MANAGE_USERS", "resetUserPassword");
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true, team: { select: { branchId: true } }, name: true },
  });

  if (!target) return { ok: false, error: "User not found" };

  const targetBranchId = target.branchId ?? target.team?.branchId ?? null;
  if (session.role === "BRANCH_MANAGER" || session.role === "TEAM_LEAD") {
    if (!session.branchId || targetBranchId !== session.branchId) {
      return { ok: false, error: "You can only reset password for users in your branch." };
    }
    try {
      await assertTeamLeadCanAccessTarget(session, "MANAGE_USERS", userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Not allowed." };
    }
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });

  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true },
  });

  await logActivity(session, actor?.name ?? "User", "USER_RESET_PASSWORD", {
    entityType: "User",
    entityId: userId,
    branchId: targetBranchId,
    metadata: { targetName: target.name },
  });

  return { ok: true };
}

export async function getTeamsForAdmin(
  branchIdFilter?: string | null,
  options?: { limit?: number; offset?: number }
): Promise<{ teams: { id: string; name: string; branchId: string | null; branchName: string | null }[]; total: number }> {
  const session = await authorizeBranchAction("MANAGE_TEAMS", "getTeamsForAdmin", {
    branchId: branchIdFilter ?? undefined,
  });
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const offset = Math.max(options?.offset ?? 0, 0);
  const teamLeadTeamScope =
    session.role === "TEAM_LEAD" && session.branchId
      ? (await getActiveGrantsForUser(session.id, session.branchId))
          .filter((g) => g.permission === "MANAGE_TEAMS")
          .map((g) => g.teamScopeKey)
      : null;
  const teamScopeFilter =
    teamLeadTeamScope && teamLeadTeamScope.length > 0 && !teamLeadTeamScope.includes("")
      ? { id: { in: teamLeadTeamScope } }
      : {};

  const where =
    (session.role === "BRANCH_MANAGER" || session.role === "TEAM_LEAD") && session.branchId
      ? { branchId: session.branchId, ...teamScopeFilter }
      : session.role === "ADMIN" && branchIdFilter != null
        ? { branchId: branchIdFilter }
        : undefined;

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        branchId: true,
        branch: { select: { name: true } },
      },
    }),
    prisma.team.count({ where: where ?? {} }),
  ]);

  return {
    teams: teams.map((t) => ({
      id: t.id,
      name: t.name,
      branchId: t.branchId,
      branchName: t.branch?.name ?? null,
    })),
    total,
  };
}

/** Branches from DB for admin dropdowns (users, missions). Returns DB branches. */
export async function getBranchesForAdmin(): Promise<{ id: string; branchCode: string | null; companyName: string }[]> {
  const branches = await branchesService.getBranchesFromDb();
  return branches.map((b) => ({
    id: b.id,
    branchCode: b.branchCode,
    companyName: b.name,
  }));
}

export type TransferPlayerBranchInput = {
  userId: string;
  toBranchId: string;
  toTeamId?: string | null;
  reason?: string | null;
};

const OPEN_TASK_STATUSES = ["PENDING", "IN_PROGRESS", "SUBMITTED"] as const;

/**
 * Transfer a player to another branch, preserving XP and rank.
 * ADMIN or source-branch BRANCH_MANAGER may initiate instantly.
 */
export async function transferPlayerBranch(
  input: TransferPlayerBranchInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerAuthSession();
  if (!session) return { ok: false, error: "Not authenticated." };

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      name: true,
      role: true,
      branchId: true,
      teamId: true,
      team: { select: { branchId: true } },
    },
  });
  if (!target) return { ok: false, error: "User not found." };
  if (target.id === session.id) {
    return { ok: false, error: "You cannot transfer your own account." };
  }
  if (target.role !== "PLAYER" && target.role !== "TEAM_LEAD") {
    return { ok: false, error: "Only players and team leads can be transferred." };
  }

  const fromBranchId = target.branchId ?? target.team?.branchId ?? null;
  if (!fromBranchId) return { ok: false, error: "User is not assigned to a branch." };
  if (fromBranchId === input.toBranchId) {
    return { ok: false, error: "User is already in that branch." };
  }

  if (session.role === "BRANCH_MANAGER") {
    if (!session.branchId || session.branchId !== fromBranchId) {
      return { ok: false, error: "You can only transfer players out of your branch." };
    }
  } else if (session.role !== "ADMIN") {
    return { ok: false, error: "Only admins and branch managers can transfer players." };
  }

  const destBranch = await prisma.branch.findUnique({
    where: { id: input.toBranchId },
    select: { id: true, name: true },
  });
  if (!destBranch) return { ok: false, error: "Destination branch not found." };

  if (input.toTeamId) {
    const team = await prisma.team.findUnique({
      where: { id: input.toTeamId },
      select: { branchId: true },
    });
    if (!team || team.branchId !== input.toBranchId) {
      return { ok: false, error: "Destination team must belong to the destination branch." };
    }
  }

  const openTasks = await prisma.missionTask.count({
    where: {
      assigneeId: target.id,
      status: { in: [...OPEN_TASK_STATUSES] },
      mission: { branchId: fromBranchId },
    },
  });
  if (openTasks > 0) {
    return {
      ok: false,
      error: `Cannot transfer: ${openTasks} open mission task(s) in the current branch. Complete or reassign them first.`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.zone.updateMany({
        where: { ownerId: target.id, branchId: fromBranchId },
        data: { ownerId: null },
      });

      if (target.role === "TEAM_LEAD") {
        await tx.userPermissionGrant.updateMany({
          where: { userId: target.id, branchId: fromBranchId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      await tx.user.update({
        where: { id: target.id },
        data: {
          branchId: input.toBranchId,
          teamId: input.toTeamId ?? null,
          ...(target.role === "TEAM_LEAD" ? { role: "PLAYER" as Role } : {}),
        },
      });

      await tx.userBranchTransfer.create({
        data: {
          userId: target.id,
          fromBranchId,
          toBranchId: input.toBranchId,
          initiatedById: session.id,
          reason: input.reason?.trim() || null,
        },
      });
    });

    const actor = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    });

    await logActivity(session, actor?.name ?? "User", "USER_BRANCH_TRANSFER", {
      entityType: "User",
      entityId: target.id,
      branchId: input.toBranchId,
      metadata: {
        targetName: target.name,
        fromBranchId,
        toBranchId: input.toBranchId,
        toTeamId: input.toTeamId ?? null,
        reason: input.reason ?? null,
      },
    });

    return { ok: true };
  } catch (e) {
    console.error("[transferPlayerBranch]", e);
    return { ok: false, error: e instanceof Error ? e.message : "Transfer failed." };
  }
}

export async function getTransferBlockers(userId: string): Promise<{
  openTaskCount: number;
  ownedZoneCount: number;
}> {
  const session = await authorize(["ADMIN", "BRANCH_MANAGER"], "getTransferBlockers");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true, team: { select: { branchId: true } } },
  });
  if (!user) return { openTaskCount: 0, ownedZoneCount: 0 };
  const branchId = user.branchId ?? user.team?.branchId ?? null;
  if (!branchId) return { openTaskCount: 0, ownedZoneCount: 0 };

  if (session.role === "BRANCH_MANAGER") {
    if (!session.branchId || session.branchId !== branchId) {
      throw new UnauthorizedError("You can only check transfer blockers for users in your branch.");
    }
  }

  const [openTaskCount, ownedZoneCount] = await Promise.all([
    prisma.missionTask.count({
      where: {
        assigneeId: userId,
        status: { in: [...OPEN_TASK_STATUSES] },
        mission: { branchId },
      },
    }),
    prisma.zone.count({ where: { ownerId: userId, branchId } }),
  ]);
  return { openTaskCount, ownedZoneCount };
}

