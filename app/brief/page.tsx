import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustLine } from "@/components/TrustLine";
import { formatDateTime } from "@/lib/format";
import { getMorningBrief } from "@/lib/repository";

export const metadata: Metadata = { title: "아침 시장 브리핑" };

export default function BriefPage() {
  const brief = getMorningBrief();
  if (!brief) notFound();
  return (
    <article className="article">
      <div className="eyebrow"><span className="chip">MORNING BRIEF</span>매일 오전 7시 발행</div>
      <h1 className="page-title">{brief.title}</h1>
      <div className="art-meta">
        <span className="num">{formatDateTime(brief.published_at)}</span>
        <TrustLine article={brief} />
        <span className="example">예시 내용</span>
      </div>
      <ol className="brief-list">
        {brief.items.map((it) => (
          <li key={it.heading}>
            <div>
              <h2>{it.heading}</h2>
              <p>{it.text}</p>
              {it.articleId && <Link href={`/articles/${it.articleId}`}>관련 기사 보기 →</Link>}
            </div>
          </li>
        ))}
      </ol>
      <p className="disclaimer">이 브리핑은 시장 이해를 돕기 위한 정보이며 특정 종목의 매수나 매도를 권유하지 않습니다.</p>
    </article>
  );
}
