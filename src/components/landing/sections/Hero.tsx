import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Flame, MapPin, Radar, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_STATS } from "../landing-content";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-16">
      {/* Background territory art */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="tactical-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_18%_0%,rgb(0_173_239/0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_85%_20%,rgb(0_217_181/0.14),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,transparent,var(--background)_82%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pt-20">
        {/* Left: copy */}
        <div className="flex flex-col items-start justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            SYSTEM ACTIVE · ADDIS ABABA THEATER
          </div>

          <h1 className="mt-6 text-pretty text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Claim the map.
            <br />
            <span className="text-glow text-primary">Grow the nation.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Merchant Nation Command turns field banking into a mission. Scout merchants, capture
            territory, and level up your rank — the gamified command center for Cooperative Bank of
            Oromia field teams.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 px-6 text-base font-semibold">
              <Link href="/login">
                Start your first mission
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-border bg-secondary/40 px-6 text-base font-semibold hover:bg-secondary"
            >
              <a href="#loop">Watch the field loop</a>
            </Button>
          </div>

          {/* Trust / stat strip */}
          <dl className="mt-12 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-border/60 pt-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: floating command console */}
        <div className="relative flex items-center justify-center">
          <div className="glow-ring animate-float-y relative w-full max-w-xl rounded-3xl border border-border/70 bg-card/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-wide text-foreground">
                  TERRITORY COMMAND
                </span>
              </div>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                LIVE
              </span>
            </div>

            {/* Map body */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60">
              <Image
                src="/images/landing/img-0.png"
                alt="Merchant Nation Command territory map showing zones, pins and branch stats"
                width={1400}
                height={815}
                priority
                className="h-auto w-full object-cover"
              />
              {/* Animated pins overlay */}
              <span className="animate-pulse-pin absolute left-[22%] top-[34%] h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_2px_var(--primary)]" />
              <span
                className="animate-pulse-pin absolute left-[64%] top-[48%] h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_2px_var(--accent)]"
                style={{ animationDelay: "0.8s" }}
              />
              <span
                className="animate-pulse-pin absolute left-[44%] top-[68%] h-3 w-3 rounded-full bg-chart-2 shadow-[0_0_12px_2px_var(--chart-2)]"
                style={{ animationDelay: "1.4s" }}
              />
            </div>

            {/* Mini stat row */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Zones captured
                </div>
                <div className="mt-1 text-xl font-bold text-foreground">147</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-accent" /> Active streak
                </div>
                <div className="mt-1 text-xl font-bold text-foreground">12 days</div>
              </div>
            </div>
          </div>

          {/* Floating rank badge */}
          <div className="glow-ring absolute -left-2 top-6 hidden rounded-2xl border border-border/70 bg-card/90 p-3 backdrop-blur-md sm:block lg:-left-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Rank up
                </div>
                <div className="text-sm font-semibold text-foreground">Scout Officer</div>
              </div>
            </div>
          </div>

          {/* Floating XP toast */}
          <div className="glow-ring absolute -bottom-3 right-0 hidden items-center gap-2 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 backdrop-blur-md sm:flex lg:-right-4">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">+100 XP</span>
            <span className="text-xs text-muted-foreground">Merchant inducted</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
}
