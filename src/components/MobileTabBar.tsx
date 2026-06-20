"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartCount } from "@/components/CartCount";
import { CartNavIcon } from "@/components/CartNavLink";
import { useCart } from "@/context/CartContext";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]";

function ShopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
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
  const favActive = pathname.startsWith("/favorites");
  const cartActive = pathname.startsWith("/cart");
  const profileActive = pathname.startsWith("/profile");
  const cartHasItems = mounted && totalItems > 0;

  const tabClass = (active: boolean) =>
    `mobile-tab-bar__item relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 min-h-[44px] rounded-lg transition-opacity duration-150 [-webkit-tap-highlight-color:transparent] ${focusRing} ${
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
        <span className="inline-flex h-[22px] max-w-[72px] items-center justify-center">
          <Image
            src="/Artzens-logo.png"
            alt=""
            width={72}
            height={22}
            className="h-[22px] w-auto max-w-[72px] object-contain object-center"
          />
        </span>
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
        className={`${tabClass(cartActive)} no-underline${cartHasItems ? " cart-nav-link--has-items" : ""}`}
        aria-current={cartActive ? "page" : undefined}
        aria-label={
          cartHasItems
            ? `Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`
            : "Cart"
        }
      >
        <span className="relative inline-flex">
          <CartNavIcon className="h-[22px] w-[22px] shrink-0" width={22} height={22} />
          <span className="absolute -right-2 -top-1.5">
            <CartCount />
          </span>
        </span>
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Cart</span>
      </Link>

      <Link
        href="/favorites"
        className={`${tabClass(favActive)} no-underline`}
        aria-current={favActive ? "page" : undefined}
      >
        <HeartIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="max-w-full truncate font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">
          Saved
        </span>
      </Link>

      <Link
        href="/profile"
        className={`${tabClass(profileActive)} no-underline`}
        aria-current={profileActive ? "page" : undefined}
      >
        <UserIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="max-w-full truncate font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">
          Profile
        </span>
      </Link>
    </nav>
  );
}
