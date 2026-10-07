"use client";

import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { niceTicks } from "./scale";
import { hideTip, showTip } from "./tooltip";
import { useWidth } from "./useWidth";

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

interface Props {
  labels: string[];
  series: LineSeries[];
  height?: number;
  baseline?: number;
  area?: boolean;
  endLabels?: boolean;
  xTicks?: number[];
  tickCount?: number;
  yFormat?: (v: number) => string;
  tipFormat?: (v: number) => string;
  endFormat?: (v: number) => string;
  ariaLabel: string;
}

/** 선 차트. 포인터나 방향키로 크로스헤어를 움직이면 모든 시리즈 값을 툴팁으로 보여준다. */
export function LineChart({
  labels,
  series,
  height = 220,
  baseline,
  area,
  endLabels,
  xTicks,
  tickCount = 4,
  yFormat = (v) => String(v),
  tipFormat = (v) => v.toLocaleString("ko-KR", { maximumFractionDigits: 2 }),
  endFormat,
  ariaLabel,
}: Props) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [cur, setCur] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const n = labels.length;
  const H = height;
  const m = { t: 10, r: endLabels ? 78 : 10, b: 24, l: 46 };
  const iw = Math.max(0, W - m.l - m.r);
  const ih = H - m.t - m.b;

  const { lo, hi, ticks } = useMemo(() => {
    const all = series.flatMap((s) => s.values).concat(baseline != null ? [baseline] : []);
    let lo = Math.min(...all);
    let hi = Math.max(...all);
    const pad = (hi - lo) * 0.12 || 1;
    lo -= pad;
    hi += pad;
    const ticks = niceTicks(lo, hi, tickCount);
    return { lo: Math.min(lo, ticks[0]), hi: Math.max(hi, ticks[ticks.length - 1]), ticks };
  }, [series, baseline, tickCount]);

  const x = (i: number) => m.l + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
  const y = (v: number) => m.t + ih - ((v - lo) / (hi - lo)) * ih;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  // 끝 라벨이 겹치지 않게 14px 간격으로 밀어낸다
  const endY = useMemo(() => {
    const items = series.map((s, k) => ({ k, y: y(s.values[n - 1]) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < 14) items[i].y = items[i - 1].y + 14;
    const out: number[] = [];
    items.forEach((it) => (out[it.k] = it.y));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, W, lo, hi]);

  function at(i: number, cx?: number, cy?: number, svg?: SVGSVGElement | null) {
    const idx = Math.max(0, Math.min(n - 1, i));
    setCur(idx);
    const r = svg?.getBoundingClientRect();
    showTip(
      cx ?? (r ? r.left + x(idx) : 0),
      cy ?? (r ? r.top + m.t + 10 : 0),
      labels[idx],
      series.map((s) => ({ color: s.color, value: tipFormat(s.values[idx]), label: s.name })),
    );
  }
  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    const r = svg!.getBoundingClientRect();
    at(Math.round(((e.clientX - r.left - m.l) / iw) * (n - 1)), e.clientX, e.clientY, svg);
  };
  const off = () => {
    setCur(null);
    hideTip();
  };
  const onKey = (e: KeyboardEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (!step) return;
    e.preventDefault();
    at((cur ?? n - 1) + step, undefined, undefined, svg);
  };

  return (
    <div ref={ref} className="chart" style={{ height: H }}>
      {W > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
          <g fontFamily="var(--f-num)" fontSize={11}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={m.l} x2={m.l + iw} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
                <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fill="var(--ink-3)">
                  {yFormat(t)}
                </text>
              </g>
            ))}
            {(xTicks ?? [0, n - 1]).map((i) => (
              <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill="var(--ink-3)">
                {labels[i]}
              </text>
            ))}
            {baseline != null && (
              <line x1={m.l} x2={m.l + iw} y1={y(baseline)} y2={y(baseline)} stroke="var(--ink-3)" strokeDasharray="3 4" />
            )}
            {series.map((s, k) => (
              <g key={s.name}>
                {area && (
                  <>
                    <defs>
                      <linearGradient id={`${gid}-${k}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <path d={`${path(s.values)} L${x(n - 1)} ${m.t + ih} L${x(0)} ${m.t + ih} Z`} fill={`url(#${gid}-${k})`} />
                  </>
                )}
                <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                {endLabels && (
                  <text x={x(n - 1) + 8} y={endY[k] + 4} fill="var(--ink)" fontWeight={700}>
                    {s.name} {endFormat ? endFormat(s.values[n - 1]) : ""}
                  </text>
                )}
              </g>
            ))}
            {cur != null && (
              <g>
                <line x1={x(cur)} x2={x(cur)} y1={m.t} y2={m.t + ih} stroke="var(--ink-2)" />
                {series.map((s) => (
                  <circle key={s.name} cx={x(cur)} cy={y(s.values[cur])} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                ))}
              </g>
            )}
          </g>
          <rect
            x={m.l}
            y={0}
            width={iw}
            height={H}
            fill="transparent"
            tabIndex={0}
            style={{ cursor: "crosshair", outline: "none" }}
            aria-label={`${ariaLabel}, 방향키로 값 보기`}
            onPointerMove={onMove}
            onPointerLeave={off}
            onFocus={(e) => at(cur ?? n - 1, undefined, undefined, e.currentTarget.ownerSVGElement)}
            onBlur={off}
            onKeyDown={onKey}
          />
        </svg>
      )}
    </div>
  );
}
