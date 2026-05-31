"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getWhatsAppPhoneDigits } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]";

const ORDER_HREF = `https://wa.me/${getWhatsAppPhoneDigits()}?text=${encodeURIComponent("Hi Artzens — I'd like to place an order.")}`;

function ShopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
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

  const homeActive = pathname === "/";
  const shopActive =
    pathname.startsWith("/shop") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/products");
  const favActive = pathname.startsWith("/favorites");
  const profileActive = pathname.startsWith("/profile");

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

      <a
        href={ORDER_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className={`${tabClass(false)} no-underline`}
        aria-label="Call to order on WhatsApp"
      >
        <PhoneIcon className="h-[22px] w-[22px] shrink-0" />
        <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-wide">Order</span>
      </a>

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
