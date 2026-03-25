"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useMobileNav } from "@/context/MobileNavContext";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { mobileMenuOpen, toggleMobileMenu } = useMobileNav();
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const homeActive = pathname === "/";
  const shopActive =
    pathname.startsWith("/shop") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/products");
  const cartActive =
    pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  const favActive = pathname.startsWith("/favorites");

  const tabClass = (active: boolean) =>
    `mobile-tab-bar__item relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 min-h-[44px] min-w-0 rounded-lg transition-opacity duration-150 [-webkit-tap-highlight-color:transparent] ${focusRing} ${
      active ? "mobile-tab-bar__item--active" : "opacity-90 active:opacity-60"
    }`;

  return (
    <nav
      className="mobile-tab-bar md:hidden"
      role="navigation"
      aria-label="App navigation"
    >
      <Link
        href="/"
        className={`${tabClass(homeActive)} no-underline`}
        aria-current={homeActive ? "page" : undefined}
      >
        <HomeIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Home</span>
      </Link>

      <Link
        href="/shop"
        className={`${tabClass(shopActive)} no-underline`}
        aria-current={shopActive ? "page" : undefined}
      >
        <ShopIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Shop</span>
      </Link>

      <Link
        href="/cart"
        className={`${tabClass(cartActive)} no-underline`}
        aria-current={cartActive ? "page" : undefined}
      >
        <span className="relative inline-flex">
          <CartIcon className="h-[22px] w-[22px] shrink-0" />
          {mounted && totalItems > 0 && (
            <span className="mobile-tab-bar__badge">{totalItems > 99 ? "99+" : totalItems}</span>
          )}
        </span>
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Cart</span>
      </Link>

      <Link
        href="/favorites"
        className={`${tabClass(favActive)} no-underline`}
        aria-current={favActive ? "page" : undefined}
      >
        <HeartIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Saved</span>
      </Link>

      <button
        type="button"
        data-mobile-menu-trigger
        onClick={toggleMobileMenu}
        className={`${tabClass(mobileMenuOpen)} border-0 bg-transparent p-0`}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-drawer"
      >
        <MenuIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Menu</span>
      </button>
    </nav>
  );
}
