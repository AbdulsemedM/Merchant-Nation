import { TICKER_ITEMS } from "../landing-content";

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
    <div className="relative border-y border-border/60 bg-secondary/30 py-3">
      <div className="flex overflow-hidden">
        <TickerRow />
        <TickerRow ariaHidden />
      </div>
    </div>
  );
}
