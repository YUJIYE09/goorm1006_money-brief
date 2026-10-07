import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "48px 0" }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">찾는 페이지가 없습니다</h1>
      <p className="page-dek">기사가 아직 편집자 검수 중이거나 주소가 바뀌었을 수 있습니다.</p>
      <p style={{ marginTop: 20 }}><Link className="btn-line" href="/">오늘 지면으로 가기</Link></p>
    </div>
  );
}
