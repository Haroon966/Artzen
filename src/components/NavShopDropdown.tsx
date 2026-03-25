"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const shopLinks = [
  { href: "/collections/islamic-calligraphy", label: "Islamic Calligraphy" },
  { href: "/collections/wall-decoration", label: "Wall Decoration" },
  { href: "/collections/vintage-logo", label: "Vintage Logo" },
  { href: "/collections/premium-islamic-art-collection", label: "Premium Islamic Art" },
  { href: "/collections/customize-keychain", label: "Customize Keychain" },
  { href: "/shop", label: "View All Products" },
];

export function NavShopDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[13.5px] font-normal tracking-wide text-muted transition-colors hover:text-[var(--dark)] md:inline-flex"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Shop
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[200] mt-1 min-w-[220px] rounded-xl border border-black/10 bg-white py-2 shadow-lg">
          {shopLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block px-4 py-2.5 text-[13.5px] text-muted no-underline transition-colors hover:bg-black/5 hover:text-[var(--dark)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
