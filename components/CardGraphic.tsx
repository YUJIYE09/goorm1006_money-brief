"use client";

import { dailyLabels, dailySeries } from "@/lib/data/series";
import type { CardGraphic as CG } from "@/lib/types";
import { LineChart } from "./charts/LineChart";

/** 홈 뉴스 카드 하단의 작은 인포그래픽 */
export function CardGraphic({ g }: { g: CG }) {
  if (g.kind === "bullet") {
    return (
      <div className="viz bullet">
        <span>{g.label}</span>
        <div className="track" role="img" aria-label={`실제 ${g.actual}, 예상 ${g.expected}`}>
          <div className="bar" style={{ width: `${(g.actual / g.max) * 100}%` }} />
          <div className="cons" style={{ left: `${(g.expected / g.max) * 100}%` }} />
        </div>
        <div className="ticks">
          <span>0</span>
          <span style={{ color: "var(--ink)", fontWeight: 800 }}>
            실제 {g.actual} · 예상 {g.expected}
          </span>
          <span>{g.max}</span>
        </div>
      </div>
    );
  }
  if (g.kind === "range") {
    const pos = ((g.current - g.low) / (g.high - g.low)) * 100;
    return (
      <div className="viz range">
        <span>{g.label}</span>
        <div className="track" role="img" aria-label={`최저 ${g.low}, 최고 ${g.high}, 현재 ${g.current}`}>
          <div className="knob" style={{ left: `${pos}%` }} />
          <div className="knob-l" style={{ left: `${pos}%` }}>
            {g.current.toLocaleString("ko-KR")}
          </div>
        </div>
        <div className="ends num">
          <span>{g.low.toLocaleString("ko-KR")}</span>
          <span>{g.high.toLocaleString("ko-KR")}</span>
        </div>
      </div>
    );
  }
  const values = dailySeries[g.seriesKey].slice(-30);
  return (
    <div className="viz">
      <LineChart
        labels={dailyLabels.slice(-30)}
        series={[{ name: g.label.split(",")[0], color: "var(--ink)", values }]}
        height={120}
        tickCount={2}
        yFormat={(v) => v.toFixed(1)}
        tipFormat={(v) => `${v.toFixed(2)}${g.unit}`}
        ariaLabel={g.label}
      />
      <p className="src" style={{ marginTop: 4 }}>{g.label}</p>
    </div>
  );
}
