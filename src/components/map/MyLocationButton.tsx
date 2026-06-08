"use client";

import { LocateFixed } from "lucide-react";

export function MyLocationButton({ onCenter }: { onCenter: () => void }) {
  return (
    <button
      type="button"
      onClick={onCenter}
      className="absolute bottom-24 right-4 z-10 flex size-12 items-center justify-center rounded-full border border-border bg-card shadow-lg transition hover:bg-muted"
      aria-label="Center on my location"
    >
      <LocateFixed className="size-6 text-primary" />
    </button>
  );
}
