import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleGraphic } from "@/components/ArticleGraphic";
import { TrustLine } from "@/components/TrustLine";
import { dir, formatDateTime, formatTime, signed } from "@/lib/format";
import { getArticle, getPublishedArticles, getRelatedArticles } from "@/lib/repository";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getPublishedArticles().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).id);
  return a ? { title: a.title, description: a.summary } : { title: "기사를 찾을 수 없습니다" };
}

const SOURCE_TYPE = { official: "원문", data: "데이터", consensus: "컨센서스", press: "보도" } as const;

export default async function ArticlePage({ params }: Props) {
  const article = getArticle((await params).id);
  if (!article) notFound();
  const related = getRelatedArticles(article);

  return (
    <article className="article">
      <div className="eyebrow">
        <span className="chip">{article.category}</span>
        {article.kicker}
      </div>
      <h1 className="page-title">{article.title}</h1>
      <div className="art-meta">
        <span className="num">
          {formatDateTime(article.published_at)}
          {article.updated_at !== article.published_at && ` · 업데이트 ${formatTime(article.updated_at)}`}
        </span>
        <TrustLine article={article} />
        <span className="example">예시 수치</span>
      </div>

      <div className="tldr">
        <div className="eyebrow">10초 요약</div>
        <p>{article.summary}</p>
      </div>

      {article.key_numbers.length > 0 && (
        <div className="stats">
          {article.key_numbers.map((k) => (
            <div className="stat" key={k.label}>
              <span className="lbl">{k.label}</span>
              <span className={`v${k.value.startsWith("+") ? " up" : k.value.startsWith("−") ? " down" : ""}`}>{k.value}</span>
              {(k.change != null || k.changeLabel) && (
                <span className={`chg c ${k.change != null ? dir(k.change) : "flat"}`}>
                  {k.changeLabel}
                  {k.change != null && ` ${signed(k.change, 1, "%")}`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="prose">
        <h2>왜 중요한가</h2>
        <p>{article.why_it_matters}</p>
      </div>

      {article.sections.map((s) => (
        <section key={s.heading}>
          <div className="prose">
            <h2>{s.heading}</h2>
            <p>{s.body}</p>
          </div>
          {s.graphic && <ArticleGraphic g={s.graphic} />}
        </section>
      ))}

      {article.market_impact.length > 0 && (
        <section>
          <div className="prose">
            <h2>투자자가 확인할 것</h2>
          </div>
          <ol className="checklist" style={{ listStyle: "none", padding: 0 }}>
            {article.market_impact.map((m, i) => (
              <li className="check" key={m.title}>
                <span className="ic" aria-hidden="true">{i + 1}</span>
                <div>
                  <b>{m.title}</b>
                  <span>{m.detail}</span>
                </div>
                {m.when && <span className="when">{m.when}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="topics">
        {article.related_topics.map((t) => (
          <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}>#{t}</Link>
        ))}
      </div>

      <div className="trust-box">
        <div className="eyebrow">이 기사가 만들어진 과정</div>
        <ol className="trust-steps">
          <li><b>데이터 수집</b><span>기준 {formatTime(article.data_as_of)}</span></li>
          <li><b>{article.ai_generated ? "AI 초안" : "기자 작성"}</b><span>{article.ai_generated ? "Claude" : "편집국"}</span></li>
          <li><b>팩트체크</b><span>원 데이터와 대조</span></li>
          <li><b>컴플라이언스</b><span>투자 권유 표현 검사</span></li>
          <li><b>편집자 승인</b><span>{article.review ? `${article.review.editor} · ${formatTime(article.review.approvedAt)}` : "검수 전"}</span></li>
        </ol>
        <dl>
          {(["official", "data", "consensus", "press"] as const)
            .filter((t) => article.sources.some((s) => s.type === t))
            .map((t) => (
              <div key={t} style={{ display: "contents" }}>
                <dt>{SOURCE_TYPE[t]}</dt>
                <dd>
                  {article.sources
                    .filter((s) => s.type === t)
                    .map((s) =>
                      s.url ? (
                        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.name} ↗
                        </a>
                      ) : (
                        <span key={s.name}>{s.name}</span>
                      ),
                    )}
                </dd>
              </div>
            ))}
          <dt>기준 시점</dt>
          <dd className="num">{formatDateTime(article.data_as_of)}</dd>
        </dl>
      </div>
      <p className="disclaimer">이 기사는 시장 이해를 돕기 위한 정보이며 특정 종목의 매수나 매도를 권유하지 않습니다.</p>

      {related.length > 0 && (
        <section className="sec">
          <div className="sec-h"><h2>관련 뉴스</h2></div>
          <div className="list-news">
            {related.map((a) => (
              <Link key={a.id} href={`/articles/${a.id}`} className="list-item">
                <h3>{a.title}</h3>
                <span className="meta">{formatTime(a.published_at)}</span>
                <p>{a.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
