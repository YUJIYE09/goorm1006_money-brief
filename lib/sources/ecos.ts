import "server-only";
import { keys, REVALIDATE_SECONDS, ymd } from "./env";

// 한국은행 ECOS 통계 조회 API
// https://ecos.bok.or.kr/api/#/DevGuide/DevSpeciflcation
// 통계표·항목 코드는 ECOS '통계코드 검색'에서 다시 확인할 것.
export const ECOS_SERIES = {
  usdkrw: { stat: "731Y001", item: "0000001", name: "원/달러 환율(매매기준율)" },
  ktb3y: { stat: "817Y002", item: "010200000", name: "국고채 3년" },
  ktb10y: { stat: "817Y002", item: "010210000", name: "국고채 10년" },
} as const;

export type EcosKey = keyof typeof ECOS_SERIES;

interface EcosRow {
  TIME: string; // YYYYMMDD
  DATA_VALUE: string;
}

/** 일별 시계열을 오래된 순으로 돌려준다. 키가 없거나 실패하면 null */
export async function fetchEcosDaily(key: EcosKey, days = 400): Promise<{ labels: string[]; values: number[]; dates: string[] } | null> {
  if (!keys.ecos) return null;
  const { stat, item } = ECOS_SERIES[key];
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400_000);
  const url = `${process.env.ECOS_BASE_URL ?? "https://ecos.bok.or.kr"}/api/StatisticSearch/${encodeURIComponent(keys.ecos)}/json/kr/1/1000/${stat}/D/${ymd(start)}/${ymd(end)}/${item}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { StatisticSearch?: { row?: EcosRow[] }; RESULT?: { CODE: string; MESSAGE: string } };
    const rows = json.StatisticSearch?.row;
    if (!rows?.length) throw new Error(json.RESULT ? `${json.RESULT.CODE} ${json.RESULT.MESSAGE}` : "빈 응답");
    const clean = rows.filter((r) => r.DATA_VALUE && !Number.isNaN(Number(r.DATA_VALUE))).sort((a, b) => a.TIME.localeCompare(b.TIME));
    return {
      dates: clean.map((r) => `${r.TIME.slice(0, 4)}-${r.TIME.slice(4, 6)}-${r.TIME.slice(6, 8)}`),
      labels: clean.map((r) => `${Number(r.TIME.slice(4, 6))}.${r.TIME.slice(6, 8)}`),
      values: clean.map((r) => Number(r.DATA_VALUE)),
    };
  } catch (e) {
    console.warn(`[ecos] ${key} 조회 실패, 예시 데이터를 씁니다:`, (e as Error).message);
    return null;
  }
}
