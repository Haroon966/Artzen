"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ShopFacetSummary } from "@/lib/shop-types";
import type { ShopListProduct } from "@/lib/shop-list-product";
import { ShopGallery } from "./ShopGallery";

type LinkItem = { href: string; label: string };

export function ShopShellClient({
  shopProducts,
  facetSummary,
  categoryLinks,
  initialSaleOnly = false,
}: {
  shopProducts: ShopListProduct[];
  facetSummary: ShopFacetSummary;
  categoryLinks: LinkItem[];
  initialSaleOnly?: boolean;
}) {
  const [urlSale, setUrlSale] = useState(initialSaleOnly);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSale =
      initialSaleOnly ||
      params.get("sale") === "1" ||
      params.get("sale") === "true";
    setUrlSale(isSale);
  }, [initialSaleOnly]);

  return (
    <>
      <ShopGallery
        shopProducts={shopProducts}
        facetSummary={facetSummary}
        initialSaleOnly={urlSale}
      />

      <section
        id="browse-collections"
        className="scroll-mt-[calc(var(--nav-h-mobile)+1rem)] w-full border-t border-black/[0.06] bg-cream-soft px-4 py-12 text-center sm:px-6 lg:scroll-mt-[calc(var(--nav-h-desktop)+1rem)] lg:px-10 xl:px-14 2xl:px-16"
      >
        <p className="font-[var(--font-cormorant)] text-xl text-[var(--dark)] sm:text-2xl">
          Browse by collection
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-black/[0.12] bg-white px-5 py-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--dark)] no-underline transition hover:border-[var(--gold)]/40"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
