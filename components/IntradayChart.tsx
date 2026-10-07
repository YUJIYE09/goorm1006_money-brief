"use client";

import { intradayLabels, KOSPI_PREV_CLOSE, kospiIntraday } from "@/lib/data/series";
import { LineChart } from "./charts/LineChart";

/**
 * 홈의 코스피 차트. KRX 실데이터(일별 종가)가 있으면 최근 흐름을, 없으면 예시 장중 흐름을 그린다.
 * 장중 5분 데이터는 KRX 일별 API에 없어서 증권사 API를 붙이기 전까지는 일별로 보여준다.
 */
export function IntradayChart({ daily }: { daily?: { labels: string[]; values: number[] } }) {
  if (daily && daily.values.length >= 2) {
    const n = daily.values.length;
    return (
      <LineChart
        labels={daily.labels}
        series={[{ name: "코스피", color: "var(--up)", values: daily.values }]}
        area
        height={230}
        xTicks={[0, Math.round((n - 1) / 2), n - 1]}
        yFormat={(v) => v.toLocaleString("ko-KR")}
        tipFormat={(v) => v.toLocaleString("ko-KR", { minimumFractionDigits: 2 })}
        ariaLabel="코스피 최근 종가 흐름"
      />
    );
  }
  return (
    <LineChart
      labels={intradayLabels}
      series={[{ name: "코스피", color: "var(--up)", values: kospiIntraday }]}
      baseline={KOSPI_PREV_CLOSE}
      area
      height={230}
      xTicks={[0, 18, 42, 66, 78]}
      yFormat={(v) => v.toLocaleString("ko-KR")}
      tipFormat={(v) => v.toLocaleString("ko-KR", { minimumFractionDigits: 2 })}
      ariaLabel="코스피 장중 흐름"
    />
  );
}
