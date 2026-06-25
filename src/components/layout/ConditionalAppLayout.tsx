"use client";

import { usePathname } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useUserRole } from "@/contexts/UserRoleContext";
import { NotificationHost } from "@/components/notifications/NotificationHost";
import { LocationPromptGate } from "@/components/location/LocationPromptGate";

export function ConditionalAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, branchPermissions } = useUserRole();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const useSidebar =
    role === "ADMIN" ||
    role === "BRANCH_MANAGER" ||
    (role === "TEAM_LEAD" && branchPermissions.length > 0);
  return (
    <>
      <LocationPromptGate />
      <NotificationHost />
      {useSidebar ? (
        <SidebarLayout>{children}</SidebarLayout>
      ) : (
        <MobileLayout>{children}</MobileLayout>
      )}
    </>
  );
}
