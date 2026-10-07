import type { MorningBrief } from "../types";

// 4.1 아침 시장 브리핑 (예시)
export const morningBrief: MorningBrief = {
  id: "brief_20261007",
  date: "2026-10-07",
  title: "10월 7일 아침 시장 브리핑",
  published_at: "2026-10-07T07:00:00+09:00",
  ai_generated: true,
  editor_approved: true,
  items: [
    {
      heading: "오늘 가장 중요한 뉴스",
      text: "삼성전자가 오전 8시 3분기 잠정실적을 발표합니다. 시장은 영업이익 9.4조 원 안팎을 예상하고 있습니다.",
      articleId: "news_20261007_001",
    },
    { heading: "국내 증시", text: "코스피는 전날 3,484로 마쳤습니다. 반도체 업종의 실적 기대가 지수를 받치고 있습니다." },
    { heading: "해외 증시", text: "S&P 500은 0.4% 올랐습니다. 금리 하락에 기술주가 강했습니다." },
    { heading: "환율", text: "원/달러는 1,380원 안팎에서 출발할 것으로 보입니다.", articleId: "news_20261007_003" },
    { heading: "금리", text: "미 국채 10년물은 4.06%로 한 달 새 0.3%p 내렸습니다.", articleId: "news_20261007_002" },
    { heading: "주요 기업·공시", text: "LG전자도 오전 8시 30분 잠정실적을 공시합니다." },
    { heading: "오늘 확인할 이벤트", text: "내일 새벽 3시 FOMC 9월 회의 의사록이 공개됩니다. 9일은 한글날로 국내 증시가 쉽니다." },
  ],
};
