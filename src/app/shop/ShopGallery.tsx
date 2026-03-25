"use client";

import { useMemo, useState, useId, useEffect } from "react";
import type { Product } from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";
import { ProductCard } from "@/components/ProductCard";

export type ShopCategoryFilter = { slug: string | null; label: string };

export function ShopGallery({
  products,
  categoryFilters,
  initialSaleOnly = false,
  initialSearchQuery = "",
  onSaleOnlyChange,
}: {
  products: Product[];
  categoryFilters: ShopCategoryFilter[];
  initialSaleOnly?: boolean;
  initialSearchQuery?: string;
  onSaleOnlyChange?: (sale: boolean) => void;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState(initialSearchQuery);
  const [saleOnly, setSaleOnly] = useState(initialSaleOnly);
  const searchId = useId();

  useEffect(() => {
    setSaleOnly(initialSaleOnly);
    onSaleOnlyChange?.(initialSaleOnly);
  }, [initialSaleOnly, onSaleOnlyChange]);

  useEffect(() => {
    setQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const filtered = useMemo(() => {
    let list = products;
    if (saleOnly) {
      list = list.filter(
        (p) => p.originalPrice != null && p.originalPrice > p.price
      );
    }
    if (category) list = list.filter((p) => p.collectionSlug === category);
    const s = query.trim().toLowerCase();
    if (s) {
      list = list.filter((p) => {
        const raw = p.name.toLowerCase();
        const shown = productDisplayName(p).toLowerCase();
        return raw.includes(s) || shown.includes(s);
      });
    }
    return list;
  }, [products, category, query, saleOnly]);

  return (
    <>
      <div className="shop-filter-toolbar sticky top-[var(--nav-h-mobile)] z-40 -mx-4 border-b border-black/[0.06] bg-cream-deep/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-[var(--nav-h-desktop)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-8">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <label htmlFor={searchId} className="sr-only">
              Search products
            </label>
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              aria-hidden
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              id={searchId}
              type="search"
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-black/[0.1] bg-white/80 py-3 pl-11 pr-4 font-[var(--font-dm-sans)] text-[14px] text-[var(--dark)] shadow-sm placeholder:text-[var(--muted)] focus:border-[var(--gold)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/20"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              setSaleOnly((v) => {
                const n = !v;
                onSaleOnlyChange?.(n);
                return n;
              })
            }
            className={`shrink-0 rounded-full border px-4 py-2 font-[var(--font-dm-sans)] text-[12px] font-medium tracking-wide transition lg:order-none ${
              saleOnly
                ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--dark)] shadow-sm"
                : "border-black/[0.1] bg-white/70 text-[var(--dark)]/80 hover:border-[var(--gold)]/40 hover:bg-white"
            }`}
          >
            Sale 🔥
          </button>
          <div
            className="flex w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:w-auto lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Filter by category"
          >
            {categoryFilters.map((cat) => {
              const active = category === cat.slug;
              return (
                <button
                  key={cat.slug ?? "all"}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(cat.slug)}
                  className={`shrink-0 rounded-full border px-4 py-2 font-[var(--font-dm-sans)] text-[12px] font-medium tracking-wide transition ${
                    active
                      ? "border-[var(--dark)] bg-[var(--dark)] text-white shadow-md"
                      : "border-black/[0.1] bg-white/70 text-[var(--dark)]/80 hover:border-[var(--gold)]/40 hover:bg-white"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-7xl font-[var(--font-dm-sans)] text-[12px] text-[var(--muted)]">
          Showing{" "}
          <span className="font-semibold text-[var(--dark)]">{filtered.length}</span>
          {filtered.length !== products.length && (
            <>
              {" "}
              of <span className="tabular-nums">{products.length}</span>
            </>
          )}{" "}
          {filtered.length === 1 ? "product" : "products"}
          {saleOnly ? " on sale" : ""}
          {query ? ` matching “${query.trim()}”` : ""}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12">
        {filtered.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-black/[0.08] bg-white/60 px-8 py-16 text-center">
            <p className="font-[var(--font-cormorant)] text-2xl text-[var(--dark)]">No matches</p>
            <p className="mx-auto mt-2 max-w-sm font-[var(--font-dm-sans)] text-[14px] text-[var(--muted)]">
              Try another category or clear filters — browse the full store anytime.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setQuery("");
                setSaleOnly(false);
                onSaleOnlyChange?.(false);
              }}
              className="mt-8 rounded-full border border-[var(--dark)]/20 bg-transparent px-6 py-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)] transition hover:bg-[var(--dark)] hover:text-white"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="products-grid-showcase grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
