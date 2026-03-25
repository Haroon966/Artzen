"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useId } from "react";
import type { NavLinkItem } from "@/components/Header";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--golden-earth)]";

const triggerClass = `flex items-center gap-1 font-[var(--font-dm-sans)] text-[13px] font-normal tracking-wide text-[var(--nav-link-muted)] transition-all duration-[250ms] ease hover:text-[var(--dark)] ${focusRing}`;

export function NavCategoriesDropdown({ links }: { links: NavLinkItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const focusItem = (i: number) => {
    itemRefs.current[i]?.focus();
  };

  const currentIndex = () =>
    itemRefs.current.findIndex((el) => el === document.activeElement);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        id={`${menuId}-trigger`}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              requestAnimationFrame(() => focusItem(0));
            } else {
              focusItem(0);
            }
          }
        }}
      >
        Categories
        <svg
          className={`h-4 w-4 transition-transform duration-[250ms] ease ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute left-0 top-full z-[200] mt-2 min-w-[220px] rounded-xl border border-[var(--nav-border)] bg-[var(--nav-input-bg)] py-2 shadow-[0_2px_12px_rgba(37,21,8,0.08)]"
          onKeyDown={(e) => {
            const n = links.length;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const idx = currentIndex();
              focusItem(idx < 0 ? 0 : Math.min(idx + 1, n - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const idx = currentIndex();
              if (idx <= 0) {
                buttonRef.current?.focus();
                setOpen(false);
              } else focusItem(idx - 1);
            } else if (e.key === "Home") {
              e.preventDefault();
              focusItem(0);
            } else if (e.key === "End") {
              e.preventDefault();
              focusItem(n - 1);
            }
          }}
        >
          {links.map((link, i) => (
            <Link
              key={link.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="menuitem"
              href={link.href}
              className={`block px-4 py-2.5 font-[var(--font-dm-sans)] text-[13px] text-[var(--nav-link-muted)] no-underline transition-all duration-[250ms] ease hover:bg-[var(--nav-hover-tint)] hover:text-[var(--dark)] ${focusRing}`}
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
