import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/repository";

// GET /api/articles — 공개된 기사 목록 (편집자 승인 + 발행 상태만)
export function GET() {
  return NextResponse.json({ articles: getPublishedArticles() });
}
