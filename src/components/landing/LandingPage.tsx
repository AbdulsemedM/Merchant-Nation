import "./landing.css";
import { SiteHeader } from "./sections/SiteHeader";
import { Hero } from "./sections/Hero";
import { StatusTicker } from "./sections/StatusTicker";
import { Features } from "./sections/Features";
import { Gameplay } from "./sections/Gameplay";
import { Roles } from "./sections/Roles";
import { FieldLoop } from "./sections/FieldLoop";
import { CtaFooter } from "./sections/CtaFooter";

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <StatusTicker />
        <Features />
        <Gameplay />
        <Roles />
        <FieldLoop />
        <CtaFooter />
      </main>
    </div>
  );
}
