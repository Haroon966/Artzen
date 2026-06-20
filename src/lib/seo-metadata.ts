import type { Metadata } from "next";
import {
  canonicalUrl,
  getOgShareImageMetadata,
  SITE_BRAND,
} from "@/lib/site";

export function defaultOpenGraphImages(alt?: string) {
  const img = getOgShareImageMetadata(alt);
  return [
    {
      url: img.url,
      width: img.width,
      height: img.height,
      alt: img.alt,
      type: img.type,
    },
  ];
}

/** Shared metadata for marketing / policy static pages. */
export function buildStaticPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
  /** Full OG/Twitter title (defaults to `${title} | ${SITE_BRAND}`). */
  ogTitle?: string;
  /** Bypass root title template (long custom titles). */
  titleAbsolute?: boolean;
  imageAlt?: string;
}): Metadata {
  const url = canonicalUrl(options.path);
  const images = defaultOpenGraphImages(
    options.imageAlt ?? `${SITE_BRAND} — ${options.title}`
  );
  const imageUrl = images[0]?.url;
  const ogTitle = options.ogTitle ?? `${options.title} | ${SITE_BRAND}`;
  const titleField = options.titleAbsolute
    ? { absolute: options.title }
    : options.title;

  return {
    title: titleField,
    description: options.description,
    alternates: { canonical: url },
    ...(options.robots ? { robots: options.robots } : {}),
    openGraph: {
      title: ogTitle,
      description: options.description,
      url,
      siteName: SITE_BRAND,
      type: "website",
      locale: "en_PK",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: options.description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

type ShopSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** True when URL state should not be indexed (facets, sort, search, price — not sale-only). */
export function shopUrlShouldNoindex(params: ShopSearchParams): boolean {
  const q = firstParam(params.q).trim();
  const min = firstParam(params.min).trim();
  const max = firstParam(params.max).trim();
  const sort = firstParam(params.sort).trim();
  const facets = firstParam(params.facets).trim();
  if (q || min || max) return true;
  if (sort && sort !== "popular") return true;
  if (facets) {
    const ids = facets.split(",").map((s) => s.trim()).filter(Boolean);
    const onlySale =
      ids.length === 1 && (ids[0] === "__sale__" || ids[0] === "sale");
    if (!onlySale) return true;
  }
  return false;
}

export function isShopSaleParams(params: ShopSearchParams): boolean {
  const sale = firstParam(params.sale);
  if (sale === "1" || sale === "true") return true;
  const facets = firstParam(params.facets);
  if (!facets) return false;
  return facets
    .split(",")
    .map((s) => s.trim())
    .some((id) => id === "__sale__" || id === "sale");
}

const shopDescBase = `Browse ${SITE_BRAND} — wall art, Islamic calligraphy, gifts, decor, and more. Cash on Delivery across Pakistan.`;
const shopSaleDesc = `Shop sale items at ${SITE_BRAND}. Discounted wall art, calligraphy, gifts, and decor. Cash on Delivery across Pakistan.`;

/** Shop metadata from optional query params (sale page, filter noindex rules). */
export function buildShopMetadata(
  params: ShopSearchParams = {},
  options?: { path?: string }
): Metadata {
  const path = options?.path ?? "/shop";
  const sale = isShopSaleParams(params);
  const noindex = shopUrlShouldNoindex(params);
  const title = sale ? "Shop sale items" : "Shop all products";
  const description = sale ? shopSaleDesc : shopDescBase;
  const canonical = sale ? canonicalUrl("/shop?sale=1") : canonicalUrl("/shop");
  const pageUrl = canonicalUrl(path);
  const images = defaultOpenGraphImages(`${SITE_BRAND} shop`);
  const imageUrl = images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: sale ? canonical : pageUrl,
      siteName: SITE_BRAND,
      type: "website",
      locale: "en_PK",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
