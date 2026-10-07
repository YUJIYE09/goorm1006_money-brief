"use client";

import { useState } from "react";
import { LineChart } from "./charts/LineChart";
import { Sparkline } from "./charts/Sparkline";
import { dailyLabels, dailySeries } from "@/lib/data/series";
import { arrow, dir, fmt, signed } from "@/lib/format";
import type { MarketSnapshot } from "@/lib/types";

const RANGES = [
  { n: 5, label: "1주" },
  { n: 22, label: "1개월" },
  { n: 64, label: "3개월" },
  { n: 250, label: "1년" },
];

// 지수 비교는 범주형 색 3개만 쓴다 (색맹 구분 검증을 통과한 조합)
const COMPARE = [
  { key: "kospi", name: "코스피", color: "var(--s1)" },
  { key: "spx", name: "S&P 500", color: "var(--s2)" },
  { key: "nikkei", name: "닛케이", color: "var(--s3)" },
] as const;

export function MarketView({ market }: { market: MarketSnapshot }) {
  const [n, setN] = useState(22);
  const labels = dailyLabels.slice(-n);
  const series = COMPARE.map((c) => {
    const sl = dailySeries[c.key].slice(-n);
    return { name: c.name, color: c.color, values: sl.map((v) => (v / sl[0]) * 100) };
  });
  const maxFlow = Math.max(...market.flows.map((f) => Math.abs(f.amount)));
  const rangeLabel = RANGES.find((r) => r.n === n)!.label;

  return (
    <>
      <div className="filters-row">
        <div className="seg" role="group" aria-label="기간">
          {RANGES.map((r) => (
            <button key={r.n} aria-pressed={r.n === n} onClick={() => setN(r.n)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mk-grid">
        <div className="card">
          <div className="chart-title">주요 지수 상대 수익률</div>
          <div className="chart-sub">기간 첫날 = 100</div>
          <div className="legend">
            {series.map((s) => (
              <span key={s.name}>
                <i style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
          <LineChart
            labels={labels}
            series={series}
            height={300}
            baseline={100}
            endLabels
            xTicks={[0, Math.round((n - 1) / 2), n - 1]}
            yFormat={(v) => v.toFixed(0)}
            tipFormat={(v) => signed(v - 100, 2, "%")}
            endFormat={(v) => signed(v - 100, 1, "%")}
            ariaLabel="주요 지수 상대 수익률"
          />
          <p className="src">출처 KRX, S&amp;P Dow Jones Indices, 닛케이 · 예시 수치</p>
        </div>

        <div className="card">
          <div className="chart-title">오늘 누가 샀나</div>
          <div className="chart-sub">코스피 투자자별 순매수, 억 원</div>
          <div className="flows">
            {market.flows.map((f) => {
              const pct = (Math.abs(f.amount) / maxFlow) * 34;
              const pos = f.amount >= 0;
              return (
                <div className="flow" key={f.investor}>
                  <span>{f.investor}</span>
                  <div className="flow-track" role="img" aria-label={`${f.investor} ${signed(f.amount, 0)}억 원`}>
                    <div className={`flow-bar ${pos ? "pos" : "neg"}`} style={{ width: `${pct}%` }} />
                    <span className="flow-val" style={pos ? { left: `calc(50% + ${pct}% + 6px)` } : { right: `calc(50% + ${pct}% + 6px)` }}>
                      {signed(f.amount, 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="src" style={{ marginTop: 16 }}>순매수는 빨강, 순매도는 파랑 · 출처 KRX · 예시 수치</p>
        </div>
      </div>

      <section className="sec">
        <div className="sec-h">
          <h2>지수 · 환율 · 금리</h2>
          <span className="aside">최근 {rangeLabel} 흐름</span>
        </div>
        <div className="card tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>항목</th>
                <th className="r">현재</th>
                <th className="r">전일 대비</th>
                <th className="r">기간 흐름</th>
              </tr>
            </thead>
            <tbody>
              {market.quotes.map((q) => (
                <tr key={q.key}>
                  <td style={{ fontWeight: 700 }}>{q.name}</td>
                  <td className="n r">{q.unit === "%" ? `${fmt(q.value)}%` : fmt(q.value)}</td>
                  <td className={`n r ${dir(q.changePct)}`}>
                    {arrow(q.changePct)} {Math.abs(q.changePct).toFixed(2)}%
                  </td>
                  <td className="r">
                    <span style={{ display: "inline-block" }}>
                      <Sparkline values={(market.history?.[q.key]?.values ?? dailySeries[q.key]).slice(-n)} color="var(--ink-2)" width={90} height={28} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
