"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "CHAT" },
  { href: "/market", label: "MARKET" },
  { href: "/archive", label: "ARCHIVE" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b shrink-0 flex items-center px-4 sm:px-6 gap-1"
      style={{ borderColor: "#2a2a2a", background: "#0d0d0d", height: "37px" }}
    >
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded transition-colors"
            style={{
              color: active ? "#E0E0D0" : "#4a4a4a",
              background: active ? "#1a1a1a" : "transparent",
              borderBottom: active ? "1px solid #3B8BEB" : "1px solid transparent",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
