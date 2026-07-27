import { TERMINAL_SCREENS } from "../landing-content";

export function FieldTerminal() {
  return (
    <section id="terminal" className="section">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow on-dark">Field terminal</div>
          <h2>
            This isn&apos;t a mockup.
            <br />
            <span className="outline-text">It&apos;s the app.</span>
          </h2>
          <p className="lede">
            Every screen here is a live capture from Merchant Nation Command — the exact interface
            field officers and branch managers use today.
          </p>
        </div>

        {/* Desktop: sticky device with copy that drives which screen shows */}
        <div className="term-showcase" id="termShowcase">
          <div className="term-stage">
            <div className="term-device">
              <div className="term-device-bar">
                <span className="dots" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
                <span>Field terminal</span>
              </div>
              <div className="term-screens">
                {TERMINAL_SCREENS.map((screen, i) => (
                  <div
                    className={i === 0 ? "term-screen active" : "term-screen"}
                    data-screen={i}
                    key={screen.src}
                  >
                    <img src={screen.src} alt={screen.alt} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
            <div className="term-counter">
              <span>
                <b id="termCurrent">01</b> / {String(TERMINAL_SCREENS.length).padStart(2, "0")}
              </span>
              <span>Live capture</span>
            </div>
          </div>

          <div className="term-steps" id="termSteps">
            {TERMINAL_SCREENS.map((screen, i) => (
              <div
                className={i === 0 ? "term-step active" : "term-step"}
                data-step={i}
                key={screen.title}
              >
                <div className="idx">{String(i + 1).padStart(2, "0")}</div>
                <h3>{screen.title}</h3>
                <p>{screen.copy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile fallback: horizontal gallery */}
        <div className="term-gallery">
          {TERMINAL_SCREENS.map((screen) => (
            <div className="card" key={screen.src}>
              <div className="frame">
                <img src={screen.src} alt={screen.alt} loading="lazy" />
              </div>
              <h4>{screen.title}</h4>
              <p>{screen.copy}</p>
            </div>
          ))}
        </div>
        <div className="term-scroll-hint">Swipe to explore →</div>
      </div>
    </section>
  );
}
