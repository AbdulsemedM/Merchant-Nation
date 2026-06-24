"use server";

import { prisma } from "@/lib/prisma";
import { rankFromXp } from "@/lib/rank";
import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/auth";
import { getCurrentUser } from "@/app/actions/users";
import { getRanks } from "@/app/actions/ranks";
import { logActivity } from "@/app/actions/activity-log";
import { updateUserStreak } from "@/backend/services/streak-service";
import { checkAndUnlockAchievements } from "@/backend/services/achievement-service";
import { routeNotification } from "@/backend/services/notification-router-service";
import { getUserFacingErrorMessage } from "@/lib/errors";
import { isInductionProductKey } from "@/lib/induction-products";
import { zoneStorageCode } from "@/lib/zoneCode";

const SCOUT_XP = 20;

async function getOrCreateDevUserId(): Promise<string> {
  const envId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  if (envId) {
    const u = await prisma.user.findUnique({ where: { id: envId } });
    if (u) return u.id;
  }
  let user = await prisma.user.findFirst();
  if (user) return user.id;
  const defaultRank = await prisma.rank.findFirst({
    orderBy: { displayOrder: "asc" },
    select: { code: true },
  });
  user = await prisma.user.create({
    data: {
      name: "Dev Officer",
      rank: defaultRank?.code ?? "CADET",
      xp: 0,
    },
  });
  return user.id;
}

export type ScoutZoneInput = {
  zoneCode: string;
  coordinates: Array<{ lat: number; lng: number }>;
  zoneId?: string | null;
  /** When provided, new zones are created with this branchId so they appear in branch territory. */
  branchId?: string | null;
  businessName: string;
  category: string;
  estimatedVolume: string; // "LOW" | "MEDIUM" | "HIGH" or free text
  externalBankIds?: string[];
  locationLat: number;
  locationLng: number;
  photoUrl?: string | null;
  /** When provided, link this lead to the task (task must be assigned to current user). */
  missionTaskId?: string | null;
};

/** Alias for scoutZone - creates a lead from map/scout form. */
export async function createLead(input: ScoutZoneInput): Promise<{ ok: boolean; error?: string; unlockedBadges?: string[] }> {
  return scoutZone(input);
}

export async function scoutZone(input: ScoutZoneInput): Promise<{ ok: boolean; error?: string; unlockedBadges?: string[] }> {
  try {
    const session = await authorize(["BRANCH_MANAGER", "PLAYER"], "scoutZone");
    const userId = session.id;

    const user = await getCurrentUser(userId);
    const resolvedBranchId = input.branchId ?? session.branchId ?? user?.branchId ?? user?.team?.branchId ?? null;

    let zoneId = input.zoneId;
    if (!zoneId) {
      const storageCode = zoneStorageCode(resolvedBranchId, input.zoneCode);
      let zone = await prisma.zone.findFirst({
        where: resolvedBranchId
          ? {
              branchId: resolvedBranchId,
              OR: [{ code: storageCode }, { code: input.zoneCode }],
            }
          : { code: input.zoneCode },
      });

      if (!zone) {
        zone = await prisma.zone.create({
          data: {
            code: storageCode,
            coordinates: input.coordinates as object,
            status: "UNSEEN",
            ownerId: userId,
            ...(resolvedBranchId && { branchId: resolvedBranchId }),
          },
        });
      }
      zoneId = zone.id;
    } else {
      if (resolvedBranchId) {
        await prisma.zone.update({
          where: { id: zoneId },
          data: { branchId: resolvedBranchId },
        }).catch(() => {});
      }
    }

    let missionTaskId: string | null = null;
    if (input.missionTaskId && session?.id) {
      const ok = await canLinkLeadToTask(session.id, input.missionTaskId);
      if (ok) missionTaskId = input.missionTaskId;
    }

    const lead = await prisma.lead.create({
      data: {
        businessName: input.businessName,
        category: input.category,
        estimatedVolume: input.estimatedVolume,
        externalBankIds: input.externalBankIds ?? [],
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        photoUrl: input.photoUrl ?? undefined,
        status: "NEW",
        zoneId,
        scoutedById: userId,
        ...(missionTaskId && { missionTaskId }),
      },
    });

    // Count streak as soon as a scout is persisted, even if later
    // non-critical enrichment (rank/notifications) fails.
    await updateUserStreak(userId);

    await prisma.zone.update({
      where: { id: zoneId },
      data: { status: "SCOUTED", ownerId: userId },
    });

    // Keep territory dashboard in sync with scouting activity.
    await prisma.territoryCell.updateMany({
      where: {
        code: input.zoneCode,
        ...(resolvedBranchId ? { branchId: resolvedBranchId } : {}),
      },
      data: { status: "SCOUTED" },
    });

    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const newXp = dbUser.xp + SCOUT_XP;
    const ranks = await getRanks();
    const newRank = rankFromXp(ranks, newXp);
    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, rank: newRank },
    });

    // Unlock streak badges (7-day, 14-day, etc.) and other eligible achievements.
    const unlockedBadges = await checkAndUnlockAchievements(userId);
    await routeNotification({
      userId,
      type: "SCOUT_SUBMITTED",
      title: "✅ Scout submitted",
      message: `${input.businessName} added successfully. Your streak and heatmap are updated.`,
      priority: "NORMAL",
      actionUrl: "/profile",
      metadata: {
        zoneCode: input.zoneCode,
        businessName: input.businessName,
        unlockedBadges,
      },
    });

    if (session) {
      const zone = await prisma.zone.findUnique({
        where: { id: zoneId },
        select: { branchId: true },
      });
      const actor = await prisma.user.findUnique({
        where: { id: session.id },
        select: { name: true },
      });
      await logActivity(session, actor?.name ?? "User", "LEAD_SCOUT", {
        entityType: "Lead",
        entityId: lead.id,
        branchId: zone?.branchId ?? null,
        metadata: { businessName: input.businessName, zoneCode: input.zoneCode },
      });
    }

    revalidatePath("/");
    revalidatePath("/profile");
    return { ok: true, unlockedBadges };
  } catch (e) {
    console.error("scoutZone error", e);
    const message = getUserFacingErrorMessage(e, "Scout failed. Please try again.");
    if (message === "That value is already in use. Please try a different one.") {
      return {
        ok: false,
        error:
          "This map block is already registered under another branch. Try scouting again or contact your branch manager.",
      };
    }
    return { ok: false, error: message };
  }
}

/** Update a lead's location (e.g. when inducting and user chooses device location). BRANCH_MANAGER, PLAYER. Lead must not be converted. */
export async function updateLeadLocation(
  leadId: string,
  locationLat: number,
  locationLng: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await authorize(["BRANCH_MANAGER", "PLAYER"], "updateLeadLocation");
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, status: true },
    });
    if (!lead) return { ok: false, error: "Lead not found" };
    if (lead.status === "CONVERTED") return { ok: false, error: "Lead already converted" };
    await prisma.lead.update({
      where: { id: leadId },
      data: { locationLat, locationLng },
    });
    revalidatePath("/");
    revalidatePath(`/induct/${leadId}`);
    return { ok: true };
  } catch (e) {
    console.error("updateLeadLocation error", e);
    return { ok: false, error: getUserFacingErrorMessage(e, "Update failed. Please try again.") };
  }
}

async function assertLeadEditable(leadId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, status: true },
  });
  if (!lead) return { ok: false, error: "Lead not found" };
  if (lead.status === "CONVERTED") return { ok: false, error: "Lead already converted" };
  return { ok: true };
}

/** Save a note about the merchant during induction. BRANCH_MANAGER, PLAYER. */
export async function updateLeadInductionNote(
  leadId: string,
  note: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await authorize(["BRANCH_MANAGER", "PLAYER"], "updateLeadInductionNote");
    const editable = await assertLeadEditable(leadId);
    if (!editable.ok) return editable;
    await prisma.lead.update({
      where: { id: leadId },
      data: { inductionNote: note.trim() || null },
    });
    revalidatePath(`/induct/${leadId}`);
    return { ok: true };
  } catch (e) {
    console.error("updateLeadInductionNote error", e);
    return { ok: false, error: getUserFacingErrorMessage(e, "Failed to save note. Please try again.") };
  }
}

/** Record which products the merchant may want in the future. BRANCH_MANAGER, PLAYER. */
export async function updateLeadFutureProductInterests(
  leadId: string,
  interests: string[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    await authorize(["BRANCH_MANAGER", "PLAYER"], "updateLeadFutureProductInterests");
    const editable = await assertLeadEditable(leadId);
    if (!editable.ok) return editable;
    const valid = interests.filter(isInductionProductKey);
    await prisma.lead.update({
      where: { id: leadId },
      data: { futureProductInterests: valid },
    });
    revalidatePath(`/induct/${leadId}`);
    return { ok: true };
  } catch (e) {
    console.error("updateLeadFutureProductInterests error", e);
    return {
      ok: false,
      error: getUserFacingErrorMessage(e, "Failed to save product interests. Please try again."),
    };
  }
}

/** Record which products the merchant is already registered for. BRANCH_MANAGER, PLAYER. */
export async function updateLeadRegisteredProductInterests(
  leadId: string,
  registered: string[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    await authorize(["BRANCH_MANAGER", "PLAYER"], "updateLeadRegisteredProductInterests");
    const editable = await assertLeadEditable(leadId);
    if (!editable.ok) return editable;
    const valid = registered.filter(isInductionProductKey);
    await prisma.lead.update({
      where: { id: leadId },
      data: { registeredProductInterests: valid },
    });
    revalidatePath(`/induct/${leadId}`);
    return { ok: true };
  } catch (e) {
    console.error("updateLeadRegisteredProductInterests error", e);
    return {
      ok: false,
      error: getUserFacingErrorMessage(e, "Failed to save registered products. Please try again."),
    };
  }
}

/** Returns true if task exists, is assigned to userId, and status is PENDING or IN_PROGRESS. */
async function canLinkLeadToTask(userId: string, taskId: string): Promise<boolean> {
  const task = await prisma.missionTask.findUnique({
    where: { id: taskId },
    select: { assigneeId: true, status: true },
  });
  return task?.assigneeId === userId && (task.status === "PENDING" || task.status === "IN_PROGRESS");
}

export type CreateLeadForTaskReportData = {
  missionTaskId: string;
  businessName: string;
  category: string;
  locationLat: number;
  locationLng: number;
  estimatedVolume?: string | null; // "LOW" | "MEDIUM" | "HIGH"
  taskReportType?: string | null; // SCOUTED | CAPTURED | FORTIFIED
  photoUrl?: string | null;
};

/** Create a lead as part of a task report. Creates a task zone if needed (zoneId required). */
export async function createLeadForTaskReport(
  data: CreateLeadForTaskReportData
): Promise<{ ok: boolean; error?: string; leadId?: string }> {
  try {
    const session = await authorize(["PLAYER"], "createLeadForTaskReport");
    const task = await prisma.missionTask.findUnique({
      where: { id: data.missionTaskId },
      include: { mission: { select: { branchId: true } } },
    });
    if (!task) return { ok: false, error: "Task not found" };
    if (task.assigneeId !== session.id) return { ok: false, error: "You can only add merchants to your own tasks." };
    if (task.status !== "PENDING" && task.status !== "IN_PROGRESS") {
      return { ok: false, error: "Task is not in a state that allows adding merchants." };
    }

    const taskZoneCode = `TASK-${data.missionTaskId}`;
    let zone = await prisma.zone.findUnique({ where: { code: taskZoneCode } });
    if (!zone) {
      zone = await prisma.zone.create({
        data: {
          code: taskZoneCode,
          coordinates: [],
          status: "UNSEEN",
          ownerId: session.id,
        },
      });
    }

    const lead = await prisma.lead.create({
      data: {
        businessName: data.businessName.trim(),
        category: data.category.trim(),
        estimatedVolume: data.estimatedVolume ?? "MEDIUM",
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        photoUrl: data.photoUrl ?? undefined,
        status: "NEW",
        zoneId: zone.id,
        scoutedById: session.id,
        missionTaskId: data.missionTaskId,
        taskReportType: data.taskReportType ?? undefined,
      },
    });

    // Task-report scouting is still a scout action and should advance/restart streak.
    await updateUserStreak(session.id);

    const actor = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    });
    await logActivity(session, actor?.name ?? "User", "LEAD_ADD_TO_TASK_REPORT", {
      entityType: "Lead",
      entityId: lead.id,
      branchId: task.mission.branchId ?? null,
      metadata: { missionTaskId: data.missionTaskId, businessName: lead.businessName },
    });

    revalidatePath("/missions");
    revalidatePath(`/missions/task/${data.missionTaskId}`);
    revalidatePath("/profile");
    return { ok: true, leadId: lead.id };
  } catch (e) {
    console.error("createLeadForTaskReport error", e);
    return {
      ok: false,
      error: getUserFacingErrorMessage(e, "Failed to add merchant. Please try again."),
    };
  }
}
