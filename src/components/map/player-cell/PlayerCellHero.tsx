"use client";

import { X } from "lucide-react";
import { DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MapZoneStatus } from "@/lib/zoneStatusColors";
import { ZONE_STATUS_COLORS } from "@/lib/zoneStatusColors";

const STATUS_GLOW: Record<MapZoneStatus, string> = {
  UNSEEN: "shadow-[0_0_40px_rgba(30,58,95,0.5)]",
  SCOUTED: "shadow-[0_0_40px_rgba(56,189,248,0.35)]",
  CAPTURED: "shadow-[0_0_40px_rgba(34,197,94,0.35)]",
  FORTIFIED: "shadow-[0_0_40px_rgba(249,115,22,0.35)]",
  AT_RISK: "shadow-[0_0_40px_rgba(239,68,68,0.35)]",
  LOST: "shadow-[0_0_40px_rgba(124,45,18,0.5)]",
};

export function PlayerCellHero({
  zoneCode,
  status,
}: {
  zoneCode: string;
  status: MapZoneStatus;
}) {
  const accentColor = ZONE_STATUS_COLORS[status ?? "UNSEEN"];
  const statusLabel = (status ?? "UNSEEN").replace("_", " ");

  return (
    <div
      className={cn(
        "relative -mx-0 overflow-hidden rounded-t-xl px-4 pb-5 pt-4 animate-hero-enter",
        STATUS_GLOW[status ?? "UNSEEN"]
      )}
      style={{
        background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 55%), linear-gradient(180deg, oklch(0.205 0 0) 0%, oklch(0.205 0 0 / 0.6) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(${accentColor} 1px, transparent 1px),
            linear-gradient(90deg, ${accentColor} 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: `${accentColor}30` }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <DrawerTitle
            className="font-mono text-2xl font-bold tracking-tight"
            style={{
              color: accentColor,
              textShadow: `0 0 24px ${accentColor}60`,
            }}
          >
            {zoneCode}
          </DrawerTitle>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-sm"
            style={{
              borderColor: `${accentColor}50`,
              backgroundColor: `${accentColor}15`,
            }}
          >
            <span
              className="size-2 shrink-0 rounded-full animate-status-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="font-mono text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-black/40"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </DrawerClose>
      </div>
    </div>
  );
}
