import type { CSSProperties } from "react";
import { LADDER_POSITION, RANKS } from "../landing-content";

export function Advancement() {
  const at = { "--at": LADDER_POSITION } as CSSProperties;

  return (
    <section id="advancement" className="section">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow on-dark">Advancement</div>
          <h2>Rank up for real.</h2>
          <p className="lede">
            XP from scouting, inducting, and completing missions carries every officer up a real
            rank ladder — visible to the whole branch.
          </p>
        </div>

        <div className="advance-grid">
          <div className="ladder reveal">
            <div className="ladder-marker" aria-hidden>
              <span style={at}>You are here</span>
            </div>
            <div className="ladder-track">
              <div className="ladder-fill" style={at} />
            </div>
            <div className="ladder-nodes">
              {RANKS.map((rank) => (
                <div className="ladder-node" key={rank.code}>
                  <div className="r">{rank.code}</div>
                  <h4>{rank.name}</h4>
                  <div className="xp">{rank.xp}</div>
                </div>
              ))}
            </div>

            <div className="advance-copy">
              <p>
                A live rank track, a streak counter with freeze shields, and a year-long
                contribution heatmap keep progress visible — not just to head office, but to the
                officer earning it.
              </p>
              <p>
                A healthy dose of competition is one of the strongest, lowest-cost performance
                levers a branch manager has.
              </p>
            </div>
          </div>

          <div className="advance-shot reveal">
            <img src="/images/landing/img-6.png" alt="Rank progress screen" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
