import "server-only";

// API 키는 서버에서만 읽는다 (명세서 17장). 값은 로그나 응답에 절대 싣지 않는다.
export const keys = {
  opendart: process.env.OPENDART_API_KEY?.trim() || "",
  ecos: process.env.ECOS_API_KEY?.trim() || "",
  krx: process.env.KRX_API_KEY?.trim() || "",
};

/** 같은 데이터를 여러 화면이 쓰므로 10분 동안 캐시한다 */
export const REVALIDATE_SECONDS = 600;

export function ymd(d: Date, sep = "") {
  const p = (n: number) => String(n).padStart(2, "0");
  return [d.getFullYear(), p(d.getMonth() + 1), p(d.getDate())].join(sep);
}

