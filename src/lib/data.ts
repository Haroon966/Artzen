export interface Collection {
  slug: string;
  name: string;
  description: string;
  image?: string;
  productIds: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  /** Optional explicit card thumbnail image (falls back to image/images[0]). */
  cardImage?: string;
  /** Optional explicit hover image for product card (falls back to images[1]). */
  hoverImage?: string;
  collectionSlug: string;
  material?: string;
  dimensions?: string;
  /** Full size / tier pricing line from the category rate-list PDF (when available). */
  pricingDetail?: string;
  /**
   * Selectable size / price tiers from the rate-list PDF (label + price + optional material).
   * When set, PDP uses these instead of generic Small/Medium/Large.
   */
  sizeOptions?: Array<{
    id: string;
    label: string;
    price: number;
    material?: string;
    /** Shopify Storefront variant GID for this size tier. */
    shopifyVariantId?: string;
  }>;
  /** Shopify Storefront product GID (gid://shopify/Product/…). */
  shopifyProductId?: string;
  /** Default Shopify variant GID when there are no size options (or first size). */
  shopifyVariantId?: string;
  /** Show golden “New” badge when not on sale (optional). */
  isNew?: boolean;
}

/** Products that show the New badge (when not on sale). Extend as needed. */
export const PRODUCT_SLUGS_NEW_BADGE = new Set<string>([
  "custom-logo",
  "kalma-premium",
]);

export type HeroStripBadge = "NEW" | "SALE" | null;

export interface HeroStripItem {
  product: Product;
  badge: HeroStripBadge;
}

export {
  HOMEPAGE_COLLECTION_SLUGS,
  collectionTaglines,
  collectionDisplayNames,
  getCollectionDisplayName,
} from "./catalog-constants";

import { collections as generatedCollections, products as generatedProducts } from "./data.generated";
import * as q from "./catalog-queries";

export const collections = generatedCollections;
export const products = generatedProducts;

export function getCollection(slug: string): Collection | undefined {
  return q.getCollectionFrom(collections, slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return q.getProductBySlugFrom(products, slug);
}

export function getProductById(id: string): Product | undefined {
  return q.getProductByIdFrom(products, id);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return q.getProductsByCollectionFrom(products, collections, collectionSlug);
}

export function getFeaturedProducts(): Product[] {
  return q.getFeaturedProductsFrom(products);
}

export function getHeroStripProducts(): HeroStripItem[] {
  return q.getHeroStripProductsFrom(products);
}

export function getHomepageCollections(): Collection[] {
  return q.getHomepageCollectionsFrom(collections);
}

export function getCollectionCoverImage(collection: Collection): string | undefined {
  return q.getCollectionCoverImageFrom(products, collection);
}

export function getNavCategoryLinks(): { href: string; label: string }[] {
  return q.getNavCategoryLinksFrom(collections);
}
