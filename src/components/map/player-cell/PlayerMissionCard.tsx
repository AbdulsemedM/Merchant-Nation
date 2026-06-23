"use client";

import Link from "next/link";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlayerMissionCard({
  task,
}: {
  task: { id: string; title: string; mission: { id: string; name: string } };
}) {
  return (
    <div
      className="animate-hero-line rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-4"
      style={{ animationDelay: "80ms" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
          <Crosshair className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
            Active objective
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{task.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{task.mission.name}</p>
          <Button asChild size="sm" variant="outline" className="mt-3 font-mono text-xs">
            <Link href={`/missions/task/${task.id}`}>View task</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
