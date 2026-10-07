export function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || 1;
  const mag = Math.pow(10, Math.floor(Math.log10(span / count)));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => span / s <= count + 0.5) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

/** 아래쪽이 기준선에 붙고 위쪽만 둥근 막대 경로 (음수면 아래로) */
export function barPath(x: number, base: number, w: number, h: number, up = true) {
  const r = Math.min(4, w / 2, Math.abs(h));
  if (up) {
    const top = base - h;
    return `M${x} ${base} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + w - r} Q${x + w} ${top} ${x + w} ${top + r} V${base} Z`;
  }
  const bot = base + h;
  return `M${x} ${base} V${bot - r} Q${x} ${bot} ${x + r} ${bot} H${x + w - r} Q${x + w} ${bot} ${x + w} ${bot - r} V${base} Z`;
}
