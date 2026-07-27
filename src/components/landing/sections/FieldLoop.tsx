import { LOOP_STEPS } from "../landing-content";

export function FieldLoop() {
  return (
    <section id="loop" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 z-0 bg-secondary/20" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            The field loop
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A daily rhythm that compounds
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP_STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {i < LOOP_STEPS.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-primary/40 to-transparent lg:block" />
              )}
              <div className="relative rounded-2xl border border-border/70 bg-card/70 p-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground/40">{s.step}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
