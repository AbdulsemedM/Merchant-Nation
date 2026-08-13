import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/BrandMark";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[min(100dvh,920px)] overflow-hidden pt-16">
      {/* Full-bleed territory art */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src="/images/landing/img-0.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%] opacity-45"
          sizes="100vw"
        />
        <div className="tactical-grid absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_20%_40%,rgb(0_173_239/0.28),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgb(7_26_61/0.82)_42%,rgb(7_26_61/0.35)_70%,rgb(7_26_61/0.55)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_18%,transparent_72%,var(--background)_100%)]" />
        <span className="animate-pulse-pin absolute left-[58%] top-[42%] hidden h-3 w-3 rounded-full bg-primary shadow-[0_0_14px_2px_var(--primary)] xl:block" />
        <span
          className="animate-pulse-pin absolute left-[72%] top-[58%] hidden h-3 w-3 rounded-full bg-accent shadow-[0_0_14px_2px_var(--accent)] xl:block"
          style={{ animationDelay: "0.9s" }}
        />
      </div>

      <div className="landing-shell relative z-10 flex min-h-[min(calc(100dvh-4rem),860px)] flex-col justify-center py-16 lg:py-24">
        <div className="flex max-w-2xl flex-col items-start xl:max-w-3xl">
          <BrandMark
            variant="stacked"
            surface="onDark"
            width={220}
            height={168}
            className="animate-fade-up h-auto w-[9.5rem] sm:w-[11rem] lg:w-[13rem]"
            priority
          />

          <p className="animate-fade-up-delay mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Internal · Coop Bank of Oromia staff
          </p>

          <h1 className="animate-fade-up-delay mt-4 text-pretty text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
            Field work for{" "}
            <span className="text-glow text-primary">Coop officers.</span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-5 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Scout merchants, complete inductions, assign missions, and track growth across your
            territory — one command for administrators, branch managers, and branch teams.
          </p>

          <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 px-6 text-base font-semibold">
              <Link href="/login">
                Staff sign in
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-border bg-secondary/40 px-6 text-base font-semibold hover:bg-secondary"
            >
              <a href="#roles">See staff roles</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
