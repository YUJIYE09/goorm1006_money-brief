/** 정적 스파크라인 (서버 컴포넌트에서도 쓸 수 있다) */
export function Sparkline({ values, color, width = 96, height = 36 }: { values: number[]; color: string; width?: number; height?: number }) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const n = values.length;
  const x = (i: number) => 2 + (i * (width - 6)) / (n - 1);
  const y = (v: number) => 3 + (height - 6) - ((v - lo) / (hi - lo || 1)) * (height - 6);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx={x(n - 1)} cy={y(values[n - 1])} r={3} fill={color} />
    </svg>
  );
}
