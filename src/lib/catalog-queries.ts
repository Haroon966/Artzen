import type { Collection, Product, HeroStripBadge, HeroStripItem } from "./data";
import {
  HOMEPAGE_COLLECTION_SLUGS,
  getCollectionDisplayName,
} from "./catalog-constants";

export function getCollectionFrom(
  collections: Collection[],
  slug: string
): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function getProductBySlugFrom(
  products: Product[],
  slug: string
): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductByIdFrom(
  products: Product[],
  id: string
): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCollectionFrom(
  products: Product[],
  collections: Collection[],
  collectionSlug: string
): Product[] {
  const collection = collections.find((c) => c.slug === collectionSlug);
  if (!collection) return [];
  return collection.productIds
    .map((id) => getProductByIdFrom(products, id))
    .filter((p): p is Product => p != null);
}

function getRepresentativeProductsFrom(products: Product[]): Product[] {
  const order = [
    "wall-decoration",
    "islamic-calligraphy",
    "customize-keychain",
    "premium-islamic-art-collection",
    "vintage-logo",
  ];
  const reps: Product[] = [];
  for (const slug of order) {
    const p = products.find((x) => x.collectionSlug === slug);
    if (p) reps.push(p);
  }
  return reps;
}

export function getFeaturedProductsFrom(products: Product[]): Product[] {
  const reps = getRepresentativeProductsFrom(products);
  return reps.slice(0, 3);
}

export function getHeroStripProductsFrom(products: Product[]): HeroStripItem[] {
  const reps = getRepresentativeProductsFrom(products);
  if (reps.length === 0) return [];
  const idxOrder = [0, 1, 2, 3, 0, 1, 2];
  const badges: HeroStripBadge[] = ["SALE", null, null, "NEW", null, "SALE", null];
  return idxOrder.map((i, idx) => ({
    product: reps[i % reps.length]!,
    badge: badges[idx] ?? null,
  }));
}

export function getHomepageCollectionsFrom(
  collections: Collection[]
): Collection[] {
  return HOMEPAGE_COLLECTION_SLUGS.map((slug) =>
    getCollectionFrom(collections, slug)
  ).filter((c): c is Collection => c != null);
}

export function getCollectionCoverImageFrom(
  products: Product[],
  collection: Collection
): string | undefined {
  const id = collection.productIds[0];
  if (!id) return undefined;
  return getProductByIdFrom(products, id)?.image;
}

export function getNavCategoryLinksFrom(collections: Collection[]): {
  href: string;
  label: string;
}[] {
  return HOMEPAGE_COLLECTION_SLUGS.map((slug) => {
    const c = getCollectionFrom(collections, slug);
    return {
      href: `/collections/${slug}`,
      label: getCollectionDisplayName(slug, c?.name ?? slug),
    };
  });
}

export function shopCategoryFiltersFrom(collections: Collection[]): {
  slug: string | null;
  label: string;
}[] {
  return [
    { slug: null, label: "All products" },
    ...getHomepageCollectionsFrom(collections).map((c) => ({
      slug: c.slug,
      label: getCollectionDisplayName(c.slug, c.name),
    })),
  ];
}
