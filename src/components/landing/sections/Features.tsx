import { FEATURES, type Tone } from "../landing-content";

const toneMap: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  accent: "bg-accent/15 text-accent",
  teal: "bg-chart-2/15 text-chart-2",
};

export function Features() {
  return (
    <section id="operations" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            The arsenal
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything a field team needs, in one command center
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Built for the way Cooperative Bank of Oromia works on the ground — fast, mobile, and
            mission-driven.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/40 hover:bg-card"
            >
              <div className="scanline absolute inset-x-0 top-0 h-px" />
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${toneMap[f.tone]}`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
