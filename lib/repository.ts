// 데이터 접근 계층. 지금은 예시 데이터를 읽지만, 나중에 FastAPI 백엔드 호출로 바꿔도
// 화면과 API 라우트는 이 함수들만 쓰므로 그대로 둘 수 있다.
import { articles } from "./data/articles";
import { sampleDisclosures } from "./data/disclosures";
import { ECOS_SERIES, fetchEcosDaily, type EcosKey } from "./sources/ecos";
import { fetchKrxDaily } from "./sources/krx";
import { fetchDisclosures } from "./sources/opendart";
import { morningBrief } from "./data/brief";
import { events } from "./data/events";
import { marketSnapshot } from "./data/market";
import type { Article, CalendarEvent, Disclosure, HomePayload, MarketQuote, MarketSnapshot, MorningBrief } from "./types";

/** 편집자 승인 + 발행 상태인 기사만 공개한다 (명세서 5.1, 13장 원칙). */
export function isPublic(a: Pick<Article, "editor_approved" | "status">) {
  return a.editor_approved === true && a.status === "PUBLISHED";
}

export function getPublishedArticles(): Article[] {
  return articles.filter(isPublic).sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export function getArticle(id: string): Article | undefined {
  const a = articles.find((x) => x.id === id);
  return a && isPublic(a) ? a : undefined;
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return getPublishedArticles()
    .filter((a) => a.id !== article.id)
    .map((a) => ({ a, score: a.related_topics.filter((t) => article.related_topics.includes(t)).length + (a.category === article.category ? 1 : 0) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a);
}

export function getMorningBrief(): MorningBrief | undefined {
  return morningBrief.editor_approved ? morningBrief : undefined;
}

/** 예시 스냅샷 (실데이터가 없을 때의 기본값) */
export function getSampleMarket(): MarketSnapshot {
  return marketSnapshot;
}

/**
 * 시장 데이터. 키가 있는 출처부터 실데이터로 바꾼다.
 * - ECOS: 원/달러, 국고채 3년·10년
 * - KRX: 코스피·코스닥 종가, 코스피 업종 지도, 코스피 최근 종가 흐름
 * 키가 없거나 조회가 실패한 항목은 예시 값을 그대로 둔다.
 */
export async function getMarket(): Promise<MarketSnapshot> {
  const keysToLoad = Object.keys(ECOS_SERIES) as EcosKey[];
  const [results, krx] = await Promise.all([Promise.all(keysToLoad.map((k) => fetchEcosDaily(k))), fetchKrxDaily()]);
  const history: MarketSnapshot["history"] = {};
  let quotes: MarketQuote[] = marketSnapshot.quotes;
  let asOf = marketSnapshot.asOf;

  results.forEach((r, i) => {
    const key = keysToLoad[i];
    if (!r || r.values.length < 2) return;
    history[key] = { labels: r.labels, values: r.values };
    const last = r.values[r.values.length - 1];
    const prev = r.values[r.values.length - 2];
    quotes = quotes.map((q) =>
      q.key === key ? { ...q, value: last, change: +(last - prev).toFixed(3), changePct: +(((last - prev) / prev) * 100).toFixed(2) } : q,
    );
    asOf = `${r.dates[r.dates.length - 1]}T00:00:00+09:00`;
  });

  const ecosLive = Object.keys(history).length > 0;
  let sectors = marketSnapshot.sectors;
  if (krx) {
    quotes = quotes.map((q) => (q.key === "kospi" ? { ...q, ...krx.kospi } : q.key === "kosdaq" && krx.kosdaq ? { ...q, ...krx.kosdaq } : q));
    if (krx.sectors.length >= 4) sectors = krx.sectors;
    if (krx.kospiHistory.values.length >= 2) history.kospi = krx.kospiHistory;
    asOf = `${krx.date}T15:30:00+09:00`;
  }
  const anyLive = ecosLive || Boolean(krx);
  return {
    ...marketSnapshot,
    quotes,
    sectors,
    sectorsAsOf: krx && sectors !== marketSnapshot.sectors ? krx.date : undefined,
    asOf: anyLive ? asOf : marketSnapshot.asOf,
    history: Object.keys(history).length ? history : undefined,
    live: { ecos: ecosLive, dart: false, krx: Boolean(krx) },
  };
}

/** 최근 상장사 공시. 오픈다트 키가 없거나 실패하면 예시 공시 */
export async function getDisclosures(limit = 8): Promise<{ items: Disclosure[]; live: boolean }> {
  const live = await fetchDisclosures({ limit });
  return live ? { items: live, live: true } : { items: sampleDisclosures.slice(0, limit), live: false };
}

// "종일" 일정은 그날 맨 앞에 둔다
const sortTime = (t: string) => (t === "종일" ? "00:00" : t);

export function getCalendar(opts: { from?: string; to?: string; category?: string } = {}): CalendarEvent[] {
  return events
    .filter((e) => (!opts.from || e.date >= opts.from) && (!opts.to || e.date <= opts.to))
    .filter((e) => !opts.category || e.category === opts.category)
    .sort((a, b) => (a.date + sortTime(a.time)).localeCompare(b.date + sortTime(b.time)));
}

export function searchArticles(q: string): Article[] {
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return getPublishedArticles().filter((a) => {
    const hay = [a.title, a.summary, a.why_it_matters, a.kicker, ...a.related_topics].join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export async function getHome(): Promise<HomePayload> {
  const brief = getMorningBrief();
  const [market, disclosures] = await Promise.all([getMarket(), getDisclosures(6)]);
  return {
    date: "2026-10-07",
    market: { ...market, live: { ...market.live, dart: disclosures.live } },
    disclosures: disclosures.items,
    top_news: getPublishedArticles().slice(0, 5),
    calendar: getCalendar({ from: "2026-10-05", to: "2026-10-09" }),
    morning_brief: brief!,
  };
}
