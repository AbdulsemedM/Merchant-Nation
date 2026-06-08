"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUserRole } from "@/contexts/UserRoleContext";
import { getLocationPromptChoice } from "@/lib/user-location";
import { LocationPromptDialog } from "./LocationPromptDialog";

const EXCLUDED_PATHS = ["/login", "/change-password"];

export function LocationPromptGate() {
  const pathname = usePathname();
  const { userId } = useUserRole();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId || EXCLUDED_PATHS.includes(pathname)) {
      setOpen(false);
      return;
    }
    if (getLocationPromptChoice() === null) {
      setOpen(true);
    }
  }, [userId, pathname]);

  if (!open) return null;

  return (
    <LocationPromptDialog
      open={open}
      onComplete={() => setOpen(false)}
    />
  );
}
