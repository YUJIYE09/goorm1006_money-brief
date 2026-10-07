"use client";

import { useState } from "react";
import { barPath, niceTicks } from "./scale";
import { hideTip, showTip, tipAnchor } from "./tooltip";
import { useWidth } from "./useWidth";

interface Props {
  labels: string[];
  values: number[];
  unit: string;
  marker?: { index: number; value: number; label: string };
  height?: number;
  ariaLabel: string;
}

/** 세로 막대. 마지막 막대(이번 분기)를 진하게 강조하고, 기대치는 노란 선으로 표시한다. */
export function BarChart({ labels, values, unit, marker, height = 240, ariaLabel }: Props) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = height;
  const m = { t: 22, r: 4, b: 24, l: 4 };
  const iw = Math.max(0, W - m.l - m.r);
  const ih = H - m.t - m.b;
  const n = values.length;
  const hi = Math.max(...values, marker?.value ?? 0) * 1.12;
  const y = (v: number) => m.t + ih - (v / hi) * ih;
  const slot = iw / n;
  const bw = Math.min(46, slot * 0.62);
  const base = y(0);

  return (
    <div ref={ref} className="chart" style={{ height: H }}>
      {W > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
          <g fontFamily="var(--f-num)" fontSize={11}>
            {niceTicks(0, hi, 3).map((t) => (
              <line key={t} x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
            ))}
            {values.map((v, i) => {
              const cx = m.l + slot * i + slot / 2;
              const focus = i === n - 1;
              const label = `${labels[i]} ${v.toLocaleString("ko-KR")}${unit}`;
              const show = (e: { clientX?: number; clientY?: number } | null, el: Element) => {
                setHover(i);
                const p = tipAnchor(e, el);
                showTip(p.x, p.y, labels[i], [{ value: `${v.toLocaleString("ko-KR", { minimumFractionDigits: 1 })}${unit}` }]);
              };
              const off = () => {
                setHover(null);
                hideTip();
              };
              return (
                <g key={labels[i]}>
                  <path
                    d={barPath(cx - bw / 2, base, bw, base - y(v))}
                    fill={focus ? "var(--ink)" : "var(--s-other)"}
                    opacity={hover === i ? 0.82 : 1}
                    tabIndex={0}
                    aria-label={label}
                    style={{ outline: "none" }}
                    onPointerMove={(e) => show(e, e.currentTarget)}
                    onPointerLeave={off}
                    onFocus={(e) => show(null, e.currentTarget)}
                    onBlur={off}
                  />
                  <text x={cx} y={y(v) - 6} textAnchor="middle" fill="var(--ink)" fontWeight={focus ? 800 : 500} fontSize={focus ? 13 : 11}>
                    {v.toFixed(1)}
                  </text>
                  <text x={cx} y={H - 6} textAnchor="middle" fill={focus ? "var(--ink)" : "var(--ink-3)"} fontWeight={focus ? 700 : 400}>
                    {labels[i]}
                  </text>
                </g>
              );
            })}
            {marker && (
              <g>
                <line
                  x1={m.l + slot * marker.index + slot / 2 - bw / 2 - 6}
                  x2={m.l + slot * marker.index + slot / 2 + bw / 2 + 6}
                  y1={y(marker.value)}
                  y2={y(marker.value)}
                  stroke="var(--accent)"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <text x={m.l + slot * marker.index + slot / 2 - bw / 2 - 10} y={y(marker.value) + 4} textAnchor="end" fill="var(--ink-2)" fontWeight={700}>
                  {marker.label}
                </text>
              </g>
            )}
          </g>
        </svg>
      )}
    </div>
  );
}
