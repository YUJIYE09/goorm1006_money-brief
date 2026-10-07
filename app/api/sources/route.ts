import { NextResponse } from "next/server";
import { getDisclosures, getMarket } from "@/lib/repository";
import { keys } from "@/lib/sources/env";

// GET /api/sources — 데이터 연동 상태 확인용. 키 값은 절대 내보내지 않고 설정 여부만 알려준다.
export const dynamic = "force-dynamic";

export async function GET() {
  const [market, disclosures] = await Promise.all([getMarket(), getDisclosures(1)]);
  return NextResponse.json({
    ecos: { keySet: Boolean(keys.ecos), live: market.live.ecos, series: Object.keys(market.history ?? {}).filter((k) => k !== "kospi"), asOf: market.asOf },
    krx: { keySet: Boolean(keys.krx), live: market.live.krx, sectors: market.sectorsAsOf ? market.sectors.length : 0, kospi: market.live.krx ? market.quotes.find((q) => q.key === "kospi")?.value : null },
    opendart: { keySet: Boolean(keys.opendart), live: disclosures.live, sample: disclosures.items[0]?.title ?? null },
  });
}
