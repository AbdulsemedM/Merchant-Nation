import { Flame, Star, Trophy } from "lucide-react";
import { LEADERBOARD, RANKS, XP_PROGRESS } from "../landing-content";

const progressPct = Math.round((XP_PROGRESS.current / XP_PROGRESS.target) * 100);
const xpRemaining = XP_PROGRESS.target - XP_PROGRESS.current;

export function Gameplay() {
  return (
    <section id="gameplay" className="relative overflow-hidden py-24">
      <div className="tactical-grid pointer-events-none absolute inset-0 z-0 opacity-30" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">
              Growth through cooperation
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Field work that actually feels rewarding
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Every scout, induction, and cleared mission earns XP, unlocks new ranks, and pushes
              you up the branch leaderboard. Keep your streak alive and lead the nation.
            </p>

            {/* XP progress */}
            <div className="mt-8 rounded-2xl border border-border/70 bg-card/60 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Trophy className="h-4 w-4 text-primary" /> {XP_PROGRESS.rank}
                </span>
                <span className="text-muted-foreground">
                  {XP_PROGRESS.current.toLocaleString()} / {XP_PROGRESS.target.toLocaleString()} XP
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-accent" />
                {xpRemaining.toLocaleString()} XP to{" "}
                <span className="text-foreground">{XP_PROGRESS.nextRank}</span>
              </div>
            </div>

            {/* Rank track */}
            <div className="mt-6 flex flex-wrap gap-2">
              {RANKS.map((r) => (
                <div
                  key={r.name}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    r.active
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/70 bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <Star className="h-3 w-3" />
                  {r.name}
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard card */}
          <div className="glow-ring rounded-3xl border border-border/70 bg-card/80 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Command Leaderboard</h3>
              <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground">
                THIS WEEK
              </span>
            </div>
            <ul className="mt-5 space-y-2">
              {LEADERBOARD.map((row, i) => (
                <li
                  key={row.name}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                    row.you ? "border-primary/50 bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${
                      i === 0 ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{row.name}</div>
                    <div className="text-xs text-muted-foreground">{row.branch} branch</div>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {row.xp.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">XP</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
