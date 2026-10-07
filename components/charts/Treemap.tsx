"use client";

import { signed } from "@/lib/format";
import type { Sector } from "@/lib/types";
import { hideTip, showTip, tipAnchor } from "./tooltip";
import { useWidth } from "./useWidth";

type Box = Sector & { a: number; x: number; y: number; w: number; h: number };

function squarify(items: (Sector & { a: number })[], W: number, H: number): Box[] {
  const out: Box[] = [];
  let row: (Sector & { a: number })[] = [];
  const rest = items.slice();
  let x = 0, y = 0, w = W, h = H;
  const worst = (r: typeof row, len: number) => {
    const s = r.reduce((a, b) => a + b.a, 0);
    const mx = Math.max(...r.map((q) => q.a));
    const mn = Math.min(...r.map((q) => q.a));
    return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
  };
  const layout = () => {
    const s = row.reduce((a, b) => a + b.a, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      row.forEach((r) => { const rh = r.a / cw; out.push({ ...r, x, y: cy, w: cw, h: rh }); cy += rh; });
      x += cw; w -= cw;
    } else {
      const rh = s / w;
      let cx = x;
      row.forEach((r) => { const rw = r.a / rh; out.push({ ...r, x: cx, y, w: rw, h: rh }); cx += rw; });
      y += rh; h -= rh;
    }
    row = [];
  };
  while (rest.length) {
    const len = Math.min(w, h);
    if (!row.length || worst(row.concat(rest[0]), len) <= worst(row, len)) row.push(rest.shift()!);
    else layout();
  }
  if (row.length) layout();
  return out;
}

/** 등락률 → 발산형 색 단계. 0 근처는 회색 */
function diverge(v: number) {
  const a = Math.abs(v);
  const s = v >= 0 ? "u" : "d";
  if (a < 0.25) return { bg: "var(--mid)", fg: "var(--t-soft)" };
  if (a < 1) return { bg: `var(--${s}1)`, fg: "var(--t-soft)" };
  if (a < 2) return { bg: `var(--${s}2)`, fg: "var(--t-strong)" };
  return { bg: `var(--${s}3)`, fg: "var(--t-strong)" };
}

export function Treemap({ sectors }: { sectors: Sector[] }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const H = W < 600 ? 440 : 380;
  const total = sectors.reduce((a, s) => a + s.weight, 0);
  const boxes = W
    ? squarify(
        sectors.slice().sort((a, b) => b.weight - a.weight).map((s) => ({ ...s, a: (s.weight / total) * W * H })),
        W,
        H,
      )
    : [];

  return (
    <>
      <div ref={ref} className="treemap" style={{ height: H }} role="img" aria-label="코스피 업종별 등락률 지도">
        {boxes.map((t) => {
          const c = diverge(t.changePct);
          const show = (e: { clientX?: number; clientY?: number } | null, el: Element) => {
            const p = tipAnchor(e, el);
            showTip(p.x, p.y, t.name, [
              { value: signed(t.changePct, 2, "%"), label: "등락률" },
              { value: `${Math.round((t.weight / total) * 100)}%`, label: "시총 비중" },
            ]);
          };
          return (
            <div
              key={t.name}
              className={`tile${t.weight >= 20 ? " big-t" : ""}`}
              tabIndex={0}
              aria-label={`${t.name} ${signed(t.changePct, 1, "%")}`}
              style={{ left: t.x + 1, top: t.y + 1, width: Math.max(0, t.w - 2), height: Math.max(0, t.h - 2), background: c.bg, color: c.fg }}
              onPointerMove={(e) => show(e, e.currentTarget)}
              onPointerLeave={hideTip}
              onFocus={(e) => show(null, e.currentTarget)}
              onBlur={hideTip}
            >
              {t.w > 40 && t.h > 26 && <b>{t.name}</b>}
              {t.w > 66 && t.h > 52 && <span>{signed(t.changePct, 1, "%")}</span>}
            </div>
          );
        })}
      </div>
      <div className="scale">
        <span>하락</span>
        <span className="steps">
          {["d3", "d2", "d1", "mid", "u1", "u2", "u3"].map((k) => (
            <i key={k} style={{ background: `var(--${k})` }} />
          ))}
        </span>
        <span>상승</span>
        <span className="num" style={{ marginLeft: 6 }}>−2% · −1% · 0 · +1% · +2%</span>
      </div>
    </>
  );
}
