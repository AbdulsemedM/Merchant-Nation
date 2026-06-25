"use server";

import * as delegation from "@/backend/services/delegation-service";
import type { BranchPermission } from "@/lib/branch-permissions";
import { getUserFacingErrorMessage } from "@/lib/errors";

export type { DelegationGrantRow } from "@/backend/services/delegation-service";

export async function getDelegationGrantsForUser(userId: string, branchId: string) {
  return delegation.getDelegationGrantsForUser(userId, branchId);
}

export async function grantDelegation(input: {
  userId: string;
  permissions: BranchPermission[];
  teamId?: string | null;
  expiresAt?: string | null;
}) {
  try {
    await delegation.grantDelegation({
      userId: input.userId,
      permissions: input.permissions,
      teamId: input.teamId,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: getUserFacingErrorMessage(e, "Failed to grant delegation.") };
  }
}

export async function revokeDelegation(userId: string, permissions?: BranchPermission[]) {
  try {
    await delegation.revokeDelegation(userId, permissions);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: getUserFacingErrorMessage(e, "Failed to revoke delegation.") };
  }
}
