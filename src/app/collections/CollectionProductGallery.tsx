"use client";

import { useMemo, useState, useCallback, useId } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import {
  SHOP_FACET_NEW,
  SHOP_FACET_SALE,
  maxCatalogPrice,
  parsePriceBound,
  productMatchesFacetId,
  productOnSale,
  productShowNew,
} from "@/lib/shop-filters";
import { ShopFilterPanel, type ShopTypeFacetRow } from "@/app/shop/ShopFilterPanel";

export function CollectionProductGallery({
  products,
  collectionName,
}: {
  products: Product[];
  collectionName: string;
}) {
  const drawerTitleId = useId();
  const drawerRootId = useId();
  const [selectedFacetIds, setSelectedFacetIds] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const { catalogMaxPrice, typeRows } = useMemo(() => {
    const rows: ShopTypeFacetRow[] = [
      {
        id: SHOP_FACET_SALE,
        label: "On sale",
        count: products.filter((p) => productOnSale(p)).length,
      },
      {
        id: SHOP_FACET_NEW,
        label: "New",
        count: products.filter((p) => productShowNew(p)).length,
      },
    ];
    return { catalogMaxPrice: maxCatalogPrice(products), typeRows: rows };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    const fromN = parsePriceBound(priceFrom);
    const toN = parsePriceBound(priceTo);
    if (fromN != null) list = list.filter((p) => p.price >= fromN);
    if (toN != null) list = list.filter((p) => p.price <= toN);
    if (selectedFacetIds.length > 0) {
      list = list.filter((p) =>
        selectedFacetIds.some((id) => productMatchesFacetId(p, id))
      );
    }
    return list;
  }, [products, priceFrom, priceTo, selectedFacetIds]);

  const onToggleFacet = useCallback((id: string, checked: boolean) => {
    setSelectedFacetIds((prev) => {
      const has = prev.includes(id);
      if (checked && !has) return [...prev, id];
      if (!checked && has) return prev.filter((x) => x !== id);
      return prev;
    });
  }, []);

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
    setFilterDrawerOpen(false);
  }, []);

  const filterPanelProps = {
    maxPrice: catalogMaxPrice,
    typeRows,
    selectedFacetIds,
    onToggleFacet,
    priceFrom,
    priceTo,
    onPriceFromChange: setPriceFrom,
    onPriceToChange: setPriceTo,
    className:
      "rounded-[var(--radius)] border border-black/[0.08] bg-white/85 p-4 shadow-sm sm:p-5",
  };

  const gutterX = "px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16";

  return (
    <>
      <div className="shop-filter-toolbar sticky z-40 w-full border-b border-[var(--border)] bg-cream/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream/90 lg:hidden">
        <div className={`mx-auto flex w-full min-w-0 items-center gap-2 py-2 ${gutterX}`}>
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/[0.12] bg-white/90 px-4 py-2 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)] shadow-sm transition hover:border-[var(--gold)]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/35"
            aria-expanded={filterDrawerOpen}
            aria-controls={drawerRootId}
          >
            Filters
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dark)] px-1.5 text-[11px] font-semibold text-[var(--cream)]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center rounded-full border border-transparent bg-[var(--cream-deep)]/90 px-4 py-2 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)]/85 no-underline transition hover:border-[var(--border-mid)] hover:bg-[var(--cream)]"
          >
            Shop all
          </Link>
        </div>
      </div>

      <div className={`mx-auto w-full max-w-none pb-16 sm:pb-20 ${gutterX}`}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 lg:pt-6">
          <aside className="hidden shrink-0 lg:block lg:w-[272px]">
            <div className="lg:sticky lg:top-[calc(var(--nav-h-desktop)+1rem)] lg:self-start lg:pb-8">
              <div className="lg:max-h-[calc(100vh-var(--nav-h-desktop)-2rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                <ShopFilterPanel {...filterPanelProps} facetControlPrefix="col-sb-" />
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 pt-6 lg:pt-0">
            {filtered.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-black/[0.08] bg-white/60 px-8 py-16 text-center">
                <p className="font-[var(--font-cormorant)] text-2xl text-[var(--dark)]">No matches</p>
                <p className="mx-auto mt-2 max-w-sm font-[var(--font-dm-sans)] text-[14px] text-[var(--muted)]">
                  Try adjusting price or type filters in {collectionName}, or browse the full shop.
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
              <div className="products-grid-showcase grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 2xl:gap-7">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filterDrawerOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          id={drawerRootId}
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
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-black/[0.08] bg-[var(--cream)] shadow-xl">
            <div className="flex items-center justify-between border-b border-black/[0.08] px-4 py-3">
              <h2
                id={drawerTitleId}
                className="font-[var(--font-cormorant)] text-xl font-semibold text-[var(--dark)]"
              >
                Filters · {collectionName}
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
              <ShopFilterPanel {...filterPanelProps} facetControlPrefix="col-dr-" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
