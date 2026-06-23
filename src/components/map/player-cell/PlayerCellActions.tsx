"use client";

import { Binoculars, Lock, Store, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function ActionCard({
  icon: Icon,
  title,
  subtitle,
  variant,
  onClick,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  variant: "primary" | "secondary";
  onClick: () => void;
  className?: string;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-2 rounded-xl px-4 py-4 text-left transition-transform active:scale-[0.98]",
        isPrimary
          ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,173,239,0.25)]"
          : "bg-gradient-to-br from-secondary/90 to-secondary text-secondary-foreground shadow-[0_4px_20px_rgba(228,133,37,0.25)]",
        className
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          isPrimary ? "bg-white/20" : "bg-white/20"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-mono text-sm font-bold">{title}</p>
        <p className={cn("mt-0.5 text-xs", isPrimary ? "text-primary-foreground/80" : "text-secondary-foreground/80")}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}

export function PlayerCellActions({
  onScout,
  onInduct,
}: {
  onScout: () => void;
  onInduct?: () => void;
}) {
  const bothVisible = !!onInduct;

  return (
    <div
      className="flex flex-col gap-3 animate-hero-line"
      style={{ animationDelay: "120ms" }}
    >
      <div className={cn("grid gap-3", bothVisible ? "grid-cols-2" : "grid-cols-1")}>
        <ActionCard
          icon={Binoculars}
          title="Scout Zone"
          subtitle="Submit recon report"
          variant="primary"
          onClick={onScout}
        />
        {onInduct && (
          <ActionCard
            icon={Store}
            title="Induct Merchant"
            subtitle="Onboard a lead"
            variant="secondary"
            onClick={onInduct}
          />
        )}
      </div>
      {!onInduct && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3">
          <Lock className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Induct unlocks after scouting — capture leads first, then onboard merchants.
          </p>
        </div>
      )}
    </div>
  );
}
