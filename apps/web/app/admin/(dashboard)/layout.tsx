import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "../actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/cities", label: "Cities" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/tools", label: "Tools" },
];

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-nav.svg" alt="Griham Connect" className="h-5 w-auto" />
            <span className="text-sm text-ink-soft">Admin</span>
          </div>
          <nav className="flex gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 py-2.5 text-sm text-ink-soft hover:text-griham-green"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="min-h-11 text-sm text-ink-soft underline hover:text-ink">
            Log out
          </button>
        </form>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
