import type { Article } from "@/lib/types";

/** 18장 콘텐츠 신뢰성: AI 사용 여부와 편집자 검수 여부를 항상 보여준다 */
export function TrustLine({ article }: { article: Pick<Article, "ai_generated" | "editor_approved"> }) {
  const parts = [article.ai_generated ? "AI 보조 작성" : "기자 작성", article.editor_approved ? "편집자 검수 완료" : "검수 전"];
  return (
    <span className="badge-trust">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--s3)" strokeWidth="2.6" aria-hidden="true">
        <path d="M4 12.5l5 5L20 6" />
      </svg>
      {parts.join(" · ")}
    </span>
  );
}
