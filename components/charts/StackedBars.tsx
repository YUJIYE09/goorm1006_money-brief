"use client";

import { useLayoutEffect, useRef } from "react";
import { hideTip, showTip, tipAnchor } from "./tooltip";

const COLORS = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s-other)"];

interface Props {
  parts: string[];
  rows: { label: string; values: number[] }[];
  unit: string;
}

/** 100% 누적 가로 막대. 범주형 색은 3개까지, 4번째는 기타 회색 */
export function StackedBars({ parts, rows, unit }: Props) {
  const box = useRef<HTMLDivElement>(null);

  // 칸이 좁아 라벨이 넘치면 비율만, 그래도 넘치면 비운다 (값은 툴팁에 남는다)
  useLayoutEffect(() => {
    const fit = () =>
      box.current?.querySelectorAll<HTMLDivElement>(".seg-b").forEach((s) => {
        s.textContent = s.dataset.full ?? "";
        if (s.scrollWidth > s.clientWidth) s.textContent = s.dataset.short ?? "";
        if (s.scrollWidth > s.clientWidth) s.textContent = "";
      });
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [rows]);

  return (
    <>
      <div className="legend">
        {parts.map((p, i) => (
          <span key={p}>
            <i className="box" style={{ background: COLORS[Math.min(i, 3)] }} />
            {p}
          </span>
        ))}
      </div>
      <div className="stack-rows" ref={box}>
        {rows.map((row) => {
          const total = row.values.reduce((a, b) => a + b, 0);
          return (
            <div className="stack-row" key={row.label}>
              <span className="rl">{row.label}</span>
              <div className="stack">
                {row.values.map((v, i) => {
                  const pct = Math.round((v / total) * 100);
                  const show = (e: { clientX?: number; clientY?: number } | null, el: Element) => {
                    const p = tipAnchor(e, el);
                    showTip(p.x, p.y, `${row.label} · ${parts[i]}`, [{ value: `${v.toFixed(1)}${unit}`, label: `${pct}%` }]);
                  };
                  return (
                    <div
                      key={parts[i]}
                      className="seg-b"
                      tabIndex={0}
                      style={{ flex: `${v} 1 0`, background: COLORS[Math.min(i, 3)] }}
                      data-full={`${parts[i]} ${pct}%`}
                      data-short={`${pct}%`}
                      aria-label={`${parts[i]} ${v.toFixed(1)}${unit}, ${pct}%`}
                      onPointerMove={(e) => show(e, e.currentTarget)}
                      onPointerLeave={hideTip}
                      onFocus={(e) => show(null, e.currentTarget)}
                      onBlur={hideTip}
                    >
                      {`${parts[i]} ${pct}%`}
                    </div>
                  );
                })}
              </div>
              <span className="rt">{total.toFixed(1)}조</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
