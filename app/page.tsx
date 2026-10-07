import Link from "next/link";
import { CardGraphic } from "@/components/CardGraphic";
import { IntradayChart } from "@/components/IntradayChart";
import { Sparkline } from "@/components/charts/Sparkline";
import { Treemap } from "@/components/charts/Treemap";
import { WeekStrip } from "@/components/WeekStrip";
import { dailySeries, KOSPI_PREV_CLOSE } from "@/lib/data/series";
import { arrow, dir, fmt, signed } from "@/lib/format";
import { getHome } from "@/lib/repository";
import type { MarketQuote } from "@/lib/types";

const quoteValue = (q: MarketQuote) => (q.unit === "%" ? `${fmt(q.value)}%` : fmt(q.value));
const quoteChange = (q: MarketQuote) => (q.unit === "%" ? `${fmt(Math.abs(q.change))}%p` : q.unit === "원" ? fmt(Math.abs(q.change)) : `${Math.abs(q.changePct).toFixed(2)}%`);

export default async function HomePage() {
  const home = await getHome();
  const live = home.market.live;
  const q = Object.fromEntries(home.market.quotes.map((x) => [x.key, x]));
  const kospi = q.kospi;
  const side = [q.usdkrw, q.ktb3y, q.spx];
  const [lead, ...rest] = home.top_news;
  const cards = [lead, ...rest.filter((a) => a.cardGraphic)].slice(0, 3);
  const others = home.top_news.filter((a) => !cards.includes(a));

  return (
    <>
      <div className="eyebrow">
        <span className="chip">오늘의 지면</span>10월 7일 수요일 · {live.ecos ? "환율·금리는 ECOS 실데이터, 나머지는 예시" : "예시 데이터"}
      </div>
      <h1 className="page-title">반도체가 끌어올린 하루, 코스피 3,500선 위로</h1>
      <p className="page-dek">삼성전자 실적이 예상을 넘으면서 반도체 업종이 지수를 이끌었습니다. 오늘 시장을 숫자와 그래픽으로 정리했습니다.</p>

      <div className="hero">
        <div className="card hero-main">
          <div className="hero-top">
            <div>
              <div className="eyebrow">코스피 · 종가</div>
              <div className="big">{fmt(kospi.value)}</div>
              <div className="big-sub">
                <span className={`pill ${dir(kospi.change)}`}>
                  {arrow(kospi.change)} {fmt(Math.abs(kospi.change))} {signed(kospi.changePct, 2, "%")}
                </span>
                <span>전일 {fmt(KOSPI_PREV_CLOSE)}</span>
              </div>
            </div>
            <span className="example">예시 수치</span>
          </div>
          <IntradayChart />
          <p className="src">5분 단위, 09:00–15:30 · 점선은 전일 종가 · 출처 KRX</p>
        </div>
        <div className="hero-side">
          {side.map((s) => (
            <Link key={s.key} href="/market" className="card mini" style={{ textDecoration: "none" }}>
              <span className="lbl">{s.name}</span>
              <span className="val">{quoteValue(s)}</span>
              <span className="spark">
                <Sparkline values={(home.market.history?.[s.key]?.values ?? dailySeries[s.key]).slice(-30)} color={s.change >= 0 ? "var(--up)" : "var(--down)"} />
              </span>
              <span className={`chg ${dir(s.change)}`}>
                {arrow(s.change)} {quoteChange(s)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="summary3">
        <div>
          <b>01 · 반도체</b>
          <p>삼성전자 영업이익 <mark>10.2조 원</mark>, 시장 예상보다 8.5% 많았습니다.</p>
        </div>
        <div>
          <b>02 · 환율</b>
          <p>원/달러 <mark>1,384.5원</mark>. 외국인 순매수에도 달러 강세가 이어졌습니다.</p>
        </div>
        <div>
          <b>03 · 금리</b>
          <p>국고채 3년물 <mark>2.41%</mark>, 미국 금리 하락을 따라 내렸습니다.</p>
        </div>
      </div>

      <section className="sec">
        <div className="sec-h">
          <h2>업종 지도</h2>
          <span className="aside">크기는 시가총액, 색은 등락률</span>
        </div>
        <div className="card">
          <Treemap sectors={home.market.sectors} />
        </div>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2>오늘의 핵심 뉴스</h2>
          <Link href="/articles">전체 기사</Link>
        </div>
        <div className="news-grid">
          {cards.map((a) => (
            <Link key={a.id} className="card news-card" href={`/articles/${a.id}`}>
              <span className="kick">{a.kicker}</span>
              <h3>{a.title}</h3>
              <p>{a.summary}</p>
              {a.cardGraphic && <CardGraphic g={a.cardGraphic} />}
            </Link>
          ))}
        </div>
        {others.length > 0 && (
          <div className="list-news" style={{ marginTop: 18 }}>
            {others.map((a) => (
              <Link key={a.id} href={`/articles/${a.id}`} className="list-item">
                <h3>{a.title}</h3>
                <span className="meta">{a.kicker}</span>
                <p>{a.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2>최신 공시</h2>
          <span className="aside">{live.dart ? "오픈다트 실데이터 · 상장사 거래소 공시" : "예시 공시 · 오픈다트 연결 전"}</span>
        </div>
        <div className="list-news">
          {home.disclosures.map((d) => (
            <a key={d.receiptNo} href={d.url} target="_blank" rel="noopener noreferrer" className="list-item">
              <h3>
                {d.isEarnings && <span className="today-tag" style={{ marginRight: 8 }}>실적</span>}
                {d.corpName} · {d.title}
              </h3>
              <span className="meta">{d.receiptDate.slice(5).replace("-", ".")} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2>이번 주 일정</h2>
          <Link href="/calendar">캘린더</Link>
        </div>
        <WeekStrip days={["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"]} events={home.calendar} />
      </section>

      {home.morning_brief && (
        <div className="brief-band">
          <div>
            <div className="eyebrow" style={{ color: "inherit", opacity: 0.7 }}>MORNING BRIEF · 매일 오전 7시</div>
            <h2>{home.morning_brief.title}</h2>
            <p>AI가 초안을 쓰고 편집자가 검수한 뒤 발행합니다. 5분이면 읽을 수 있어요.</p>
            <div className="brief-steps">
              {home.morning_brief.items.map((it) => (
                <span key={it.heading}>{it.heading}</span>
              ))}
            </div>
          </div>
          <Link className="btn" href="/brief">
            오늘 브리핑 읽기
          </Link>
        </div>
      )}
    </>
  );
}
