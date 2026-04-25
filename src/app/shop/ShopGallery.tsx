"use client";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useId,
  useRef,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ShopListProduct } from "@/lib/shop-list-product";
import type { ShopFacetSummary } from "@/lib/shop-types";
import { ProductCard } from "@/components/ProductCard";
import { SHOP_FACET_SALE, parsePriceBound, filterAndSortShopProducts } from "@/lib/shop-filters";
import { ShopFilterPanel } from "./ShopFilterPanel";
import {
  trackShopFilterApply,
  trackShopFilterReset,
  trackShopSortChange,
  trackViewItemList,
} from "@/lib/analytics";

export type { ShopCategoryFilter } from "@/lib/shop-types";

const PAGE_SIZE = 24;
const SEARCH_URL_DEBOUNCE_MS = 320;
const ANALYTICS_DEBOUNCE_MS = 450;

type UrlStatePatch = Partial<{
  q: string;
  min: string;
  max: string;
  facets: string[];
  sort: "popular" | "newest" | "price_asc" | "price_desc";
}>;

export function ShopGallery({
  shopProducts,
  facetSummary,
  initialSaleOnly = false,
  onSaleOnlyChange,
}: {
  shopProducts: ShopListProduct[];
  facetSummary: ShopFacetSummary;
  initialSaleOnly?: boolean;
  onSaleOnlyChange?: (sale: boolean) => void;
}) {
  const router = useRouter();
  const pathname = "/shop";
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerOpenButtonRef = useRef<HTMLButtonElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const updateUrlRef = useRef<(next: UrlStatePatch) => void>(() => {});
  const skipFirstQueryUrlSync = useRef(true);

  const [selectedFacetIds, setSelectedFacetIds] = useState<string[]>(() =>
    initialSaleOnly ? [SHOP_FACET_SALE] : []
  );
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [query, setQuery] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "popular" | "newest" | "price_asc" | "price_desc"
  >("popular");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { catalogMaxPrice, typeRows } = facetSummary;

  useEffect(() => {
    setSelectedFacetIds((prev) => {
      const has = prev.includes(SHOP_FACET_SALE);
      if (initialSaleOnly && !has) return [...prev, SHOP_FACET_SALE];
      if (!initialSaleOnly && has) return prev.filter((id) => id !== SHOP_FACET_SALE);
      return prev;
    });
  }, [initialSaleOnly]);

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setPriceFrom(params.get("min") ?? "");
      setPriceTo(params.get("max") ?? "");
      const sortParam = params.get("sort");
      if (
        sortParam === "popular" ||
        sortParam === "newest" ||
        sortParam === "price_asc" ||
        sortParam === "price_desc"
      ) {
        setSortBy(sortParam);
      } else {
        setSortBy("popular");
      }
      const facetsParam = params.get("facets");
      setSelectedFacetIds(
        facetsParam
          ? facetsParam
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
          : []
      );
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    onSaleOnlyChange?.(selectedFacetIds.includes(SHOP_FACET_SALE));
  }, [selectedFacetIds, onSaleOnlyChange]);

  const filterState = useMemo(
    () => ({
      query,
      priceFrom,
      priceTo,
      selectedFacetIds,
      sortBy,
    }),
    [query, priceFrom, priceTo, selectedFacetIds, sortBy]
  );

  const filtered = useMemo(
    () => filterAndSortShopProducts(shopProducts, filterState),
    [shopProducts, filterState]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterState]);

  const visibleProducts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  /** Auto-load next page when the user scrolls the sentinel into view. */
  useEffect(() => {
    if (filtered.length === 0 || visibleCount >= filtered.length) return;
    const el = loadMoreSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setVisibleCount((n) => Math.min(n + PAGE_SIZE, filtered.length));
      },
      { root: null, rootMargin: "0px 0px 360px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered, visibleCount]);

  const buildReplaceUrl = useCallback(
    (
      next: Partial<{
        q: string;
        min: string;
        max: string;
        facets: string[];
        sort: typeof sortBy;
      }>
    ) => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const nextQuery = next.q ?? query;
      const nextMin = next.min ?? priceFrom;
      const nextMax = next.max ?? priceTo;
      const nextFacets = next.facets ?? selectedFacetIds;
      const nextSort = next.sort ?? sortBy;
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      else params.delete("q");
      if (nextMin.trim()) params.set("min", nextMin.trim());
      else params.delete("min");
      if (nextMax.trim()) params.set("max", nextMax.trim());
      else params.delete("max");
      if (nextFacets.length > 0) params.set("facets", nextFacets.join(","));
      else params.delete("facets");
      if (nextSort !== "popular") params.set("sort", nextSort);
      else params.delete("sort");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, priceFrom, priceTo, query, router, selectedFacetIds, sortBy]
  );

  useEffect(() => {
    updateUrlRef.current = buildReplaceUrl;
  }, [buildReplaceUrl]);

  /** Debounce only search query in the URL to avoid router.replace on every keystroke. */
  useEffect(() => {
    if (skipFirstQueryUrlSync.current) {
      skipFirstQueryUrlSync.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      updateUrlRef.current({ q: query });
    }, SEARCH_URL_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  const updateUrlState = useCallback(
    (
      next: Partial<{
        q: string;
        min: string;
        max: string;
        facets: string[];
        sort: typeof sortBy;
      }>
    ) => {
      buildReplaceUrl(next);
    },
    [buildReplaceUrl]
  );

  const onToggleFacet = useCallback(
    (id: string, checked: boolean) => {
      setSelectedFacetIds((prev) => {
        const has = prev.includes(id);
        if (checked && !has) {
          const next = [...prev, id];
          updateUrlState({ facets: next });
          return next;
        }
        if (!checked && has) {
          const next = prev.filter((x) => x !== id);
          updateUrlState({ facets: next });
          return next;
        }
        return prev;
      });
    },
    [updateUrlState]
  );

  const activeFilterCount = useMemo(() => {
    let n = selectedFacetIds.length;
    if (parsePriceBound(priceFrom) != null) n += 1;
    if (parsePriceBound(priceTo) != null) n += 1;
    return n;
  }, [selectedFacetIds, priceFrom, priceTo]);

  const resetAll = useCallback(() => {
    setSelectedFacetIds([]);
    setPriceFrom("");
    setPriceTo("");
    setQuery("");
    onSaleOnlyChange?.(false);
    setFilterDrawerOpen(false);
    setSortBy("popular");
    updateUrlState({
      q: "",
      min: "",
      max: "",
      facets: [],
      sort: "popular",
    });
    trackShopFilterReset();
  }, [onSaleOnlyChange, updateUrlState]);

  useEffect(() => {
    if (!filterDrawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = drawerRef.current;
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(root?.querySelectorAll<HTMLElement>(selector) ?? []);
    focusables()[0]?.focus();
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFilterDrawerOpen(false);
      if (e.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onEsc);
      drawerOpenButtonRef.current?.focus();
    };
  }, [filterDrawerOpen]);

  const analyticsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (analyticsTimer.current) clearTimeout(analyticsTimer.current);
    analyticsTimer.current = setTimeout(() => {
      trackViewItemList(
        "shop_products",
        filtered.slice(0, 24).map((product) => ({
          item_id: product.id,
          item_name: product.name,
          price: product.price,
        }))
      );
      trackShopFilterApply(activeFilterCount, filtered.length);
    }, ANALYTICS_DEBOUNCE_MS);
    return () => {
      if (analyticsTimer.current) clearTimeout(analyticsTimer.current);
    };
  }, [activeFilterCount, filtered]);

  const filterPanelProps = {
    maxPrice: catalogMaxPrice,
    typeRows,
    selectedFacetIds,
    onToggleFacet,
    priceFrom,
    priceTo,
    onPriceFromChange: (next: string) => {
      setPriceFrom(next);
      updateUrlState({ min: next });
    },
    onPriceToChange: (next: string) => {
      setPriceTo(next);
      updateUrlState({ max: next });
    },
    className:
      "rounded-[var(--radius)] border border-black/[0.08] bg-white/85 p-4 shadow-sm sm:p-5",
  };

  const gutterX = "px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16";

  const canLoadMore = visibleCount < filtered.length;

  return (
    <>
      <div className="shop-filter-toolbar sticky z-40 w-full border-b border-[var(--border)] bg-cream-deep/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream-deep/85 lg:hidden">
        <div className={`mx-auto flex w-full min-w-0 flex-wrap items-center gap-2 py-2 ${gutterX}`}>
          <button
            ref={drawerOpenButtonRef}
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/[0.12] bg-white/90 px-4 py-2 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)] shadow-sm transition hover:border-[var(--gold)]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/35"
            aria-expanded={filterDrawerOpen}
            aria-controls="shop-filter-drawer"
          >
            Filters
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dark)] px-1.5 text-[11px] font-semibold text-[var(--cream)]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <p className="ml-auto font-[var(--font-dm-sans)] text-[12px] text-[var(--dark)]/75">
            {filtered.length} results
          </p>
          <Link
            href="#browse-collections"
            className="inline-flex shrink-0 items-center rounded-full border border-transparent bg-[var(--cream-deep)]/90 px-4 py-2 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)]/85 no-underline transition hover:border-[var(--border-mid)] hover:bg-[var(--cream)]"
          >
            Collections
          </Link>
          <div className="w-full min-w-0 basis-full sm:basis-auto sm:min-w-[200px] sm:flex-1">
            <label htmlFor="shop-query-mobile" className="sr-only">
              Search products
            </label>
            <input
              id="shop-query-mobile"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search products..."
              className="w-full rounded-full border border-black/[0.12] bg-white px-4 py-2 font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)]"
            />
          </div>
        </div>
      </div>

      <div className={`mx-auto w-full max-w-none pb-20 sm:pb-24 ${gutterX}`}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 lg:pt-10">
          <aside className="hidden shrink-0 lg:block lg:w-[272px] lg:pt-10">
            <div className="lg:sticky lg:top-[calc(var(--nav-h-desktop)+1rem)] lg:self-start lg:pb-8">
              <div className="lg:max-h-[calc(100vh-var(--nav-h-desktop)-2rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                <ShopFilterPanel {...filterPanelProps} facetControlPrefix="sb-" />
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 pt-8 lg:pt-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <label
                htmlFor="shop-query-desktop"
                className="font-[var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--dark)]/70"
              >
                Search
              </label>
              <input
                id="shop-query-desktop"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Search products..."
                className="min-w-[220px] rounded-full border border-black/[0.12] bg-white px-4 py-1.5 font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)]"
              />
              <label
                htmlFor="shop-sort-select"
                className="font-[var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--dark)]/70"
              >
                Sort
              </label>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => {
                  const next = e.target.value as typeof sortBy;
                  setSortBy(next);
                  updateUrlState({ sort: next });
                  trackShopSortChange(next, filtered.length);
                }}
                className="rounded-full border border-black/[0.12] bg-white px-3 py-1.5 font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)]"
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
              {query.trim() ? (
                <p className="font-[var(--font-dm-sans)] text-[12px] text-[var(--dark)]/70">
                  Results for &quot;{query.trim()}&quot;
                </p>
              ) : null}
              <p className="font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)]/75">
                {filtered.length} products
              </p>
            </div>
            {selectedFacetIds.length > 0 || priceFrom || priceTo ? (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {selectedFacetIds.map((id) => {
                  const row = typeRows.find((r) => r.id === id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onToggleFacet(id, false)}
                      className="rounded-full border border-[var(--border-mid)] bg-white px-3 py-1 font-[var(--font-dm-sans)] text-[12px] text-[var(--dark)]"
                    >
                      {row?.label ?? id} x
                    </button>
                  );
                })}
                {priceFrom ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPriceFrom("");
                      updateUrlState({ min: "" });
                    }}
                    className="rounded-full border border-[var(--border-mid)] bg-white px-3 py-1 font-[var(--font-dm-sans)] text-[12px] text-[var(--dark)]"
                  >
                    From Rs.{priceFrom} x
                  </button>
                ) : null}
                {priceTo ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPriceTo("");
                      updateUrlState({ max: "" });
                    }}
                    className="rounded-full border border-[var(--border-mid)] bg-white px-3 py-1 font-[var(--font-dm-sans)] text-[12px] text-[var(--dark)]"
                  >
                    To Rs.{priceTo} x
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-full border border-[var(--dark)]/20 px-3 py-1 font-[var(--font-dm-sans)] text-[12px] text-[var(--dark)]/80"
                >
                  Clear all
                </button>
              </div>
            ) : null}
            {filtered.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-black/[0.08] bg-white/60 px-8 py-16 text-center">
                <p className="font-[var(--font-cormorant)] text-2xl text-[var(--dark)]">No matches</p>
                <p className="mx-auto mt-2 max-w-sm font-[var(--font-dm-sans)] text-[14px] text-[var(--muted)]">
                  Try another category or clear filters — browse the full store anytime.
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-8 rounded-full border border-[var(--dark)]/20 bg-transparent px-6 py-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)] transition hover:bg-[var(--dark)] hover:text-white"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid-showcase grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                  {visibleProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} itemIndex={index} />
                  ))}
                </div>
                {canLoadMore ? (
                  <div
                    ref={loadMoreSentinelRef}
                    className="mt-4 h-8 w-full shrink-0 scroll-mt-4"
                    aria-hidden
                  />
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {filterDrawerOpen ? (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-50 lg:hidden"
          id="shop-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close filters"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-black/[0.08] bg-[var(--cream-deep)] shadow-xl">
            <div className="flex items-center justify-between border-b border-black/[0.08] px-4 py-3">
              <h2
                id={drawerTitleId}
                className="font-[var(--font-cormorant)] text-xl font-semibold text-[var(--dark)]"
              >
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="rounded-full p-2 font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)]/70 transition hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/35"
              >
                Done
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <ShopFilterPanel {...filterPanelProps} facetControlPrefix="dr-" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
