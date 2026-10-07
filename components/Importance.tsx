import type { CalendarEvent } from "@/lib/types";

const LEVEL = { high: 3, medium: 2, low: 1 } as const;
const LABEL = { high: "높음", medium: "보통", low: "참고" } as const;

export function Importance({ level }: { level: CalendarEvent["importance"] }) {
  const k = LEVEL[level];
  return (
    <span className="imp" role="img" aria-label={`중요도 ${LABEL[level]}`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= k ? "" : "off"} />
      ))}
    </span>
  );
}
