import "server-only";
import type { Disclosure } from "../types";
import { keys, REVALIDATE_SECONDS, ymd } from "./env";

// 오픈다트 공시검색 API
// https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001
interface DartItem {
  corp_name: string;
  stock_code: string;
  report_nm: string;
  rcept_no: string;
  rcept_dt: string; // YYYYMMDD
}

const EARNINGS = /잠정\)?실적|영업\(잠정\)실적|매출액또는손익구조/;

/**
 * 최근 공시 목록. 상장사(유가증권·코스닥)의 거래소 공시(I)를 가져온다.
 * 잠정실적 공시는 isEarnings=true. 키가 없거나 실패하면 null
 */
export async function fetchDisclosures(opts: { days?: number; limit?: number } = {}): Promise<Disclosure[] | null> {
  if (!keys.opendart) return null;
  const end = new Date();
  const start = new Date(end.getTime() - (opts.days ?? 3) * 86400_000);
  const params = new URLSearchParams({
    crtfc_key: keys.opendart,
    bgn_de: ymd(start),
    end_de: ymd(end),
    pblntf_ty: "I", // 거래소공시 (잠정실적이 여기에 들어온다)
    page_count: "100",
  });
  try {
    const res = await fetch(`${process.env.OPENDART_BASE_URL ?? "https://opendart.fss.or.kr"}/api/list.json?${params}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { status: string; message: string; list?: DartItem[] };
    // 013 = 조회된 데이터 없음 (정상)
    if (json.status === "013") return [];
    if (json.status !== "000") throw new Error(`${json.status} ${json.message}`);
    return (json.list ?? [])
      .filter((d) => d.stock_code)
      .map((d) => ({
        corpName: d.corp_name,
        stockCode: d.stock_code,
        title: d.report_nm.trim(),
        receiptNo: d.rcept_no,
        receiptDate: `${d.rcept_dt.slice(0, 4)}-${d.rcept_dt.slice(4, 6)}-${d.rcept_dt.slice(6, 8)}`,
        url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${d.rcept_no}`,
        isEarnings: EARNINGS.test(d.report_nm),
      }))
      .sort((a, b) => Number(b.isEarnings) - Number(a.isEarnings) || b.receiptNo.localeCompare(a.receiptNo))
      .slice(0, opts.limit ?? 30);
  } catch (e) {
    console.warn("[opendart] 공시 조회 실패, 예시 데이터를 씁니다:", (e as Error).message);
    return null;
  }
}
