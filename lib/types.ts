// 머니브리프 데이터 모델 (MVP 기술명세서 v0.1, 5·8·15장 기준)

/** 5.1 뉴스 상태. EDITOR_APPROVED 이전 상태의 기사는 사용자에게 공개하지 않는다. */
export type ArticleStatus =
  | "COLLECTED"
  | "RESEARCHING"
  | "DRAFT"
  | "FACT_CHECK"
  | "COMPLIANCE_CHECK"
  | "EDITOR_REVIEW"
  | "APPROVED"
  | "PUBLISHED";

export type Category = "실적" | "금리" | "환율" | "증시" | "공시" | "산업";

export interface KeyNumber {
  label: string;
  value: string;
  /** 전년 대비 등 변화율. 양수는 상승(빨강), 음수는 하락(파랑) */
  change?: number;
  changeLabel?: string;
}

export interface MarketImpact {
  title: string;
  detail: string;
  /** 확인 시점 (예: "10월 30일") */
  when?: string;
}

export interface Source {
  name: string;
  url?: string;
  type: "official" | "data" | "consensus" | "press";
}

export interface EditorReview {
  editor: string;
  approvedAt: string;
}

/** 기사 본문에 붙는 인포그래픽. 기사마다 0개 이상 */
export type Graphic =
  | {
      kind: "bars";
      title: string;
      subtitle: string;
      labels: string[];
      values: number[];
      unit: string;
      marker?: { index: number; value: number; label: string };
      source: string;
    }
  | {
      kind: "stack";
      title: string;
      subtitle: string;
      parts: string[];
      rows: { label: string; values: number[] }[];
      unit: string;
      source: string;
    }
  | {
      kind: "line";
      title: string;
      subtitle: string;
      labels: string[];
      values: number[];
      seriesName: string;
      unit: string;
      source: string;
    };

export interface ArticleSection {
  heading: string;
  body: string;
  graphic?: Graphic;
}

export interface Article {
  id: string;
  title: string;
  category: Category;
  kicker: string;
  /** 10초 요약 */
  summary: string;
  why_it_matters: string;
  key_numbers: KeyNumber[];
  market_impact: MarketImpact[];
  related_topics: string[];
  sources: Source[];
  sections: ArticleSection[];
  published_at: string;
  updated_at: string;
  data_as_of: string;
  ai_generated: boolean;
  editor_approved: boolean;
  status: ArticleStatus;
  review?: EditorReview;
  /** 홈 카드에 붙는 작은 그래픽 */
  cardGraphic?: CardGraphic;
}

export type CardGraphic =
  | { kind: "bullet"; label: string; actual: number; expected: number; max: number }
  | { kind: "spark"; label: string; seriesKey: SeriesKey; unit: string }
  | { kind: "range"; label: string; low: number; high: number; current: number };

export type SeriesKey = "kospi" | "spx" | "nikkei" | "usdkrw" | "ktb3y" | "ktb10y" | "ust10y";

export interface MarketQuote {
  key: SeriesKey;
  name: string;
  value: number;
  /** 표시용 단위 */
  unit: "pt" | "원" | "%";
  change: number;
  changePct: number;
}

export interface Sector {
  name: string;
  weight: number;
  changePct: number;
}

export interface InvestorFlow {
  investor: string;
  /** 순매수, 억 원 */
  amount: number;
}

export type EventCategory = "earnings" | "disclosure" | "fomc" | "bok" | "macro" | "bond_auction" | "holiday";

/** 8장 투자 캘린더 이벤트 */
export interface CalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  country: "KR" | "US" | "JP" | "CN" | "EU";
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (KST) 또는 "종일"
  importance: "high" | "medium" | "low";
  description: string;
  related_assets: string[];
  source: "official" | "company" | "exchange";
  /** 과거 같은 이벤트 날의 코스피 등락률(%), 오래된 순 */
  past_reactions?: number[];
}

export interface BriefItem {
  heading: string;
  text: string;
  articleId?: string;
}

export interface MorningBrief {
  id: string;
  date: string;
  title: string;
  items: BriefItem[];
  published_at: string;
  ai_generated: boolean;
  editor_approved: boolean;
}

export interface MarketSnapshot {
  asOf: string;
  quotes: MarketQuote[];
  sectors: Sector[];
  flows: InvestorFlow[];
  /** 실데이터로 받은 일별 시계열 (오래된 순). 없으면 화면은 예시 시계열을 쓴다 */
  history?: Partial<Record<SeriesKey, { labels: string[]; values: number[] }>>;
  /** 어떤 출처가 실데이터로 채워졌는지 */
  live: { ecos: boolean; dart: boolean };
}

/** 오픈다트 공시 한 건 */
export interface Disclosure {
  corpName: string;
  stockCode: string;
  title: string;
  receiptNo: string;
  receiptDate: string; // YYYY-MM-DD
  url: string;
  isEarnings: boolean;
}

/** GET /api/home 응답 */
export interface HomePayload {
  date: string;
  market: MarketSnapshot;
  top_news: Article[];
  calendar: CalendarEvent[];
  morning_brief: MorningBrief;
  disclosures: Disclosure[];
}
