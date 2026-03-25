"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { ShopGallery, type ShopCategoryFilter } from "./ShopGallery";

type LinkItem = { href: string; label: string };

export function ShopShellClient({
  products,
  productCount,
  categoryLinks,
  categoryFilters,
}: {
  products: Product[];
  productCount: number;
  categoryLinks: LinkItem[];
  categoryFilters: ShopCategoryFilter[];
}) {
  const searchParams = useSearchParams();
  const urlSale =
    searchParams.get("sale") === "1" || searchParams.get("sale") === "true";
  const urlQ = searchParams.get("q")?.trim() ?? "";

  const [heroSale, setHeroSale] = useState(urlSale);

  useEffect(() => {
    setHeroSale(urlSale);
  }, [urlSale]);

  const saleOnly = heroSale;

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/[0.06] px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 md:pb-20 md:pt-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 85% 60% at 15% 0%, rgba(201, 168, 76, 0.14), transparent 50%),
              radial-gradient(circle at 85% 100%, rgba(20, 18, 16, 0.05), transparent 42%)
            `,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 top-0 h-32 w-1 bg-gradient-to-b from-[var(--gold)] to-[var(--gold)]/20 sm:h-48"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl">
          <nav
            className="mb-8 flex items-center gap-2 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="text-[var(--dark)]/70 no-underline transition hover:text-[var(--dark)]">
              Home
            </Link>
            <span className="text-[var(--gold)]">/</span>
            <span className="text-[var(--dark)]">{saleOnly ? "Sale" : "Shop"}</span>
          </nav>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-3xl">
              <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
                {saleOnly ? "Deals" : "The store"}
              </p>
              <h1 className="mt-3 font-[var(--font-cormorant)] text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.02] tracking-tight text-[var(--dark)]">
                {saleOnly ? (
                  <>
                    Sale <span className="font-normal italic text-muted">picks</span>
                  </>
                ) : (
                  <>
                    Browse the <span className="font-normal italic text-muted">full store</span>
                  </>
                )}
              </h1>
              <p className="mt-5 max-w-xl font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-muted">
                {saleOnly
                  ? "Discounted products right now — same COD delivery across Pakistan."
                  : "Wall art, gifts, calligraphy, and more in one place. Filter by category, search by name, pay on delivery."}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:shrink-0 lg:pb-1">
              <div className="rounded-[var(--radius)] border border-black/[0.08] bg-white/70 px-6 py-4 shadow-sm backdrop-blur-sm">
                <p className="font-[var(--font-cormorant)] text-3xl font-semibold text-[var(--dark)] tabular-nums">
                  {productCount}+
                </p>
                <p className="mt-0.5 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                  Products
                </p>
              </div>
              <div className="rounded-[var(--radius)] border border-black/[0.08] bg-coffee-bean-deep px-6 py-4 text-white shadow-md">
                <p className="font-[var(--font-cormorant)] text-lg font-semibold text-[var(--gold2)]">COD</p>
                <p className="mt-0.5 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-wider text-cream-deep/75">
                  No advance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShopGallery
        products={products}
        categoryFilters={categoryFilters}
        initialSaleOnly={urlSale}
        initialSearchQuery={urlQ}
        onSaleOnlyChange={setHeroSale}
      />

      <section className="border-t border-black/[0.06] bg-cream-soft px-4 py-12 text-center sm:px-6">
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
