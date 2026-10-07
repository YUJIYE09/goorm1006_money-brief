"use client";

import { useMemo, useRef, useState } from "react";
import { ReactionBars } from "./charts/ReactionBars";
import { Importance } from "./Importance";
import { countryLabel, eventCategoryLabel } from "@/lib/data/events";
import { formatDay, TODAY } from "@/lib/format";
import type { CalendarEvent } from "@/lib/types";

const FILTERS = ["전체", "실적", "금리·통화", "경제지표", "채권", "휴장"];
const WEEKS = [
  { from: "2026-10-05", to: "2026-10-11", label: "10월 5일 – 10월 11일" },
  { from: "2026-10-12", to: "2026-10-18", label: "10월 12일 – 10월 18일" },
  { from: "2026-10-19", to: "2026-10-25", label: "10월 19일 – 10월 25일" },
];

export function CalendarView({ events, initialEvent }: { events: CalendarEvent[]; initialEvent?: string }) {
  const startWeek = Math.max(0, WEEKS.findIndex((w) => initialEvent && events.some((e) => e.id === initialEvent && e.date >= w.from && e.date <= w.to)));
  const [week, setWeek] = useState(startWeek);
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState(initialEvent ?? "event_002");
  const [alerts, setAlerts] = useState<Set<string>>(new Set());
  const detailRef = useRef<HTMLElement>(null);

  const w = WEEKS[week];
  const shown = useMemo(
    () => events.filter((e) => e.date >= w.from && e.date <= w.to && (filter === "전체" || eventCategoryLabel[e.category] === filter)),
    [events, w, filter],
  );
  const current = shown.find((e) => e.id === selected) ?? shown[0];
  const days = [...new Set(shown.map((e) => e.date))];

  const pick = (id: string) => {
    setSelected(id);
    if (window.innerWidth <= 900) {
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }),
      );
    }
  };
  const toggleAlert = (id: string) =>
    setAlerts((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <div className="filters-row" style={{ justifyContent: "space-between" }}>
        <div className="chips" role="group" aria-label="일정 종류">
          {FILTERS.map((f) => (
            <button key={f} aria-pressed={f === filter} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="week-nav">
          <button aria-label="이전 주" disabled={week === 0} onClick={() => setWeek(week - 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <span className="num">{w.label}</span>
          <button aria-label="다음 주" disabled={week === WEEKS.length - 1} onClick={() => setWeek(week + 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="cal-layout">
        <div>
          {days.length === 0 && <p className="empty">이 기간에는 해당하는 일정이 없습니다. 다른 종류나 주를 골라 보세요.</p>}
          {days.map((d) => {
            const f = formatDay(d);
            return (
              <div className="day-group" key={d}>
                <h3>
                  {f.long}
                  {d === TODAY && <span className="today-tag">오늘</span>}
                </h3>
                {shown
                  .filter((e) => e.date === d)
                  .map((e) => (
                    <button key={e.id} className="ev" aria-pressed={current?.id === e.id} onClick={() => pick(e.id)}>
                      <time>{e.time}</time>
                      <span>
                        <b>{e.title}</b>
                        <small>
                          {countryLabel[e.country]} · {eventCategoryLabel[e.category]}
                        </small>
                      </span>
                      <Importance level={e.importance} />
                    </button>
                  ))}
              </div>
            );
          })}
        </div>

        {current && (
          <aside className="card detail" ref={detailRef} aria-live="polite">
            <div className="eyebrow">
              {formatDay(current.date).long} · {current.time} · {countryLabel[current.country]}
            </div>
            <h2>{current.title}</h2>
            <p className="desc">{current.description}</p>
            <div className="assets">
              {current.related_assets.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
            {current.past_reactions ? (
              <div style={{ marginTop: 20 }}>
                <div className="chart-title">과거 {current.past_reactions.length}번, 발표일 코스피</div>
                <div className="chart-sub">등락률(%) · 빨강 상승, 파랑 하락</div>
                <ReactionBars values={current.past_reactions} />
                <p className="src">예시 수치 · 과거 반응이 앞으로의 움직임을 뜻하지는 않습니다.</p>
              </div>
            ) : (
              <p className="src" style={{ marginTop: 18 }}>
                {current.category === "holiday" ? "휴장일이라 과거 반응 데이터가 없습니다." : "과거 반응 데이터가 아직 없습니다."}
              </p>
            )}
            <div className="actions">
              <button className="btn-line" aria-pressed={alerts.has(current.id)} onClick={() => toggleAlert(current.id)}>
                {alerts.has(current.id) ? "알림 설정됨" : "알림 받기"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
