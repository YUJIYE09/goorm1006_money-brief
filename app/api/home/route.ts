import { NextResponse } from "next/server";
import { getHome } from "@/lib/repository";

// GET /api/home — 홈 화면 데이터 (명세서 15장)
export function GET() {
  return NextResponse.json(getHome());
}
