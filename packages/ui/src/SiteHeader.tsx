import { Search } from "lucide-react";
import { Container } from "./Container";

const NAV_ITEMS = ["Tools", "Properties", "Locations", "Insights", "About"];

/**
 * Static site chrome, transparent over the hero image — no background
 * container. Nav items are plain labels, not links — /tools, /properties
 * etc. don't exist as pages yet, so this doesn't pretend they do.
 * "Get Started" is the one real action (anchors to the Property Health card).
 */
export function SiteHeader() {
  return (
    <header className="relative z-10 py-5">
      <Container className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <a href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-nav.svg" alt="Griham Connect" className="h-6 w-auto sm:h-7" />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <span key={item} className="text-sm font-medium text-ink-soft">
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-white/50 sm:inline-flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hidden min-h-11 items-center rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur-sm sm:inline-flex"
          >
            Sign in
          </button>
          <a
            href="#property-health-card"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-griham-green px-4 py-2.5 text-sm font-medium text-white hover:bg-griham-green/90"
          >
            Get Started →
          </a>
        </div>
      </Container>
    </header>
  );
}
