"use server";

import type { Role } from "@/lib/auth";
import type * as usersService from "@/backend/services/users-service";
import * as users from "@/backend/services/users-service";
import { getUserFacingErrorMessage } from "@/lib/errors";

export type CreateUserData = usersService.CreateUserData;
export type UpdateUserData = usersService.UpdateUserData;

export async function getCurrentUser(userId?: string | null) {
  return users.getCurrentUser(userId);
}

export async function getProfileStats(
  userId: string,
  options: { branchId?: string | null; role?: string }
) {
  return users.getProfileStats(userId, options);
}

export async function getLeaderboard(limit = 20, branchId?: string | null) {
  return users.getLeaderboard(limit, branchId);
}

export async function getLeaderboardForDashboard(
  limit: number,
  currentUserId: string,
  branchId?: string | null
) {
  return users.getLeaderboardForDashboard(limit, currentUserId, branchId);
}

export async function getUsersForAdmin(
  branchIdFilter?: string | null,
  options?: { limit?: number; offset?: number }
) {
  return users.getUsersForAdmin(branchIdFilter, options);
}

export async function createUser(data: CreateUserData) {
  try {
    return await users.createUser(data);
  } catch (e) {
    throw new Error(getUserFacingErrorMessage(e, "Failed to create user."));
  }
}

export async function updateUserRole(userId: string, newRole: Role) {
  return users.updateUserRole(userId, newRole);
}

export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    return await users.updateUser(userId, data);
  } catch (e) {
    throw new Error(getUserFacingErrorMessage(e, "Failed to update user."));
  }
}

export async function updateMyDisplayName(name: string) {
  return users.updateMyDisplayName(name);
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    return await users.resetUserPassword(userId, newPassword);
  } catch (e) {
    return { ok: false as const, error: getUserFacingErrorMessage(e, "Failed to reset password.") };
  }
}

export async function getTeamsForAdmin(branchIdFilter?: string | null, options?: { limit?: number; offset?: number }) {
  return users.getTeamsForAdmin(branchIdFilter, options);
}

export async function getBranchesForAdmin() {
  return users.getBranchesForAdmin();
}

