import type { Metadata } from "next";
import Link from "next/link";
import { TrustLine } from "@/components/TrustLine";
import { formatTime } from "@/lib/format";
import { getPublishedArticles } from "@/lib/repository";

export const metadata: Metadata = { title: "뉴스" };

export default function ArticlesPage() {
  const list = getPublishedArticles();
  return (
    <>
      <div className="eyebrow"><span className="chip">뉴스</span>편집자 검수를 마친 기사만 보여줍니다</div>
      <h1 className="page-title">오늘의 금융 뉴스</h1>
      <p className="page-dek">기사마다 10초 요약과 왜 중요한지를 먼저 보여줍니다.</p>
      <div className="list-news" style={{ marginTop: 24 }}>
        {list.map((a) => (
          <Link key={a.id} href={`/articles/${a.id}`} className="list-item">
            <h3>{a.title}</h3>
            <span className="meta">{a.kicker} · {formatTime(a.published_at)}</span>
            <p>{a.summary}</p>
            <span style={{ gridColumn: 1 }}><TrustLine article={a} /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
