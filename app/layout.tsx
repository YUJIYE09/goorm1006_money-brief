import type { Metadata, Viewport } from "next";
import { Archivo, Gothic_A1 } from "next/font/google";
import Link from "next/link";
import { SearchLink, TabBar, TopNav } from "@/components/SiteNav";
import { Ticker } from "@/components/Ticker";
import { getMarket } from "@/lib/repository";
import "./globals.css";

const gothic = Gothic_A1({ weight: ["400", "500", "700", "800", "900"], subsets: ["latin"], preload: false, variable: "--font-gothic", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "머니브리프", template: "%s | 머니브리프" },
  description: "바쁜 개인투자자를 위해 금융 뉴스를 쉽게 해석하고 시장의 맥락까지 제공하는 금융 뉴스 미디어",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d11" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const market = await getMarket();
  return (
    <html lang="ko" className={`${gothic.variable} ${archivo.variable}`}>
      <body>
        <header className="app-head">
          <div className="head-in">
            <Link className="logo" href="/" aria-label="머니브리프 홈">
              <span className="logo-mark">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0E1116" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12l4-4 3 3 5-6" />
                </svg>
              </span>
              <b>MoneyBrief</b>
            </Link>
            <TopNav />
            <div className="head-right">
              <span className="live-dot" aria-hidden="true" />
              <span className="when-long">2026년 10월 7일 수요일 ·</span>
              <span>15:30 장 마감</span>
              <SearchLink />
            </div>
          </div>
          <Ticker quotes={market.quotes} />
        </header>
        <main>{children}</main>
        <footer className="site-foot">
          <span>머니브리프는 시장 이해를 돕는 정보를 제공하며 특정 종목의 매수나 매도를 권유하지 않습니다.</span>
          <span>모든 기사는 AI 사용 여부와 편집자 검수 여부를 표시합니다. 현재 화면의 수치는 개발용 예시 데이터입니다.</span>
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
