"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/contexts/UserRoleContext";
import { getNavItems } from "@/lib/nav-items";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";
const LOGO_PATH = "/images/Cooperative_Bank_of_Oromia.png";

function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { role, branchPermissions } = useUserRole();
  const navItems = getNavItems(role, branchPermissions);

  return (
    <nav className="flex flex-col gap-0.5 p-2" aria-label="Main">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-mono transition-colors",
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              isActive
                ? collapsed
                  ? "bg-primary/10 text-primary"
                  : "border-l-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="flex min-h-dvh w-full bg-background">
      {/* Desktop sidebar: visible from md up */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-background transition-[width] duration-200 ease-in-out md:flex"
        style={{ width: sidebarWidth }}
        aria-label="Main navigation"
        aria-expanded={!collapsed}
      >
        <div className="flex shrink-0 flex-col border-b border-border">
          <div
            className={cn(
              "flex items-center p-2",
              collapsed ? "justify-center" : "justify-end"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              onClick={toggleCollapsed}
              className={cn(
                "gap-2 font-mono text-xs text-muted-foreground",
                collapsed ? "size-9" : "h-8 px-2"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <>
                  <ChevronLeft className="size-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
          <div
            className={cn(
              "flex flex-col items-center",
              collapsed ? "px-2 pb-3" : "gap-2 px-4 pb-4"
            )}
          >
            <Image
              src={LOGO_PATH}
              alt="Merchant Nation"
              width={collapsed ? 40 : 120}
              height={collapsed ? 40 : 64}
              className={cn(
                "h-auto object-contain",
                collapsed ? "w-10" : "w-full max-w-[140px]"
              )}
              priority
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
          <SidebarNav collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile: hamburger + drawer */}
      <div className="fixed left-0 top-0 z-40 flex h-14 items-center border-b border-border bg-background px-3 md:hidden">
        <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} direction="left">
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="shrink-0"
            >
              <Menu className="size-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent
            className="h-full max-w-[280px] w-[85vw] rounded-none border-r"
            style={{ marginLeft: 0, marginTop: 0 }}
          >
            <DrawerHeader className="flex flex-col items-center gap-2 border-b border-border py-4">
              <Image
                src={LOGO_PATH}
                alt="Merchant Nation"
                width={120}
                height={64}
                className="h-auto w-full max-w-[140px] object-contain"
              />
              <DrawerTitle className="font-mono font-semibold">Merchant Nation</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
        <span className="ml-2 font-mono text-sm font-medium text-foreground">
          Merchant Nation
        </span>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "min-h-0 min-w-0 flex-1 w-full pt-14 transition-[padding-left] duration-200 ease-in-out md:pt-0",
          collapsed ? "md:pl-16" : "md:pl-60"
        )}
      >
        <div className="min-h-dvh w-full max-w-full p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
