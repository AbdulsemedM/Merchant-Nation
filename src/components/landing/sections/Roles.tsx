import { ROLES } from "../landing-content";

export function Roles() {
  return (
    <section id="roles" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Built for every rank
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One platform, three points of view
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {ROLES.map((role) => (
            <div
              key={role.name}
              className={`relative rounded-2xl border p-7 ${
                role.highlight
                  ? "glow-ring border-primary/50 bg-primary/[0.06]"
                  : "border-border/70 bg-card/60"
              }`}
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                  role.highlight
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <role.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{role.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.tagline}</p>
              <ul className="mt-5 space-y-3">
                {role.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
