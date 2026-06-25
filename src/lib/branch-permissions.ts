export const BRANCH_PERMISSIONS = [
  "MANAGE_USERS",
  "MANAGE_TEAMS",
  "MANAGE_MISSIONS",
  "MANAGE_TERRITORY",
  "VIEW_REPORTS",
] as const;

export type BranchPermission = (typeof BRANCH_PERMISSIONS)[number];

export const BRANCH_PERMISSION_LABELS: Record<BranchPermission, string> = {
  MANAGE_USERS: "Manage users",
  MANAGE_TEAMS: "Manage teams",
  MANAGE_MISSIONS: "Manage missions",
  MANAGE_TERRITORY: "Manage territory",
  VIEW_REPORTS: "View reports",
};

/** Maps admin nav hrefs to required permission for TEAM_LEAD access. */
export const NAV_HREF_PERMISSION: Record<string, BranchPermission> = {
  "/admin/operational-summary": "VIEW_REPORTS",
  "/admin/reports": "VIEW_REPORTS",
  "/admin/users": "MANAGE_USERS",
  "/admin/teams": "MANAGE_TEAMS",
  "/admin/merchants": "VIEW_REPORTS",
};

export function teamScopeKeyFromTeamId(teamId?: string | null): string {
  return teamId?.trim() ? teamId.trim() : "";
}
