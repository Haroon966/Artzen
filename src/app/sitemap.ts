import type { MetadataRoute } from "next";
import { getCachedCatalog } from "@/lib/catalog-server";
import { catalogGeneratedAt } from "@/lib/data.generated";
import { canonicalUrl } from "@/lib/site";

/**
 * Single sitemap.xml is valid until ~50k URLs or ~50MB uncompressed per Google’s limits.
 * If the catalog outgrows that, split via Next `generateSitemaps` (or multiple sitemap routes).
 */
/** Single timestamp for catalog-driven URLs (honest crawl signals vs `new Date()` every build). */
const catalogLastMod = new Date(catalogGeneratedAt);

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { collections, products } = await getCachedCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: catalogLastMod, changeFrequency: "daily", priority: 1 },
    { url: canonicalUrl("/shop"), lastModified: catalogLastMod, changeFrequency: "weekly", priority: 0.9 },
    {
      url: canonicalUrl("/shop?sale=1"),
      lastModified: catalogLastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: canonicalUrl("/about"), lastModified: catalogLastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/cod"), lastModified: catalogLastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/contact"), lastModified: catalogLastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/guide"), lastModified: catalogLastMod, changeFrequency: "weekly", priority: 0.85 },
    {
      url: canonicalUrl("/shipping-policy"),
      lastModified: catalogLastMod,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: canonicalUrl("/returns-policy"),
      lastModified: catalogLastMod,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: canonicalUrl("/privacy-policy"),
      lastModified: catalogLastMod,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: canonicalUrl("/terms"), lastModified: catalogLastMod, changeFrequency: "monthly", priority: 0.6 },
  ];

  const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
    url: canonicalUrl(`/collections/${c.slug}`),
    lastModified: catalogLastMod,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: canonicalUrl(`/products/${p.slug}`),
    lastModified: catalogLastMod,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}
