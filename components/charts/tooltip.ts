"use client";

// 페이지 전체에서 하나만 쓰는 차트 툴팁. 라벨은 항상 textContent로 넣는다.
export interface TipRow {
  value: string;
  label?: string;
  color?: string;
}

let tipEl: HTMLDivElement | null = null;

function ensure() {
  if (!tipEl) {
    tipEl = document.createElement("div");
    tipEl.className = "mb-tip";
    tipEl.setAttribute("role", "status");
    tipEl.setAttribute("aria-live", "polite");
    document.body.appendChild(tipEl);
  }
  return tipEl;
}

export function showTip(x: number, y: number, head: string, rows: TipRow[]) {
  const tip = ensure();
  tip.replaceChildren();
  const h = document.createElement("div");
  h.className = "t-h";
  h.textContent = head;
  tip.appendChild(h);
  for (const r of rows) {
    const row = document.createElement("div");
    row.className = "t-row";
    if (r.color) {
      const i = document.createElement("i");
      i.style.background = r.color;
      row.appendChild(i);
    }
    const b = document.createElement("b");
    b.textContent = r.value;
    row.appendChild(b);
    if (r.label) {
      const s = document.createElement("span");
      s.textContent = r.label;
      row.appendChild(s);
    }
    tip.appendChild(row);
  }
  const tw = tip.offsetWidth || 140;
  const th = tip.offsetHeight || 60;
  let left = x + 14;
  let top = y - th - 12;
  if (left + tw > window.innerWidth - 8) left = x - tw - 14;
  if (top < 8) top = y + 16;
  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top = `${top}px`;
  tip.classList.add("on");
}

export function hideTip() {
  tipEl?.classList.remove("on");
}

/** 포인터 이벤트가 없을 때(키보드 포커스) 요소 위치 기준으로 띄운다. */
export function tipAnchor(e: { clientX?: number; clientY?: number } | null, el: Element) {
  if (e && typeof e.clientX === "number" && typeof e.clientY === "number") return { x: e.clientX, y: e.clientY };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top };
}
