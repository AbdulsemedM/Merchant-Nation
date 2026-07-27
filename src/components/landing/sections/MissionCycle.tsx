import { CYCLE_STEPS } from "../landing-content";

export function MissionCycle() {
  return (
    <section id="operation" className="section section-light">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">The operation</div>
          <h2>
            Four moves.
            <br />
            <span className="outline-text">One mission cycle.</span>
          </h2>
          <p className="lede">
            The same cycle repeats across every branch, every day — simple enough to run from a
            phone in the field, structured enough to roll up into real reporting.
          </p>
        </div>

        <div className="cycle" id="cycle">
          <div className="cycle-rail" aria-hidden>
            <div className="cycle-rail-fill" id="cycleRailFill" />
          </div>

          <ol className="cycle-steps">
            {CYCLE_STEPS.map((step) => (
              <li className="cycle-step" key={step.index}>
                <div className="cycle-body">
                  <div className="cycle-index">{step.index}</div>
                  <div className="cycle-op">{step.op}</div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                  <span className={step.xpGhost ? "xp-tag ghost" : "xp-tag"}>{step.xp}</span>
                </div>
                <div className="cycle-node" aria-hidden>
                  <span className="cycle-dot" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
