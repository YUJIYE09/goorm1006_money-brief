import type { Metadata } from "next";
import { MarketView } from "@/components/MarketView";
import { getMarket } from "@/lib/repository";

export const metadata: Metadata = { title: "시장" };

export default function MarketPage() {
  return (
    <>
      <div className="eyebrow"><span className="chip">시장</span>10월 7일 장 마감 기준 · 예시 데이터</div>
      <h1 className="page-title">세계 증시, 같은 출발선에서 비교하기</h1>
      <p className="page-dek">기간 첫날을 100으로 맞춰 지수마다 얼마나 움직였는지 비교합니다. 기간을 바꾸면 아래 그래픽이 모두 같이 바뀝니다.</p>
      <MarketView market={getMarket()} />
    </>
  );
}
