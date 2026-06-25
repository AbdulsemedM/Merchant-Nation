import type { AuthSession } from "@/lib/auth";
import { getActivePermissionsForSession } from "@/lib/auth";
import { NAV_HREF_PERMISSION, type BranchPermission } from "@/lib/branch-permissions";

export async function canAccessAdminPath(
  session: AuthSession | null,
  pathname: string
): Promise<boolean> {
  if (!session) return false;
  if (session.role === "ADMIN" || session.role === "BRANCH_MANAGER") return true;
  if (session.role !== "TEAM_LEAD") return false;

  const permissions = await getActivePermissionsForSession(session);
  if (permissions.length === 0) return false;

  if (pathname.startsWith("/admin/missions")) {
    return permissions.includes("MANAGE_MISSIONS");
  }

  for (const [href, permission] of Object.entries(NAV_HREF_PERMISSION)) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return permissions.includes(permission);
    }
  }

  return false;
}

export function permissionForAdminPath(pathname: string): BranchPermission | null {
  if (pathname.startsWith("/admin/missions")) return "MANAGE_MISSIONS";
  for (const [href, permission] of Object.entries(NAV_HREF_PERMISSION)) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return permission;
    }
  }
  return null;
}
