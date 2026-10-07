import { arrow, dir, fmt } from "@/lib/format";
import type { MarketQuote } from "@/lib/types";
import { tickerExtras } from "@/lib/data/market";

const show = (q: MarketQuote) => (q.unit === "%" ? `${fmt(q.value, 2)}%` : fmt(q.value, 2));

export function Ticker({ quotes }: { quotes: MarketQuote[] }) {
  const items = [
    ...quotes.map((q) => ({ name: q.name, value: show(q), changePct: q.changePct })),
    ...tickerExtras,
  ];
  const row = items.map((it, i) => (
    <span key={i}>
      <b>{it.name}</b>
      {it.value}
      <em className={dir(it.changePct)}>
        {arrow(it.changePct)} {Math.abs(it.changePct).toFixed(2)}%
      </em>
    </span>
  ));
  return (
    <div className="ticker" aria-label="주요 시세">
      <div className="ticker-in num">
        {row}
        <span aria-hidden="true" style={{ display: "contents" }}>{row}</span>
      </div>
    </div>
  );
}
