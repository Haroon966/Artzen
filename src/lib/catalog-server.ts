import type { Collection, Product, HeroStripItem } from "@/lib/data";
import { collections as staticCollections, products as staticProducts } from "@/lib/data";
import * as q from "@/lib/catalog-queries";
import { toShopListProduct, type ShopListProduct } from "@/lib/shop-list-product";
import { buildShopFacetSummary } from "@/lib/shop-filters";
import type { ShopCategoryFilter, ShopFacetSummary } from "@/lib/shop-types";

export const CATALOG_CACHE_TAG = "catalog";

export async function getCachedCatalog(): Promise<{
  products: Product[];
  collections: Collection[];
}> {
  return { products: staticProducts, collections: staticCollections };
}

export async function getServerProducts(): Promise<Product[]> {
  const { products } = await getCachedCatalog();
  return products;
}

export async function getServerCollections(): Promise<Collection[]> {
  const { collections } = await getCachedCatalog();
  return collections;
}

export async function getServerProductBySlug(slug: string): Promise<Product | undefined> {
  const { products } = await getCachedCatalog();
  return q.getProductBySlugFrom(products, slug);
}

export async function getServerCollection(slug: string): Promise<Collection | undefined> {
  const { collections } = await getCachedCatalog();
  return q.getCollectionFrom(collections, slug);
}

export async function getServerProductsByCollection(
  collectionSlug: string
): Promise<Product[]> {
  const { products, collections } = await getCachedCatalog();
  return q.getProductsByCollectionFrom(products, collections, collectionSlug);
}

export async function getServerFeaturedProducts(): Promise<Product[]> {
  const { products } = await getCachedCatalog();
  return q.getFeaturedProductsFrom(products);
}

export async function getServerHeroStripProducts(): Promise<HeroStripItem[]> {
  const { products } = await getCachedCatalog();
  return q.getHeroStripProductsFrom(products);
}

export async function getServerHomepageCollections(): Promise<Collection[]> {
  const { collections } = await getCachedCatalog();
  return q.getHomepageCollectionsFrom(collections);
}

export async function getServerNavCategoryLinks(): Promise<
  { href: string; label: string }[]
> {
  const { collections } = await getCachedCatalog();
  return q.getNavCategoryLinksFrom(collections);
}

export async function getServerShopCategoryFilters(): Promise<ShopCategoryFilter[]> {
  const { collections } = await getCachedCatalog();
  return q.shopCategoryFiltersFrom(collections);
}

/** Shop `/shop/` payload: lightweight products + precomputed facet counts (no extra client passes over the full catalog). */
export async function getServerShopPageData(): Promise<{
  shopProducts: ShopListProduct[];
  categoryLinks: { href: string; label: string }[];
  categoryFilters: ShopCategoryFilter[];
  facetSummary: ShopFacetSummary;
  count: number;
}> {
  const { products, collections } = await getCachedCatalog();
  const shopProducts = products.map(toShopListProduct);
  const categoryLinks = q.getNavCategoryLinksFrom(collections);
  const categoryFilters = q.shopCategoryFiltersFrom(collections);
  const facetSummary = buildShopFacetSummary(shopProducts, categoryFilters);
  return {
    shopProducts,
    categoryLinks,
    categoryFilters,
    facetSummary,
    count: products.length,
  };
}

export async function getServerCollectionCoverImage(
  collection: Collection
): Promise<string | undefined> {
  const { products } = await getCachedCatalog();
  return q.getCollectionCoverImageFrom(products, collection);
}
