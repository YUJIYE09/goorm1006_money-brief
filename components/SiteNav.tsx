"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "오늘" },
  { href: "/articles", label: "뉴스" },
  { href: "/market", label: "시장" },
  { href: "/calendar", label: "캘린더" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

const icons: Record<string, React.ReactNode> = {
  "/": <path d="M4 11l8-7 8 7v9H4z" />,
  "/articles": <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
  "/market": <path d="M3 17l6-6 4 4 8-8" />,
  "/calendar": <><rect x="4" y="5" width="16" height="15" rx="1" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  "/search": <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></>,
};

function Icon({ k }: { k: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      {icons[k]}
    </svg>
  );
}

export function TopNav() {
  const path = usePathname();
  return (
    <nav className="top-nav" aria-label="주요 메뉴">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="하단 메뉴">
      {[...NAV, { href: "/search", label: "검색" }].map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}>
          <Icon k={n.href} />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function SearchLink() {
  return (
    <Link href="/search" className="search-link" aria-label="검색">
      <Icon k="/search" />
    </Link>
  );
}
