"use client";

import { intradayLabels, KOSPI_PREV_CLOSE, kospiIntraday } from "@/lib/data/series";
import { LineChart } from "./charts/LineChart";

export function IntradayChart() {
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
