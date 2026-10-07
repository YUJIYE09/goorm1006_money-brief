import { NextResponse } from "next/server";
import { getArticle } from "@/lib/repository";

// GET /api/articles/{id} — 뉴스 상세. 검수 전 기사는 404로 숨긴다.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) return NextResponse.json({ error: "기사를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json(article);
}
