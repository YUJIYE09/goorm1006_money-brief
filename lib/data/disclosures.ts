import type { Disclosure } from "../types";

// 오픈다트 키가 없을 때 쓰는 예시 공시
export const sampleDisclosures: Disclosure[] = [
  { corpName: "삼성전자", stockCode: "005930", title: "연결재무제표기준영업(잠정)실적(공정공시)", receiptNo: "20261007800001", receiptDate: "2026-10-07", url: "https://dart.fss.or.kr", isEarnings: true },
  { corpName: "LG전자", stockCode: "066570", title: "연결재무제표기준영업(잠정)실적(공정공시)", receiptNo: "20261007800002", receiptDate: "2026-10-07", url: "https://dart.fss.or.kr", isEarnings: true },
  { corpName: "한화에어로스페이스", stockCode: "012450", title: "단일판매ㆍ공급계약체결", receiptNo: "20261006800003", receiptDate: "2026-10-06", url: "https://dart.fss.or.kr", isEarnings: false },
  { corpName: "HD현대중공업", stockCode: "329180", title: "단일판매ㆍ공급계약체결", receiptNo: "20261006800004", receiptDate: "2026-10-06", url: "https://dart.fss.or.kr", isEarnings: false },
];
