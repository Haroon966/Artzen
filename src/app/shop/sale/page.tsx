import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buildShopMetadata } from "@/lib/seo-metadata";
import { getServerShopPageData } from "@/lib/catalog-server";
import { ShopSeoHead } from "@/components/ShopSeoHead";
import { ShopShellClient } from "../ShopShellClient";
import { SITE_BRAND } from "@/lib/site";

/** Static sale landing page with indexable metadata (canonical `/shop?sale=1`). */
export const metadata: Metadata = buildShopMetadata({ sale: "1" }, { path: "/shop/sale" });

export default async function ShopSalePage() {
  const { shopProducts, count, categoryLinks, facetSummary } = await getServerShopPageData();

  return (
    <div className="min-h-screen bg-cream-deep">
      <ShopSeoHead />
      <Suspense
        fallback={
          <section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-14 2xl:px-16">
            <h1 className="font-[var(--font-cormorant)] text-4xl font-semibold text-[var(--dark)]">
              Shop sale items
            </h1>
            <p className="mt-3 font-[var(--font-dm-sans)] text-sm text-[var(--dark)]/70">
              {count}+ products available.
            </p>
          </section>
        }
      >
        <ShopShellClient
          shopProducts={shopProducts}
          facetSummary={facetSummary}
          categoryLinks={categoryLinks}
          initialSaleOnly
        />
      </Suspense>
    </div>
  );
}
