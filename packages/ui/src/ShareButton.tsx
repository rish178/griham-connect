"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — silently no-op rather than error the page.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex min-h-11 items-center gap-1.5 rounded-sm border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:text-ink"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-griham-green" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          Share
        </>
      )}
    </button>
  );
}
