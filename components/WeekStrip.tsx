import Link from "next/link";
import { countryLabel } from "@/lib/data/events";
import { formatDay, TODAY } from "@/lib/format";
import type { CalendarEvent } from "@/lib/types";
import { Importance } from "./Importance";

export function WeekStrip({ days, events }: { days: string[]; events: CalendarEvent[] }) {
  return (
    <div className="week-strip">
      {days.map((d) => {
        const evs = events.filter((e) => e.date === d);
        const f = formatDay(d);
        const holiday = evs.some((e) => e.category === "holiday");
        return (
          <div key={d} className={`wk${d === TODAY ? " today" : ""}${holiday ? " holiday" : ""}`}>
            <div className="wk-h">
              <span>
                {f.weekday}
                {d === TODAY ? " · 오늘" : ""}
              </span>
              <b className="num">{f.day}</b>
            </div>
            {evs.length ? (
              evs.map((e) => (
                <Link key={e.id} href={`/calendar?event=${e.id}`} className="wk-ev" style={{ textDecoration: "none" }}>
                  {e.title}
                  <small>
                    <Importance level={e.importance} />
                    {e.time} · {countryLabel[e.country]}
                  </small>
                </Link>
              ))
            ) : (
              <span className="wk-empty">주요 일정 없음</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
