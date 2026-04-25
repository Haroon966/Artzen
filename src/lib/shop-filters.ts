import type { Product } from "@/lib/data";
import { PRODUCT_SLUGS_NEW_BADGE } from "@/lib/data";
import type { ShopCategoryFilter, ShopFacetSummary, ShopTypeFacetRow } from "@/lib/shop-types";
import type { ShopListProduct } from "@/lib/shop-list-product";

/** Facet id for “On sale” in the shop Type checklist. */
export const SHOP_FACET_SALE = "__sale__";
/** Facet id for “New” in the shop Type checklist (matches ProductCard badge rules). */
export const SHOP_FACET_NEW = "__new__";

/** Minimal fields used by shop facets / filters (works for `Product` and `ShopListProduct`). */
export type ShopFilterableProduct = Pick<
  Product,
  "slug" | "price" | "originalPrice" | "isNew" | "collectionSlug"
> &
  Pick<Product, "name" | "description">;

export function productOnSale(p: ShopFilterableProduct): boolean {
  return p.originalPrice != null && p.originalPrice > p.price;
}

/** Same “New” badge eligibility as ProductCard: not on sale and (isNew or slug allowlist). */
export function productShowNew(p: ShopFilterableProduct): boolean {
  return (
    !productOnSale(p) &&
    (p.isNew === true || PRODUCT_SLUGS_NEW_BADGE.has(p.slug))
  );
}

export function maxCatalogPrice(products: readonly { price: number }[]): number {
  if (products.length === 0) return 0;
  return Math.max(...products.map((p) => p.price));
}

export function productMatchesFacetId(p: ShopFilterableProduct, facetId: string): boolean {
  if (facetId === SHOP_FACET_SALE) return productOnSale(p);
  if (facetId === SHOP_FACET_NEW) return productShowNew(p);
  return p.collectionSlug === facetId;
}

export function buildShopFacetSummary(
  products: ShopListProduct[],
  categoryFilters: ShopCategoryFilter[]
): ShopFacetSummary {
  const collectionEntries = categoryFilters.filter(
    (c): c is ShopCategoryFilter & { slug: string } =>
      c.slug != null && c.slug !== "__collections_hub__" && !c.href
  );
  const rows: ShopTypeFacetRow[] = collectionEntries.map((c) => ({
    id: c.slug,
    label: c.label,
    count: products.filter((p) => p.collectionSlug === c.slug).length,
  }));
  rows.push(
    {
      id: SHOP_FACET_SALE,
      label: "On sale",
      count: products.filter((p) => productOnSale(p)).length,
    },
    {
      id: SHOP_FACET_NEW,
      label: "New",
      count: products.filter((p) => productShowNew(p)).length,
    }
  );
  return { catalogMaxPrice: maxCatalogPrice(products), typeRows: rows };
}

export type ShopSortKey = "popular" | "newest" | "price_asc" | "price_desc";

export type ShopFilterState = {
  query: string;
  priceFrom: string;
  priceTo: string;
  selectedFacetIds: string[];
  sortBy: ShopSortKey;
};

export function filterAndSortShopProducts(
  products: ShopListProduct[],
  state: ShopFilterState
): ShopListProduct[] {
  let list = products;
  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter((p) => {
      const haystack = `${p.name} ${p.description} ${p.collectionSlug}`.toLowerCase();
      return haystack.includes(q);
    });
  }
  const fromN = parsePriceBound(state.priceFrom);
  const toN = parsePriceBound(state.priceTo);
  if (fromN != null) list = list.filter((p) => p.price >= fromN);
  if (toN != null) list = list.filter((p) => p.price <= toN);
  if (state.selectedFacetIds.length > 0) {
    list = list.filter((p) =>
      state.selectedFacetIds.every((id) => productMatchesFacetId(p, id))
    );
  }
  if (state.sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
  if (state.sortBy === "newest") {
    list = [...list].sort((a, b) => {
      const aNew = Number(productShowNew(a));
      const bNew = Number(productShowNew(b));
      return bNew - aNew;
    });
  }
  return list;
}

/** Parses a price input; strips non-digits. Empty or invalid → null. */
export function parsePriceBound(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}
