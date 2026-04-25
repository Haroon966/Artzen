"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Matches Tailwind `md` (768px): viewports below this count as “mobile” for landing. */
const MOBILE_MAX_PX = 767;
const DISMISS_KEY = "artzen-home-mobile-shop-prompt-dismissed";

export function HomeMobileShopRedirect() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-[220] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-[var(--border-mid)] bg-[var(--bg)]/95 p-3 shadow-[0_10px_24px_rgba(30,40,50,0.18)] backdrop-blur-sm md:hidden">
      <p className="pr-8 font-[var(--font-dm-sans)] text-[12px] leading-relaxed text-[var(--text-primary)]">
        Looking for products? Open the full shop instantly.
      </p>
      <button
        type="button"
        aria-label="Dismiss shop suggestion"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
        className="absolute right-2 top-2 rounded-full px-2 py-1 text-[var(--text-muted)] transition hover:bg-black/[0.06]"
      >
        ×
      </button>
      <Link
        href="/shop"
        className="mt-2 inline-flex items-center rounded-full bg-[var(--slate)] px-4 py-2 font-[var(--font-dm-sans)] text-[12px] font-medium text-[var(--off-white)] no-underline"
      >
        Open shop
      </Link>
    </div>
  );
}
