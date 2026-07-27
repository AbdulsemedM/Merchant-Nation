"use client";

import Link from "next/link";
import "./landing.css";
import { MARQUEE_PHRASES, NAV_SECTIONS } from "./landing-content";
import { useLandingEffects } from "./useLandingEffects";
import { Hero } from "./sections/Hero";
import { MissionCycle } from "./sections/MissionCycle";
import { FieldTerminal } from "./sections/FieldTerminal";
import { ChainOfCommand } from "./sections/ChainOfCommand";
import { Advancement } from "./sections/Advancement";
import { Deploy } from "./sections/Deploy";

const MARQUEE_ITEMS = [...MARQUEE_PHRASES, ...MARQUEE_PHRASES];

export function LandingPage() {
  useLandingEffects();

  return (
    <div className="landing-page">
      <nav id="nav">
        <div className="nav-brand">
          Merchant Nation <em>Command</em>
        </div>
        <div className="nav-links">
          {NAV_SECTIONS.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <Link href="/login" className="nav-cta">
          Get the app
        </Link>
      </nav>

      <Hero />

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((phrase, i) => (
            <span key={`${phrase}-${i}`}>{phrase}</span>
          ))}
        </div>
      </div>

      <MissionCycle />
      <FieldTerminal />
      <ChainOfCommand />
      <Advancement />
      <Deploy />

      <footer>
        <div className="wrap foot-row">
          <div className="foot-brand">Merchant Nation Command</div>
          <div className="foot-tag">
            &quot;Bank Smarter, Live Better.&quot; — Cooperative Bank of Oromia
          </div>
          <div className="foot-note">Confidential — internal use only</div>
        </div>
      </footer>
    </div>
  );
}
