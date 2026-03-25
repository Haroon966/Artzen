"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

type CatalogSearchCtx = { topSearch: string; setTopSearch: (v: string) => void };

export const AdminCatalogSearchContext = createContext<CatalogSearchCtx | null>(null);

export function useAdminCatalogSearch() {
  return useContext(AdminCatalogSearchContext);
}

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products", label: "Products", icon: "inventory" },
  { href: "/admin/orders", label: "Orders", icon: "cart" },
  { href: "/admin/collections", label: "Collections", icon: "layers" },
] as const;

function Icon({ name }: { name: (typeof nav)[number]["icon"] }) {
  const common = "h-5 w-5 shrink-0";
  switch (name) {
    case "dashboard":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 21h6v-5H4v5zm10-9h6V4h-6v8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "inventory":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
      );
    case "cart":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case "layers":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth, setUser);
  }, []);

  const onLogout = useCallback(async () => {
    const auth = getClientAuth();
    if (auth) await signOut(auth);
    router.push("/admin/login");
    router.refresh();
  }, [router]);

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-[var(--bg)]">{children}</div>;
  }

  const showCatalogSearch = pathname === "/admin/products";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[var(--slate)]/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--border-mid)] bg-[var(--bg-card)] pt-6 pb-6 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 pb-8">
          <p className="font-[var(--font-cormorant)] text-lg font-semibold italic text-[var(--sage-deep)]">
            Admin Panel
          </p>
          <p className="font-[var(--font-cormorant)] text-xs font-light tracking-wide text-[var(--text-muted)]">
            Artzen catalog
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Admin">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg py-3 pl-3 font-[var(--font-dm-sans)] text-[15px] font-normal tracking-wide transition-all duration-300 ${
                  active
                    ? "border-r-2 border-[var(--sage)] bg-gradient-to-r from-[var(--sage-muted)] to-transparent text-[var(--sage-deep)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--sage-deep)]"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg py-3 pl-3 font-[var(--font-dm-sans)] text-[15px] text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--sage-deep)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Storefront
          </Link>
        </nav>
        <div className="mt-auto px-2">
          <button
            type="button"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-3 rounded-lg py-3 pl-3 text-left font-[var(--font-dm-sans)] text-[15px] text-[var(--text-secondary)] transition hover:bg-red-50 hover:text-[var(--red)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-[var(--border-mid)] bg-[var(--bg-card)]/90 px-4 py-3 backdrop-blur-md lg:left-64 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-primary)] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="truncate font-[var(--font-cormorant)] text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-xl">
            Artzen Admin
          </h1>
          {showCatalogSearch && (
            <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 md:flex md:max-w-md">
              <svg className="h-4 w-4 shrink-0 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog (syncs below)…"
                className="min-w-0 flex-1 border-0 bg-transparent font-[var(--font-dm-sans)] text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                aria-label="Search products"
              />
            </div>
          )}
          </div>
          <div className="flex max-w-[45%] shrink-0 items-center gap-2 sm:max-w-none">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--sage-muted)] text-xs font-medium text-[var(--sage-deep)]"
              title={user?.email ?? undefined}
              aria-hidden
            >
              {(user?.email?.[0] ?? "A").toUpperCase()}
            </span>
            {user?.email && (
              <span className="hidden truncate font-[var(--font-dm-sans)] text-xs text-[var(--text-muted)] lg:inline lg:max-w-[160px]">
                {user.email}
              </span>
            )}
          </div>
        </div>
        {showCatalogSearch && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 md:hidden">
            <svg className="h-4 w-4 shrink-0 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="min-w-0 flex-1 border-0 bg-transparent font-[var(--font-dm-sans)] text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              aria-label="Search products"
            />
          </div>
        )}
      </header>

      <main
        className="min-h-screen pl-0 pt-28 md:pt-24 lg:pl-64"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30L15 30z' fill='%237DAA8A' fill-opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      >
        <div className="px-4 pb-12 pt-6 sm:px-8 sm:pt-8">
          {showCatalogSearch ? (
            <CatalogSearchBridge value={search} onChange={setSearch}>
              {children}
            </CatalogSearchBridge>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

/** Passes top-bar search into products page without prop drilling from layout. */
function CatalogSearchBridge({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <AdminCatalogSearchContext.Provider value={{ topSearch: value, setTopSearch: onChange }}>
      {children}
    </AdminCatalogSearchContext.Provider>
  );
}
