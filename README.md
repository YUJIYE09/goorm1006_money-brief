# 머니브리프 (MoneyBrief) 웹 MVP

바쁜 개인투자자를 위해 금융 뉴스를 쉽게 해석하고 시장의 맥락까지 제공하는 금융 뉴스 미디어.
「MVP 기술명세서 v0.1」의 Phase 2(웹 MVP)를 인포그래픽 중심 디자인으로 구현했습니다.

> 지금 들어 있는 시세·실적·일정은 모두 **개발용 예시 데이터**입니다. Phase 3에서 DART·KRX·ECOS 데이터로 교체합니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run typecheck  # 타입 검사
```

Node.js 20 이상이 필요합니다.

## 화면

| 경로 | 내용 | 명세서 |
| --- | --- | --- |
| `/` | 오늘: 코스피 장중 차트, 3줄 요약, 업종 지도, 핵심 뉴스 카드, 이번 주 일정, 아침 브리핑 | 7장 홈 |
| `/articles` | 뉴스 목록 (편집자 검수를 마친 기사만) | 6장 |
| `/articles/[id]` | 뉴스 상세: 10초 요약 → 왜 중요한가 → 핵심 숫자 → 그래픽 → 투자자가 확인할 것 → 출처·검수 과정 | 6장, 18장 |
| `/market` | 지수 상대 수익률(기간 선택), 투자자별 순매수, 지수·환율·금리 표 | 3.1 시장 현황 |
| `/calendar` | 주간 투자 일정, 종류 필터, 과거 같은 일정 날의 코스피 반응 | 8장 |
| `/search` | 키워드 검색 (P1) | 3.1 |
| `/brief` | 아침 시장 브리핑 7개 항목 | 4.1 |

## API (명세서 15장)

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api/home` | 홈 화면 데이터 `{ date, market, top_news, calendar, morning_brief }` |
| GET | `/api/articles` | 공개된 기사 목록 |
| GET | `/api/articles/{id}` | 뉴스 상세. 검수 전 기사는 404 |
| GET | `/api/calendar?from=&to=&category=` | 투자 일정 |
| GET | `/api/market` | 지수·환율·금리·업종·수급 |
| GET | `/api/search?q=삼성전자` | 검색 |

## 구조

```
app/                 페이지와 API 라우트 (Next.js App Router)
components/          화면 컴포넌트
components/charts/   SVG 차트 (선, 막대, 누적 막대, 업종 지도, 반응 막대, 스파크라인)
lib/types.ts         데이터 모델 (Article, CalendarEvent, MarketSnapshot ...)
lib/repository.ts    데이터 접근 계층. 백엔드(FastAPI)가 생기면 이 파일만 API 호출로 바꾸면 된다
lib/data/            예시 데이터
app/globals.css      디자인 토큰 (색, 글꼴, 라이트/다크)
```

## 지켜야 할 원칙

- **편집자 승인 전 기사는 공개하지 않는다.** `lib/repository.ts`의 `isPublic()`이 `editor_approved === true && status === "PUBLISHED"`인 기사만 통과시킨다. 예시 데이터의 `news_20261007_006`(검수 대기 초안)은 목록·검색·API 어디에도 나오지 않아야 한다.
- 모든 기사에 출처, 데이터 기준 시점, 작성/업데이트 시간, AI 사용 여부, 편집자 검수 여부를 표시한다 (18장).
- 매수·매도 권유 표현을 쓰지 않는다. 기사와 브리핑 끝에 면책 문구를 둔다 (19장).
- 상승은 빨강(`--up`), 하락은 파랑(`--down`). 차트의 범주형 색은 3개(`--s1`~`--s3`)까지 쓰고 나머지는 기타 회색으로 묶는다.

## 다음 단계

1. Phase 3: DART·KRX·ECOS 수집기(FastAPI)와 PostgreSQL 연결, `lib/repository.ts`를 API 호출로 교체
2. Phase 4: CMS (AI 초안 · 팩트체크 · 컴플라이언스 · 편집자 승인 화면, 관리자 API)
3. P1: 관심종목, 푸시 알림
