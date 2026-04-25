import type { Metadata } from "next";
import Link from "next/link";
import {
  absoluteUrl,
  canonicalUrl,
  getDefaultShareImagePath,
  SITE_BRAND,
} from "@/lib/site";
import { clipMetaDescription } from "@/lib/seo";
import { Suspense } from "react";
import { getServerShopPageData } from "@/lib/catalog-server";
import { ShopShellClient } from "./ShopShellClient";

const shopDescRaw = `Browse ${SITE_BRAND} — wall art, Islamic calligraphy, gifts, decor, and more. Cash on Delivery across Pakistan.`;
const shopDesc = clipMetaDescription(shopDescRaw);
const shopOg = absoluteUrl(getDefaultShareImagePath());

export function generateMetadata(): Metadata {
  return {
    title: "Shop all products",
    description: shopDesc,
    alternates: { canonical: canonicalUrl("/shop") },
    robots: { index: true, follow: true },
    openGraph: {
      title: "Shop all products",
      description: shopDesc,
      url: canonicalUrl("/shop"),
      images: [{ url: shopOg, alt: `${SITE_BRAND} shop` }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop all products",
      description: shopDesc,
      images: [shopOg],
    },
  };
}

export default async function ShopPage() {
  const { shopProducts, count, categoryLinks, facetSummary } = await getServerShopPageData();

  return (
    <div className="min-h-screen bg-cream-deep">
      <Suspense
        fallback={
          <section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-14 2xl:px-16">
            <h1 className="font-[var(--font-cormorant)] text-4xl font-semibold text-[var(--dark)]">
              Shop all products
            </h1>
            <p className="mt-3 max-w-2xl font-[var(--font-dm-sans)] text-[15px] text-muted">
              Browse wall art, calligraphy, gifts, and decor. {SITE_BRAND} delivers
              across Pakistan with Cash on Delivery.
            </p>
            <p className="mt-3 font-[var(--font-dm-sans)] text-sm text-[var(--dark)]/70">
              {count}+ products available.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {categoryLinks.slice(0, 10).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-black/[0.12] bg-white px-4 py-2 text-[13px] text-[var(--dark)] no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        }
      >
        <ShopShellClient
          shopProducts={shopProducts}
          facetSummary={facetSummary}
          categoryLinks={categoryLinks}
        />
      </Suspense>
    </div>
  );
}
