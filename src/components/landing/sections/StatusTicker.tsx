import { HERO_STATS, TICKER_ITEMS } from "../landing-content";

function TickerRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="animate-marquee flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={ariaHidden || undefined}
    >
      {TICKER_ITEMS.map((item, i) => (
        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
          <item.icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusTicker() {
  return (
    <div className="relative border-y border-border/60 bg-secondary/30">
      <div className="landing-shell grid grid-cols-3 gap-4 border-b border-border/40 py-5 sm:gap-8">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <div className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
              {stat.value}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex overflow-hidden py-3">
        <TickerRow />
        <TickerRow ariaHidden />
      </div>
    </div>
  );
}
