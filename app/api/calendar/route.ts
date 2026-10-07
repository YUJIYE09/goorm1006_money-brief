import { NextResponse, type NextRequest } from "next/server";
import { getCalendar } from "@/lib/repository";

// GET /api/calendar?from=2026-10-05&to=2026-10-11&category=earnings — 투자 일정
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const events = getCalendar({
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    category: p.get("category") ?? undefined,
  });
  return NextResponse.json({ events });
}
