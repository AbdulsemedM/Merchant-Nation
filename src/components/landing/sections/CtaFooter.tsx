import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/BrandMark";
import { FOOTER_TAGLINE, NAV_LINKS } from "../landing-content";

export function CtaFooter() {
  return (
    <>
      <section className="py-24">
        <div className="landing-shell">
          <div className="glow-ring relative overflow-hidden rounded-3xl border border-primary/30 bg-card px-6 py-14 sm:px-12 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
              <div className="tactical-grid absolute inset-0 opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgb(0_173_239/0.18),transparent)]" />
            </div>
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
              <div className="flex flex-col items-start text-left">
                <BrandMark
                  variant="horizontal"
                  surface="onDark"
                  width={240}
                  height={56}
                  className="mb-6 h-auto w-[min(100%,240px)]"
                />
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <Smartphone className="h-3.5 w-3.5" /> Internal tool · Installs as a PWA
                </div>
                <h2 className="mt-5 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Built for Coop staff — from HQ to the branch
                </h2>
                <p className="mt-4 max-w-prose text-pretty text-lg text-muted-foreground">
                  Merchant Nation is for Cooperative Bank of Oromia administrators, branch managers,
                  and branch staff. Scout merchants, run inductions, and track territory — not open
                  to the public.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="group h-12 px-7 text-base font-semibold">
                    <Link href="/login">
                      Staff sign in
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 border-border bg-transparent px-7 text-base font-semibold hover:bg-secondary"
                  >
                    <a href="#roles">See staff roles</a>
                  </Button>
                </div>
              </div>
              <BrandMark
                variant="stacked"
                surface="onDark"
                width={200}
                height={152}
                className="mx-auto hidden h-auto w-44 opacity-90 lg:block xl:w-52"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-12">
        <div className="landing-shell flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark variant="icon" surface="onDark" width={36} height={36} className="h-9 w-9" />
            <span className="text-sm text-muted-foreground">Merchant Nation Command</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-center text-xs text-muted-foreground">{FOOTER_TAGLINE}</p>
        </div>
      </footer>
    </>
  );
}
