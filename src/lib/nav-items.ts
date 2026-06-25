import type { LucideIcon } from "lucide-react";
import {
  Map,
  LayoutDashboard,
  ClipboardList,
  User,
  Users,
  Users2,
  BarChart2,
  FileText,
  Building2,
  Store,
  Shield,
  Tag,
  Landmark,
  Medal,
} from "lucide-react";
import type { Role } from "@/lib/auth";
import type { BranchPermission } from "@/lib/branch-permissions";
import { NAV_HREF_PERMISSION } from "@/lib/branch-permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const dashboardItem: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
];

const mapBaseNavItems: NavItem[] = [
  { href: "/", label: "Map", icon: Map },
  { href: "/missions", label: "Missions", icon: ClipboardList },
  { href: "/report", label: "Report", icon: FileText },
  { href: "/merchants", label: "Merchants", icon: Store },
];

const profileItem: NavItem = { href: "/profile", label: "Profile", icon: User };

const adminNavItems: NavItem[] = [
  { href: "/admin/operational-summary", label: "Operational Summary", icon: BarChart2 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/teams", label: "Teams", icon: Users2 },
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/categories", label: "Scout Categories", icon: Tag },
  { href: "/admin/external-banks", label: "Other Services", icon: Landmark },
  { href: "/admin/ranks", label: "Ranks", icon: Medal },
  { href: "/admin/assets", label: "Deployment Assets", icon: Shield },
];

const branchManagerNavItems: NavItem[] = [
  { href: "/admin/operational-summary", label: "Operational Summary", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/teams", label: "Teams", icon: Users2 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
];

const missionsNavItem: NavItem = { href: "/admin/missions", label: "Missions", icon: ClipboardList };

function filterNavByPermissions(items: NavItem[], permissions: BranchPermission[]): NavItem[] {
  return items.filter((item) => {
    const required = NAV_HREF_PERMISSION[item.href];
    if (!required) return true;
    return permissions.includes(required);
  });
}

/**
 * Returns nav items for the given role. TEAM_LEAD receives a subset based on active grants.
 */
export function getNavItems(
  role: Role | null,
  teamLeadPermissions?: BranchPermission[]
): NavItem[] {
  if (role === "ADMIN") {
    return [
      ...dashboardItem,
      { href: "/missions", label: "Missions", icon: ClipboardList },
      ...adminNavItems,
      profileItem,
    ];
  }
  if (role === "BRANCH_MANAGER") {
    return [...mapBaseNavItems, ...branchManagerNavItems, profileItem];
  }
  if (role === "TEAM_LEAD" && teamLeadPermissions && teamLeadPermissions.length > 0) {
    const adminItems = filterNavByPermissions(branchManagerNavItems, teamLeadPermissions);
    const withMissions = teamLeadPermissions.includes("MANAGE_MISSIONS")
      ? [missionsNavItem, ...adminItems]
      : adminItems;
    return [...mapBaseNavItems, ...withMissions, profileItem];
  }
  return [...mapBaseNavItems, profileItem];
}
