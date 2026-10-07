"use client";

import type { Graphic } from "@/lib/types";
import { BarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { StackedBars } from "./charts/StackedBars";

/** 기사 섹션에 붙는 인포그래픽 한 장 */
export function ArticleGraphic({ g }: { g: Graphic }) {
  return (
    <figure className="card figure" style={{ margin: "8px 0 0" }}>
      <div className="chart-title">{g.title}</div>
      <div className="chart-sub">{g.subtitle}</div>
      {g.kind === "bars" && <BarChart labels={g.labels} values={g.values} unit={g.unit} marker={g.marker} ariaLabel={g.title} />}
      {g.kind === "stack" && <StackedBars parts={g.parts} rows={g.rows} unit={g.unit} />}
      {g.kind === "line" && (
        <LineChart
          labels={g.labels}
          series={[{ name: g.seriesName, color: "var(--s1)", values: g.values }]}
          height={190}
          area
          xTicks={g.labels.map((_, i) => i)}
          yFormat={(v) => v.toFixed(0)}
          tipFormat={(v) => v.toFixed(0)}
          ariaLabel={g.title}
        />
      )}
      <figcaption className="src">{g.source}</figcaption>
    </figure>
  );
}
