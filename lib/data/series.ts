// 예시 시계열. 실제 서비스에서는 KRX·ECOS 수집 데이터로 교체한다.
import type { SeriesKey } from "../types";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function walk(n: number, start: number, vol: number, seed: number, drift = 0) {
  const r = rng(seed);
  const out = [start];
  for (let i = 1; i < n; i++) out.push(out[i - 1] * (1 + drift + (r() - 0.5) * 2 * vol));
  return out;
}

/** 마지막 값이 end가 되도록 선형 보정 */
function landAt(a: number[], end: number) {
  const d = end - a[a.length - 1];
  return a.map((v, i) => v + (d * i) / (a.length - 1));
}

const round = (a: number[], digits: number) => a.map((v) => +v.toFixed(digits));

export const AS_OF = new Date(2026, 9, 7);

/** 기준일부터 거꾸로 센 영업일 n개 (주말 제외) */
export function businessDays(n: number, until = AS_OF) {
  const days: Date[] = [];
  const d = new Date(until);
  while (days.length < n) {
    const w = d.getDay();
    if (w !== 0 && w !== 6) days.unshift(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return days.map((x) => `${x.getMonth() + 1}.${String(x.getDate()).padStart(2, "0")}`);
}

const N = 250;

export const dailySeries: Record<SeriesKey, number[]> = {
  kospi: round(landAt(walk(N, 2720, 0.009, 7, 0.0011), 3512.4), 2),
  kosdaq: round(landAt(walk(N, 760, 0.011, 17, 0.0005), 871.15), 2),
  spx: round(landAt(walk(N, 5900, 0.007, 23, 0.0005), 6742.1), 2),
  nikkei: round(landAt(walk(N, 39500, 0.01, 41, 0.0006), 46210.3), 2),
  usdkrw: round(landAt(walk(N, 1330, 0.003, 5), 1384.5), 2),
  ktb3y: round(landAt(walk(N, 2.7, 0.005, 9), 2.41), 3),
  ktb10y: round(landAt(walk(N, 3.0, 0.005, 13), 2.78), 3),
  ust10y: round(landAt(walk(N, 4.4, 0.006, 3), 4.06), 3),
};

export const dailyLabels = businessDays(N);

export const intradayLabels: string[] = [];
for (let m = 0; m <= 390; m += 5) {
  const h = 9 + Math.floor(m / 60);
  intradayLabels.push(`${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
}

export const KOSPI_PREV_CLOSE = 3484.54;
export const kospiIntraday = round(landAt(walk(intradayLabels.length, KOSPI_PREV_CLOSE, 0.0016, 11, 0.0001), 3512.4), 2);
