import Link from "next/link";
import { HERO_STATS } from "../landing-content";

export function Hero() {
  return (
    <section id="hero">
      <div className="hero-grid" id="heroGrid" aria-hidden />
      <div className="hero-wash" aria-hidden />

      <div className="wrap hero-inner">
        <div className="hero-status">
          <span className="status-dot" />
          System active — Addis Ababa theater
        </div>

        <h1>
          Every merchant
          <br />
          is a <span className="accent">mission</span>
        </h1>

        <div className="hero-bottom">
          <p className="hero-sub">
            Merchant Nation Command turns daily field sales into a live operation for Cooperative
            Bank of Oromia. Scout territory, induct merchants, run missions, rank up — one captured
            zone at a time.
          </p>
          <div className="hero-ctas">
            <Link href="/login" className="btn btn-primary">
              Enter command
            </Link>
            <a href="#operation" className="link-arrow">
              See the operation →
            </a>
          </div>
        </div>

        <div className="hero-stats" id="heroStats">
          {HERO_STATS.map(({ value, label }) => (
            <div className="hero-stat" key={label}>
              <div className="n" data-count={value}>
                0
              </div>
              <div className="l">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
