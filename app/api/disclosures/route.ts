import { NextResponse } from "next/server";
import { getDisclosures } from "@/lib/repository";

// GET /api/disclosures — 최근 상장사 공시 (오픈다트)
export async function GET() {
  return NextResponse.json(await getDisclosures(30));
}
