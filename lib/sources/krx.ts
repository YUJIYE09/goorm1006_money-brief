import "server-only";
import type { Sector } from "../types";
import { keys, REVALIDATE_SECONDS, ymd } from "./env";

// KRX Open API (openapi.krx.co.kr)
// 사용하는 서비스: 「KOSPI 시리즈 일별시세정보」, 「KOSDAQ 시리즈 일별시세정보」
// 각 서비스마다 KRX 사이트에서 '이용 신청'을 하고 승인을 받아야 호출된다.
// 데이터는 장 마감 뒤 일별로 올라오므로, 오늘 데이터가 없으면 하루씩 거슬러 올라가 가장 최근 영업일을 찾는다.
const BASE = () => process.env.KRX_BASE_URL ?? "https://data-dbg.krx.co.kr/svc/apis";

interface KrxIndexRow {
  BAS_DD: string;
  IDX_CLSS: string;
  IDX_NM: string;
  CLSPRC_IDX: string;
  CMPPREVDD_IDX: string;
  FLUC_RT: string;
  MKTCAP: string;
}

const num = (s: string | undefined) => {
  const n = Number(String(s ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

async function fetchIndexDay(market: "kospi" | "kosdaq", date: Date, revalidate: number): Promise<KrxIndexRow[]> {
  const res = await fetch(`${BASE()}/idx/${market}_dd_trd?basDd=${ymd(date)}`, {
    headers: { AUTH_KEY: keys.krx },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { OutBlock_1?: KrxIndexRow[]; respMsg?: string };
  if (!json.OutBlock_1) throw new Error(json.respMsg ?? "응답 형식이 다릅니다");
  return json.OutBlock_1;
}

/** 시장 대표 지수(코스피, 코스닥)의 행 */
const MAIN_INDEX = { kospi: "코스피", kosdaq: "코스닥" } as const;

/**
 * 업종 지도에서 뺄 지수. 시장 전체·규모별·테마 지수와 다른 업종을 묶은 상위 분류는 제외한다.
 * KRX가 업종 분류를 바꾸면 여기만 고치면 된다.
 */
const NOT_SECTOR = /^(코스피|코스닥)$|200|100|50|대형|중형|소형|배당|ESG|레버리지|인버스|선물|TR|^제조(업)?$|^금융업$|^서비스업$|우량|밸류업|고배당|커버드|변동성/;

export interface KrxDaily {
  date: string; // YYYY-MM-DD
  kospi: { value: number; change: number; changePct: number };
  kosdaq?: { value: number; change: number; changePct: number };
  sectors: Sector[];
  kospiHistory: { labels: string[]; values: number[] };
}

function toQuote(row?: KrxIndexRow) {
  if (!row) return undefined;
  const value = num(row.CLSPRC_IDX);
  if (Number.isNaN(value)) return undefined;
  return { value, change: num(row.CMPPREVDD_IDX), changePct: num(row.FLUC_RT) };
}

/** 최근 영업일의 코스피·코스닥 종가, 코스피 업종 등락, 코스피 최근 22영업일 종가. 키가 없거나 실패하면 null */
export async function fetchKrxDaily(historyDays = 22): Promise<KrxDaily | null> {
  if (!keys.krx) return null;
  try {
    // 1) 가장 최근 영업일 찾기 (최대 10일 전까지)
    let latest: { date: Date; rows: KrxIndexRow[] } | null = null;
    const d = new Date();
    for (let i = 0; i < 10 && !latest; i++) {
      const rows = await fetchIndexDay("kospi", d, REVALIDATE_SECONDS);
      if (rows.some((r) => r.IDX_NM === MAIN_INDEX.kospi)) latest = { date: new Date(d), rows };
      d.setDate(d.getDate() - 1);
    }
    if (!latest) throw new Error("최근 10일 안에 코스피 데이터가 없습니다");

    const kospiRow = latest.rows.find((r) => r.IDX_NM === MAIN_INDEX.kospi);
    const kosdaqRows = await fetchIndexDay("kosdaq", latest.date, REVALIDATE_SECONDS).catch(() => []);

    const sectors: Sector[] = latest.rows
      .filter((r) => !NOT_SECTOR.test(r.IDX_NM) && num(r.MKTCAP) > 0 && !Number.isNaN(num(r.FLUC_RT)))
      .map((r) => ({ name: r.IDX_NM.replace(/^코스피\s*/, ""), weight: num(r.MKTCAP), changePct: num(r.FLUC_RT) }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 16);

    // 2) 코스피 최근 종가 흐름. 지난 날짜는 바뀌지 않으므로 하루 동안 캐시한다
    const days: Date[] = [];
    const h = new Date(latest.date);
    while (days.length < historyDays + 8) {
      h.setDate(h.getDate() - 1);
      if (h.getDay() !== 0 && h.getDay() !== 6) days.unshift(new Date(h));
    }
    const past = await Promise.all(
      days.map((day) =>
        fetchIndexDay("kospi", day, 86400)
          .then((rows) => ({ day, v: toQuote(rows.find((r) => r.IDX_NM === MAIN_INDEX.kospi))?.value }))
          .catch(() => ({ day, v: undefined })),
      ),
    );
    const points = [...past.filter((p) => p.v != null), { day: latest.date, v: toQuote(kospiRow)!.value }].slice(-historyDays);

    return {
      date: ymd(latest.date, "-"),
      kospi: toQuote(kospiRow)!,
      kosdaq: toQuote(kosdaqRows.find((r) => r.IDX_NM === MAIN_INDEX.kosdaq)),
      sectors,
      kospiHistory: {
        labels: points.map((p) => `${p.day.getMonth() + 1}.${String(p.day.getDate()).padStart(2, "0")}`),
        values: points.map((p) => p.v as number),
      },
    };
  } catch (e) {
    console.warn("[krx] 조회 실패, 예시 데이터를 씁니다:", (e as Error).message);
    return null;
  }
}
