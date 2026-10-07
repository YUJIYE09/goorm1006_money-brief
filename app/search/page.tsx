import type { Metadata } from "next";
import Link from "next/link";
import { formatTime } from "@/lib/format";
import { searchArticles } from "@/lib/repository";

export const metadata: Metadata = { title: "검색" };

const SUGGEST = ["삼성전자", "반도체", "금리", "환율", "2차전지"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const results = q ? searchArticles(q) : [];
  return (
    <>
      <div className="eyebrow"><span className="chip">검색</span>공개된 기사에서 찾습니다</div>
      <h1 className="page-title">무엇이 궁금하세요?</h1>
      <form className="search-form" action="/search" role="search">
        <label htmlFor="q" className="sr-only">검색어</label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="종목, 지표, 키워드" autoComplete="off" />
        <button className="btn" type="submit">검색</button>
      </form>
      <div className="suggest">
        <span>추천</span>
        {SUGGEST.map((s) => (
          <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}>{s}</Link>
        ))}
      </div>

      {q && (
        <section className="sec">
          <div className="sec-h">
            <h2>‘{q}’ 검색 결과</h2>
            <span className="aside">{results.length}건</span>
          </div>
          {results.length ? (
            <div className="list-news">
              {results.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="list-item">
                  <h3>{a.title}</h3>
                  <span className="meta">{a.kicker} · {formatTime(a.published_at)}</span>
                  <p>{a.summary}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty">맞는 기사가 없습니다. 더 짧은 단어나 추천 검색어로 찾아보세요.</p>
          )}
        </section>
      )}
    </>
  );
}
