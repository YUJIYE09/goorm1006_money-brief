import { NextResponse } from "next/server";
import { getMarket } from "@/lib/repository";

// GET /api/market — 주요 지수·환율·금리
export function GET() {
  return NextResponse.json(getMarket());
}
