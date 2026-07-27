import { ROLES } from "../landing-content";

export function ChainOfCommand() {
  return (
    <section id="command" className="section section-alt">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">Chain of command</div>
          <h2>
            Built for everyone
            <br />
            <span className="outline-text">on the org chart.</span>
          </h2>
          <p className="lede">
            Three roles, one shared map — each with exactly the tools that role needs, and nothing
            it doesn&apos;t.
          </p>
        </div>

        <div className="roles reveal">
          {ROLES.map((role) => (
            <div className={role.featured ? "role-panel featured" : "role-panel"} key={role.title}>
              <div className="role-tag">{role.tag}</div>
              <h3>{role.title}</h3>
              <div className="sub">{role.sub}</div>
              <ul>
                {role.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
