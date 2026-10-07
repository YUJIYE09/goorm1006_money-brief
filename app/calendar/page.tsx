import type { Metadata } from "next";
import { CalendarView } from "@/components/CalendarView";
import { getCalendar } from "@/lib/repository";

export const metadata: Metadata = { title: "투자 캘린더" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event } = await searchParams;
  return (
    <>
      <div className="eyebrow"><span className="chip">투자 캘린더</span>한국 시간 · 예시 일정</div>
      <h1 className="page-title">시장을 움직일 일정</h1>
      <p className="page-dek">일정을 누르면 과거에 같은 일정이 있던 날 코스피가 어떻게 움직였는지 함께 보여줍니다.</p>
      <CalendarView events={getCalendar()} initialEvent={event} />
    </>
  );
}
