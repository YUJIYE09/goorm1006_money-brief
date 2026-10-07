import type { MarketSnapshot } from "../types";

// 예시 데이터. 기준: 2026-10-07 15:30 장 마감
export const marketSnapshot: MarketSnapshot = {
  asOf: "2026-10-07T15:30:00+09:00",
  quotes: [
    { key: "kospi", name: "코스피", value: 3512.4, unit: "pt", change: 27.86, changePct: 0.8 },
    { key: "spx", name: "S&P 500", value: 6742.1, unit: "pt", change: 28.2, changePct: 0.42 },
    { key: "nikkei", name: "닛케이 225", value: 46210.3, unit: "pt", change: -129.8, changePct: -0.28 },
    { key: "usdkrw", name: "원/달러", value: 1384.5, unit: "원", change: 4.2, changePct: 0.3 },
    { key: "ktb3y", name: "국고채 3년", value: 2.41, unit: "%", change: -0.02, changePct: -0.83 },
    { key: "ktb10y", name: "국고채 10년", value: 2.78, unit: "%", change: -0.03, changePct: -1.07 },
    { key: "ust10y", name: "미 국채 10년", value: 4.06, unit: "%", change: -0.05, changePct: -1.22 },
  ],
  sectors: [
    { name: "반도체", weight: 30, changePct: 2.4 },
    { name: "금융", weight: 10, changePct: 0.3 },
    { name: "2차전지", weight: 9, changePct: 1.1 },
    { name: "자동차", weight: 8, changePct: -0.6 },
    { name: "바이오", weight: 7, changePct: -1.4 },
    { name: "기타", weight: 6, changePct: 0.2 },
    { name: "인터넷", weight: 5, changePct: -0.9 },
    { name: "방산", weight: 4, changePct: 2.0 },
    { name: "조선", weight: 4, changePct: 1.8 },
    { name: "화학", weight: 4, changePct: 0.5 },
    { name: "철강", weight: 3, changePct: -0.2 },
    { name: "통신", weight: 3, changePct: 0.1 },
    { name: "유통", weight: 3, changePct: -0.5 },
    { name: "건설", weight: 2, changePct: -1.1 },
    { name: "엔터", weight: 2, changePct: -2.1 },
  ],
  flows: [
    { investor: "외국인", amount: 3210 },
    { investor: "기관", amount: -1480 },
    { investor: "개인", amount: -1650 },
    { investor: "기타법인", amount: -80 },
  ],
  live: { ecos: false, dart: false },
};

/** 상단 티커에만 쓰는 추가 시세 */
export const tickerExtras = [
  { name: "코스닥", value: "871.15", changePct: -0.35 },
  { name: "나스닥", value: "22,914.6", changePct: 0.61 },
  { name: "WTI", value: "$61.88", changePct: -1.1 },
  { name: "금", value: "$3,962", changePct: 0.54 },
];
