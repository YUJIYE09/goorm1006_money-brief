// 데이터 접근 계층. 지금은 예시 데이터를 읽지만, 나중에 FastAPI 백엔드 호출로 바꿔도
// 화면과 API 라우트는 이 함수들만 쓰므로 그대로 둘 수 있다.
import { articles } from "./data/articles";
import { morningBrief } from "./data/brief";
import { events } from "./data/events";
import { marketSnapshot } from "./data/market";
import type { Article, CalendarEvent, HomePayload, MorningBrief } from "./types";

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

export function getMarket() {
  return marketSnapshot;
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

export function getHome(): HomePayload {
  const brief = getMorningBrief();
  return {
    date: "2026-10-07",
    market: getMarket(),
    top_news: getPublishedArticles().slice(0, 5),
    calendar: getCalendar({ from: "2026-10-05", to: "2026-10-09" }),
    morning_brief: brief!,
  };
}
