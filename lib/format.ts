export const fmt = (v: number, digits = 2) =>
  v.toLocaleString("ko-KR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 부호가 붙은 숫자. 마이너스는 타이포그래피용 −(U+2212)를 쓴다. */
export const signed = (v: number, digits = 2, suffix = "") =>
  (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), digits) + suffix;

export const dir = (v: number): "up" | "down" | "flat" => (v > 0 ? "up" : v < 0 ? "down" : "flat");
export const arrow = (v: number) => (v > 0 ? "▲" : v < 0 ? "▼" : "–");

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-07T08:12:00+09:00" → "2026.10.07 08:12" */
export function formatDateTime(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]} ${m[4]}:${m[5]}` : iso;
}

export function formatTime(iso: string) {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

/** "2026-10-07" → { md: "10월 7일", weekday: "수", long: "10월 7일 수요일" } */
export function formatDay(date: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const w = WEEK[new Date(y, mo - 1, d).getDay()];
  return { md: `${mo}월 ${d}일`, weekday: w, long: `${mo}월 ${d}일 ${w}요일`, day: d };
}

export const TODAY = "2026-10-07";
