"use client";

import { useState } from "react";
import { MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PortalLoadingInline } from "@/components/ui/portal-loading";
import {
  useCellMerchantsData,
  type CellLeadRow,
  type CellMerchantRow,
} from "@/components/map/useCellMerchantsData";

type Filter = "all" | "scouted" | "registered";

const CATEGORY_TINTS = [
  "bg-sky-500/20 text-sky-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-violet-500/20 text-violet-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
];

function categoryTint(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_TINTS[Math.abs(hash) % CATEGORY_TINTS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-colors",
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function LeadIntelCard({ lead }: { lead: CellLeadRow }) {
  const tint = categoryTint(lead.category);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/35">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
          tint
        )}
      >
        {initials(lead.businessName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-semibold text-foreground">
          {lead.businessName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium", tint)}>
            {lead.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <User className="size-3" />
            {lead.scoutedBy.name}
          </span>
        </div>
      </div>
    </li>
  );
}

function MerchantIntelCard({ merchant }: { merchant: CellMerchantRow }) {
  const category = merchant.lead?.category ?? "Merchant";
  const displayName = merchant.lead?.businessName ?? merchant.ownerName;
  const tint = categoryTint(category);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/35">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
          tint
        )}
      >
        {initials(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-semibold text-foreground">
          {displayName}
          {merchant.lead ? "" : ` · ${merchant.ownerName}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium", tint)}>
            {category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <User className="size-3" />
            {merchant.inductedBy.name}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyIntel({ filter }: { filter: Filter }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center">
      <MapPin className="size-8 text-muted-foreground/50" />
      <p className="font-mono text-sm text-muted-foreground">
        {filter === "all"
          ? "No merchants in this block yet."
          : filter === "scouted"
            ? "No scouted leads here."
            : "No registered merchants here."}
      </p>
      <p className="text-xs text-muted-foreground/70">
        Scout the zone to start building your intel.
      </p>
    </div>
  );
}

export function PlayerMerchantsIntel({
  zoneCode,
  branchId,
  cellCoordinates,
}: {
  zoneCode: string;
  branchId?: string | null;
  cellCoordinates?: { lat: number; lng: number }[] | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { leads, merchants, loading } = useCellMerchantsData({
    zoneCode,
    branchId,
    cellCoordinates,
  });

  if (loading) {
    return (
      <section className="border-t border-border/60 pt-5">
        <PortalLoadingInline className="min-h-[100px] py-4" />
      </section>
    );
  }

  const showScouted = filter === "all" || filter === "scouted";
  const showRegistered = filter === "all" || filter === "registered";
  const isEmpty =
    (filter === "all" && leads.length === 0 && merchants.length === 0) ||
    (filter === "scouted" && leads.length === 0) ||
    (filter === "registered" && merchants.length === 0);

  return (
    <section
      className="flex flex-col gap-4 border-t border-border/60 pt-5 animate-hero-line"
      style={{ animationDelay: "160ms" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Merchants in this block
        </span>
        <div
          className="flex rounded-full border border-border/60 bg-muted/30 p-0.5"
          role="tablist"
        >
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="All" />
          <FilterPill
            active={filter === "scouted"}
            onClick={() => setFilter("scouted")}
            label="Scouted"
          />
          <FilterPill
            active={filter === "registered"}
            onClick={() => setFilter("registered")}
            label="Registered"
          />
        </div>
      </div>

      {isEmpty ? (
        <EmptyIntel filter={filter} />
      ) : (
        <div className="flex flex-col gap-4">
          {showScouted && leads.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Scouted ({leads.length})
              </p>
              <ul className="flex flex-col gap-2">
                {leads.map((l) => (
                  <LeadIntelCard key={l.id} lead={l} />
                ))}
              </ul>
            </div>
          )}
          {showRegistered && merchants.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Registered ({merchants.length})
              </p>
              <ul className="flex flex-col gap-2">
                {merchants.map((m) => (
                  <MerchantIntelCard key={m.id} merchant={m} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
