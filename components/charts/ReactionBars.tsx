"use client";

import { signed } from "@/lib/format";
import { barPath } from "./scale";
import { useWidth } from "./useWidth";

/** 과거 같은 이벤트 날의 코스피 등락률. 0을 가운데 두고 위(상승, 빨강)·아래(하락, 파랑)로 */
export function ReactionBars({ values }: { values: number[] }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const H = 150;
  const m = { t: 18, b: 22 };
  const ih = H - m.t - m.b;
  const mx = Math.max(1.5, ...values.map(Math.abs));
  const mid = m.t + ih / 2;
  const slot = W / values.length;
  const bw = Math.min(34, slot * 0.6);
  return (
    <div ref={ref} className="chart" style={{ height: H }}>
      {W > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`과거 발표일 코스피 등락률: ${values.map((v) => signed(v, 1, "%")).join(", ")}`}>
          <g fontFamily="var(--f-num)" fontSize={11}>
            <line x1={0} x2={W} y1={mid} y2={mid} stroke="var(--ink-3)" />
            {values.map((v, i) => {
              const cx = slot * i + slot / 2;
              const h = (Math.abs(v) / mx) * (ih / 2);
              const up = v >= 0;
              return (
                <g key={i}>
                  <path d={barPath(cx - bw / 2, mid, bw, h, up)} fill={up ? "var(--up)" : "var(--down)"} />
                  <text x={cx} y={up ? mid - h - 5 : mid + h + 13} textAnchor="middle" fill="var(--ink)" fontWeight={700}>
                    {signed(v, 1)}
                  </text>
                  <text x={cx} y={H - 4} textAnchor="middle" fill="var(--ink-3)">
                    {values.length - i}회 전
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
