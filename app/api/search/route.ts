import { NextResponse, type NextRequest } from "next/server";
import { searchArticles } from "@/lib/repository";

// GET /api/search?q=삼성전자 — 기본 키워드 검색 (P1)
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ q, results: searchArticles(q) });
}
