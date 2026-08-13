import Image from "next/image";
import { ROLES } from "../landing-content";

export function Roles() {
  return (
    <section id="roles" className="py-24">
      <div className="landing-shell">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="relative overflow-hidden rounded-2xl border border-border/70">
            <Image
              src="/images/landing/img-4.png"
              alt="Staff roles across Cooperative Bank of Oromia branches"
              width={1200}
              height={720}
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Coop staff only
            </span>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl xl:text-5xl">
              Admin, managers, and branch teams
            </h2>
            <p className="mt-3 max-w-prose text-pretty text-muted-foreground">
              Access is for Cooperative Bank of Oromia staff — not merchants or outside parties.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 xl:gap-6">
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
