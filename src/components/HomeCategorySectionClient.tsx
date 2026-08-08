"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Collection } from "@/lib/data";
import * as q from "@/lib/catalog-queries";
import { useCatalogLive } from "@/context/CatalogLiveContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CategoryGrid } from "@/components/CategoryGrid";

export function HomeCategorySectionClient({
  homepageCategories,
  slidesBySlug,
}: {
  homepageCategories: Collection[];
  slidesBySlug: Record<string, string[]>;
}) {
  const { catalog } = useCatalogLive();

  const categories = useMemo(() => {
    if (!catalog) return homepageCategories;
    return q.getHomepageCollectionsFrom(catalog.collections);
  }, [catalog, homepageCategories]);

  const slides = useMemo(() => {
    if (!catalog) return slidesBySlug;
    const { products, collections } = catalog;
    const out: Record<string, string[]> = {};
    for (const c of categories) {
      out[c.slug] = q.getCollectionCategoryCardSlideImagesFrom(
        products,
        collections,
        c
      );
    }
    return out;
  }, [catalog, categories, slidesBySlug]);

  return (
    <section className="bg-[var(--bg)] px-4 py-12 sm:px-6">
      <AnimatedSection as="div" className="mx-auto max-w-6xl">
        <h2 className="font-[var(--font-cormorant)] text-2xl font-semibold text-[var(--text-primary)]">
          Shop by category
        </h2>
        <p className="mt-1 max-w-2xl text-[var(--muted)]">
          Tap a category to see wall art, calligraphy, gifts, and more — each opens its collection page.
        </p>
        <div className="mt-8 md:mt-10">
          <CategoryGrid collections={categories} slidesBySlug={slides} />
        </div>
        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/shop"
            className="rounded-full border border-[var(--border-mid)] bg-[var(--off-white)]/90 px-6 py-3 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)] no-underline shadow-[var(--shadow-sm)] backdrop-blur-sm transition hover:border-[var(--border-accent)] hover:bg-[var(--bg-card)]"
          >
            Browse all wall art products →
          </Link>
        </div>

        <div className="home-feature-bar feature-bar relative z-[1] mx-auto mt-12 grid w-full max-w-[1100px] grid-cols-1 gap-px overflow-hidden rounded-2xl bg-[var(--border-mid)] animate-[fadeUp_1s_0.25s_ease_both] sm:mt-14 sm:grid-cols-3">
          <div className="feature-item bg-[var(--cream)] px-6 py-7 text-center md:px-8">
            <h3 className="mb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--text-primary)]">
              🚚 Cash on Delivery
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Pay when your order arrives — COD across cities nationwide.
            </p>
          </div>
          <div className="feature-item bg-[var(--cream)] px-6 py-7 text-center md:px-8">
            <h3 className="mb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--text-primary)]">
              📦 Nationwide delivery
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Careful packing so your order reaches you in great shape.
            </p>
          </div>
          <div className="feature-item bg-[var(--cream)] px-6 py-7 text-center md:px-8">
            <h3 className="mb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--text-primary)]">
              🔒 Secure checkout
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Add to cart and checkout online — Cash on Delivery available nationwide.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
