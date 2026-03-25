"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export function FavoritesClient({ catalogProducts }: { catalogProducts: Product[] }) {
  const { ids } = useFavorites();

  const products = useMemo(() => {
    const byId = new Map(catalogProducts.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is Product => p != null);
  }, [ids, catalogProducts]);

  return (
    <div className="min-h-[60vh] bg-cream-deep px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <nav
          className="mb-8 flex items-center gap-2 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="text-[var(--dark)]/70 no-underline hover:text-[var(--dark)]">
            Home
          </Link>
          <span className="text-[var(--gold)]">/</span>
          <span className="text-[var(--dark)]">Favorites</span>
        </nav>
        <h1 className="font-[var(--font-cormorant)] text-[clamp(2rem,4vw,3rem)] font-semibold text-[var(--dark)]">
          Favorites
        </h1>
        <p className="mt-2 max-w-lg font-[var(--font-dm-sans)] text-[15px] font-light text-muted">
          Pieces you&apos;ve saved. Add to cart or buy anytime.
        </p>

        {products.length === 0 ? (
          <div className="mt-14 rounded-[var(--radius)] border border-black/[0.08] bg-white/80 px-8 py-14 text-center">
            <p className="font-[var(--font-cormorant)] text-xl text-[var(--dark)]">No favorites yet</p>
            <p className="mx-auto mt-2 max-w-sm font-[var(--font-dm-sans)] text-[14px] text-[var(--muted)]">
              Tap the heart on any product card to save it here.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-[var(--dark)] px-8 py-3 font-[var(--font-dm-sans)] text-[14px] font-medium text-white no-underline hover:bg-coffee-hover"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
