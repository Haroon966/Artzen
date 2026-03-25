"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  Suspense,
} from "react";
import { CartCount } from "@/components/CartCount";
import { FavoriteCount } from "@/components/FavoriteCount";
import { NavCategoriesDropdown } from "@/components/NavCategoriesDropdown";
import { getNavCategoryLinks } from "@/lib/data";
import { useMobileNav } from "@/context/MobileNavContext";

export type NavLinkItem = { href: string; label: string };

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]";

const WA_HREF = "https://wa.me/923315856777";

/** Fixed-position elements often have null offsetParent; use computed style instead. */
function isElementDisplayed(el: HTMLElement) {
  if (!el.isConnected) return false;
  const s = getComputedStyle(el);
  return s.display !== "none" && s.visibility !== "hidden";
}

function focusMobileNavTrigger(menuButton: HTMLElement | null) {
  if (menuButton instanceof HTMLButtonElement && isElementDisplayed(menuButton)) {
    menuButton.focus();
    return;
  }
  const tabTrigger = document.querySelector<HTMLButtonElement>(
    "[data-mobile-menu-trigger]"
  );
  if (tabTrigger && isElementDisplayed(tabTrigger)) tabTrigger.focus();
}

/** Official WhatsApp mark (green) */
function WhatsAppNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#25D366"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 5.4H19l-4.3 3.2 1.6 5.4L12 13l-4.3 3 1.6-5.4L5 7.4h5.2z" />
    </svg>
  );
}

function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  options?: { restoreRef?: React.RefObject<HTMLElement | null> }
) {
  const restoreRef = options?.restoreRef;

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const root = containerRef.current;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          !el.closest("[aria-hidden='true']") &&
          el.getAttribute("tabindex") !== "-1"
      );

    const focusables = getFocusable();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first) first.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = getFocusable();
      if (list.length === 0) return;
      const f = list[0];
      const l = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === f) {
          e.preventDefault();
          l.focus();
        }
      } else {
        if (document.activeElement === l) {
          e.preventDefault();
          f.focus();
        }
      }
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      focusMobileNavTrigger(restoreRef?.current ?? null);
    };
  }, [active, containerRef, restoreRef]);
}

function HeaderLoading() {
  return (
    <header
      data-site-header
      className="site-header sticky top-0 z-[100] max-md:fixed max-md:left-0 max-md:right-0 max-md:top-[var(--site-mobile-announcement-h,40px)] max-md:z-[101] md:top-0"
    >
      <nav
        data-main-nav
        className="site-main-nav border-b border-[var(--nav-border)] bg-[var(--cream)] px-4 py-3 md:px-8 lg:px-12"
        aria-label="Main"
      >
        <div className="flex flex-col gap-2.5 lg:hidden" aria-hidden>
          <div className="flex items-center justify-between max-md:justify-start">
            <div className="h-7 w-24 rounded bg-black/[0.06] max-md:mr-auto" />
            <div className="flex gap-1.5 max-md:hidden">
              <div className="h-9 w-9 rounded-full bg-black/[0.06]" />
              <div className="h-9 w-9 rounded-full bg-[#25D366]/25" />
              <div className="h-9 w-20 rounded-full bg-[var(--dark)]/85" />
              <div className="h-9 w-9 rounded-full bg-black/[0.06]" />
            </div>
          </div>
          <div className="h-9 w-full rounded-full bg-black/[0.06]" />
        </div>
        <div
          className="relative hidden min-h-[var(--nav-h-desktop)] w-full items-center justify-between lg:flex"
          aria-hidden
        >
          <div className="h-4 w-48 rounded bg-black/[0.06]" />
          <div className="h-7 w-28 rounded bg-black/[0.06]" />
          <div className="flex max-w-[300px] flex-1 items-center justify-end gap-2">
            <div className="h-9 flex-1 rounded-full bg-black/[0.06]" />
            <div className="h-9 w-9 rounded-full bg-black/[0.06]" />
            <div className="h-9 w-9 rounded-full bg-[#25D366]/25" />
            <div className="h-9 w-20 rounded-full bg-[var(--dark)]/85" />
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeaderInner({ categoryLinks }: { categoryLinks: NavLinkItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mobileMenuOpen: mobileOpen, setMobileMenuOpen: setMobileOpen } =
    useMobileNav();
  const [scrolled, setScrolled] = useState(false);
  const [overlayTop, setOverlayTop] = useState(104);
  const [searchQuery, setSearchQuery] = useState("");

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const mobileDrawerId = "mobile-nav-drawer";
  const searchInputId = useId();

  const saleActive =
    pathname === "/shop" &&
    (searchParams.get("sale") === "1" || searchParams.get("sale") === "true");
  const shopActive =
    !saleActive &&
    (pathname === "/shop" ||
      pathname.startsWith("/collections/") ||
      pathname.startsWith("/products"));
  const homeActive = pathname === "/";
  const aboutActive = pathname === "/about";
  const blogActive = pathname.startsWith("/blog");

  const updateOverlayTop = useCallback(() => {
    const nav = document.querySelector("[data-main-nav]");
    if (nav instanceof HTMLElement) {
      setOverlayTop(Math.round(nav.getBoundingClientRect().bottom));
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (mobileOpen) updateOverlayTop();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen, updateOverlayTop]);

  useEffect(() => {
    if (!mobileOpen) return;
    updateOverlayTop();
    const ro = new ResizeObserver(updateOverlayTop);
    const nav = document.querySelector("[data-main-nav]");
    const ann = document.querySelector("[data-announcement-bar]");
    if (nav) ro.observe(nav);
    if (ann) ro.observe(ann);
    window.addEventListener("resize", updateOverlayTop);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateOverlayTop);
    };
  }, [mobileOpen, updateOverlayTop]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        focusMobileNavTrigger(menuButtonRef.current);
      }
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [mobileOpen]);

  useFocusTrap(mobileOpen, mobilePanelRef, {
    restoreRef: menuButtonRef,
  });

  useEffect(() => {
    if (pathname !== "/shop") return;
    setSearchQuery(searchParams.get("q") ?? "");
  }, [pathname, searchParams]);

  const navText =
    `font-[var(--font-dm-sans)] text-[13px] tracking-wide no-underline transition-all duration-[250ms] ease ${focusRing}`;
  const navLinkInactive = `${navText} font-normal text-[var(--nav-link-muted)] hover:text-[var(--dark)]`;
  const navLinkActive = `${navText} font-medium text-[var(--golden-earth)] underline decoration-1 underline-offset-[6px] decoration-[var(--golden-earth)]`;
  const saleLinkIdle = `${navText} font-medium text-[var(--sale-accent)] hover:opacity-[0.88]`;
  const saleLinkActive = `${navText} font-medium text-[var(--sale-accent)] underline decoration-1 underline-offset-[6px] decoration-[var(--golden-earth)]`;

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  const searchInputClass =
    `w-full rounded-full border border-[var(--nav-border)] bg-[var(--nav-input-bg)] py-2.5 pl-9 pr-3 font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)] shadow-[0_1px_3px_rgba(37,21,8,0.06)] placeholder:text-[var(--nav-caption)] transition-all duration-[250ms] ease focus:border-[var(--golden-earth)]/35 focus:outline-none focus:ring-2 focus:ring-[var(--golden-earth)]/15 ${focusRing}`;

  const iconBtn =
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--dark)] transition-all duration-[250ms] ease hover:bg-[var(--nav-hover-tint)] ${focusRing}`;

  const waBtn =
    `${iconBtn} border border-[#25D366]/35 bg-[#25D366]/[0.06] hover:border-[#25D366]/55 hover:bg-[#25D366]/10`;

  function SearchField({ id }: { id: string }) {
    return (
      <div className="relative min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">
          Search products
        </label>
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nav-caption)]"
          aria-hidden
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>
        <input
          id={id}
          type="search"
          enterKeyHint="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className={searchInputClass}
          autoComplete="off"
        />
      </div>
    );
  }

  return (
    <>
      <header
        data-site-header
        className="site-header sticky top-0 z-[100] max-md:fixed max-md:left-0 max-md:right-0 max-md:top-[var(--site-mobile-announcement-h,40px)] max-md:z-[101] md:top-0"
      >
        <nav
          data-main-nav
          aria-label="Main"
          className={`site-main-nav border-b border-[var(--nav-border)] px-4 py-3 transition-all duration-[250ms] ease md:px-8 lg:px-12 ${
            scrolled
              ? "bg-[var(--cream)]/95 backdrop-blur-[8px] supports-[backdrop-filter]:bg-[var(--cream)]/90"
              : "bg-[var(--cream)]"
          }`}
        >
          {/* Mobile / tablet */}
          <div className="flex min-h-[44px] flex-col gap-3 lg:hidden">
            <div className="flex items-center justify-between gap-2 max-md:justify-start">
              <Link
                href="/"
                className={`font-[var(--font-cormorant)] flex items-center gap-2 text-[clamp(1.25rem,5vw,1.625rem)] font-semibold leading-none tracking-wide text-[var(--dark)] no-underline max-md:mr-auto ${focusRing}`}
              >
                <LogoIcon className="h-5 w-5 shrink-0 text-[var(--golden-earth)]" />
                Artzen
              </Link>
              <div className="flex shrink-0 items-center gap-2 max-md:hidden">
                <Link
                  href="/favorites"
                  className={`relative ${iconBtn}`}
                  aria-label="Favorites"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <FavoriteCount />
                </Link>
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={waBtn}
                  aria-label="WhatsApp support"
                >
                  <WhatsAppNavIcon className="h-5 w-5" />
                </a>
                <Link
                  href="/cart"
                  className={`flex items-center gap-1.5 rounded-full bg-[var(--dark)] px-3.5 py-2 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-on-dark)] no-underline transition-all duration-[250ms] ease hover:bg-[var(--coffee-hover)] sm:gap-2 sm:px-4 ${focusRing}`}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="hidden sm:inline">Cart</span>
                  <CartCount />
                </Link>
                <button
                  ref={menuButtonRef}
                  type="button"
                  className={iconBtn}
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                  aria-controls={mobileDrawerId}
                >
                  {mobileOpen ? (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <form onSubmit={runSearch} className="w-full min-w-0">
              <SearchField id={`${searchInputId}-mob`} />
            </form>
          </div>

          {/* Desktop */}
          <div className="relative hidden w-full min-h-[var(--nav-h-desktop)] items-center justify-between gap-6 lg:flex">
            <ul className="list-none items-center gap-6 lg:flex" aria-label="Primary">
              <li>
                <Link
                  href="/"
                  className={homeActive ? navLinkActive : navLinkInactive}
                  aria-current={homeActive ? "page" : undefined}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className={shopActive ? navLinkActive : navLinkInactive}
                  aria-current={shopActive ? "page" : undefined}
                >
                  Shop
                </Link>
              </li>
              <li>
                <NavCategoriesDropdown links={categoryLinks} />
              </li>
              <li>
                <Link
                  href="/shop?sale=1"
                  className={saleActive ? saleLinkActive : saleLinkIdle}
                  aria-current={saleActive ? "page" : undefined}
                >
                  Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={aboutActive ? navLinkActive : navLinkInactive}
                  aria-current={aboutActive ? "page" : undefined}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className={blogActive ? navLinkActive : navLinkInactive}
                  aria-current={blogActive ? "page" : undefined}
                >
                  Blog
                </Link>
              </li>
            </ul>
            <Link
              href="/"
              className={`font-[var(--font-cormorant)] absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-[clamp(1.375rem,2.5vw,1.625rem)] font-semibold tracking-wide text-[var(--dark)] no-underline ${focusRing}`}
            >
              <LogoIcon className="h-5 w-5 text-[var(--golden-earth)]" />
              Artzen
            </Link>
            <div className="flex min-w-0 max-w-[min(300px,30vw)] flex-1 items-center justify-end gap-2 xl:max-w-[340px]">
              <form onSubmit={runSearch} className="min-w-0 flex-1">
                <SearchField id={`${searchInputId}-desk`} />
              </form>
              <Link
                href="/favorites"
                className={`relative ${iconBtn}`}
                aria-label="Favorites"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <FavoriteCount />
              </Link>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={waBtn}
                aria-label="WhatsApp support"
              >
                <WhatsAppNavIcon className="h-5 w-5" />
              </a>
              <Link
                href="/cart"
                className={`flex shrink-0 items-center gap-2 rounded-full bg-[var(--dark)] px-4 py-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-on-dark)] no-underline transition-all duration-[250ms] ease hover:bg-[var(--coffee-hover)] ${focusRing}`}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Cart
                <CartCount />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div
          id={mobileDrawerId}
          ref={mobilePanelRef}
          className="fixed inset-x-0 bottom-0 z-[305] overflow-y-auto border-t border-[rgba(218,200,178,0.2)] bg-[var(--nav-drawer-bg)] lg:hidden max-md:pb-[env(safe-area-inset-bottom)]"
          style={{ top: overlayTop }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-6 md:px-6">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile">
              <Link
                href="/"
                className={`rounded-lg px-3 py-3 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`rounded-lg px-3 py-3 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                onClick={() => setMobileOpen(false)}
              >
                Shop
              </Link>
              <div className="py-3">
                <p className="mb-2 px-3 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--golden-earth-light)]">
                  Categories
                </p>
                <div className="flex flex-col gap-0.5">
                  {categoryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-lg px-3 py-2.5 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/shop?sale=1"
                className={`rounded-lg px-3 py-3 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[#ff8a8a] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                onClick={() => setMobileOpen(false)}
              >
                Sale
              </Link>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-lg px-3 py-3 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                onClick={() => setMobileOpen(false)}
              >
                <WhatsAppNavIcon className="h-6 w-6 shrink-0" />
                WhatsApp
              </a>
              <Link
                href="/about"
                className={`rounded-lg px-3 py-3 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>
              <Link
                href="/blog"
                className={`rounded-lg px-3 py-3 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:bg-[rgba(237,230,222,0.1)] ${focusRing}`}
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export function Header({ categoryLinks: passedLinks }: { categoryLinks?: NavLinkItem[] }) {
  const categoryLinks = passedLinks ?? getNavCategoryLinks();
  return (
    <Suspense fallback={<HeaderLoading />}>
      <HeaderInner categoryLinks={categoryLinks} />
    </Suspense>
  );
}
