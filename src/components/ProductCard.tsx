"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@/lib/data";
import {
  getCollection,
  getCollectionDisplayName,
  PRODUCT_SLUGS_NEW_BADGE,
} from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

const SALE_RED = "#c94444";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function cartPayload(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: productDisplayName(product),
    price: product.price,
    image: product.image,
  };
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      <polyline points="20 6 9 12 4 9" />
    </svg>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [addedFlash, setAddedFlash] = useState(false);

  const onSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const href = `/products/${product.slug}`;
  const collection = getCollection(product.collectionSlug);
  const categoryLabel = collection
    ? getCollectionDisplayName(collection.slug, collection.name)
    : "Shop";
  const showNew =
    !onSale &&
    (product.isNew === true || PRODUCT_SLUGS_NEW_BADGE.has(product.slug));

  const title = productDisplayName(product);

  const discountPct =
    onSale && product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  const fav = isFavorite(product.id);

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const cardPrimary = product.cardImage || gallery[0] || product.image;
  const cardMockup = product.hoverImage || (gallery.length > 1 ? gallery[1] : null);
  const showHoverMockup = !reduceMotion && cardMockup != null && cardMockup !== cardPrimary;

  const handleAddCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (addedFlash) return;
      addItem(cartPayload(product));
      setAddedFlash(true);
      window.setTimeout(() => setAddedFlash(false), 2000);
    },
    [addItem, product, addedFlash]
  );

  const handleFav = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(product.id);
    },
    [toggleFavorite, product.id]
  );

  return (
    <motion.article
      className="product-card group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-[var(--golden-earth)]/30 hover:shadow-[0_20px_48px_rgba(44,24,16,0.08)] max-lg:hover:translate-y-0 lg:hover:-translate-y-[5px]"
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    >
      <div className="relative aspect-square overflow-hidden bg-[#f0ece3]">
        <Link
          href={href}
          className="relative block h-full w-full"
          aria-label={`View ${title}`}
        >
          {showHoverMockup ? (
            <>
              <Image
                src={cardPrimary}
                alt={title}
                fill
                className="object-contain object-top px-0 pt-2 pb-2 transition-opacity duration-500 ease-out group-hover:opacity-0"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                unoptimized
              />
              <Image
                src={cardMockup}
                alt=""
                fill
                className="object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                unoptimized
              />
            </>
          ) : (
            <Image
              src={cardPrimary}
              alt={title}
              fill
              className="object-contain object-top px-0 pt-2 pb-2"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              unoptimized
            />
          )}
        </Link>

        {onSale && (
          <span
            className="pointer-events-none absolute left-3 top-3 rounded-full px-2.5 py-1 font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.06em] text-white shadow-sm"
            style={{ backgroundColor: SALE_RED }}
          >
            Sale
          </span>
        )}
        {showNew && !onSale && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[var(--golden-earth)] px-2.5 py-1 font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.06em] text-coffee-bean">
            New
          </span>
        )}

        <button
          type="button"
          onClick={handleFav}
          className={`absolute right-2.5 top-2.5 z-[2] flex h-11 w-11 max-md:h-11 max-md:w-11 items-center justify-center rounded-full border-0 bg-white/90 shadow-sm transition-[opacity,transform,background-color] duration-250 max-lg:translate-y-0 max-lg:opacity-100 lg:h-[34px] lg:w-[34px] lg:-translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 ${
            fav ? "lg:opacity-100 lg:translate-y-0" : ""
          } hover:bg-white`}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={fav}
        >
          <svg
            className="h-[15px] w-[15px] transition-[fill,stroke] duration-200"
            viewBox="0 0 24 24"
            fill={fav ? SALE_RED : "none"}
            stroke={fav ? SALE_RED : "var(--coffee-bean)"}
            strokeWidth={1.8}
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleAddCart}
          disabled={addedFlash}
          className={`absolute bottom-0 left-0 right-0 z-[1] flex h-11 items-center justify-center gap-2 font-[var(--font-dm-sans)] text-[13px] font-medium text-white transition-[transform,background-color] duration-300 ease-out max-lg:translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 ${
            addedFlash ? "bg-[#2d6a4f] lg:translate-y-0" : "bg-coffee-bean hover:bg-coffee-hover"
          }`}
          aria-label={addedFlash ? "Added to cart" : "Add to cart"}
        >
          {addedFlash ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              Added!
            </>
          ) : (
            <>
              <CartIcon className="h-3.5 w-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-[18px] pt-3.5">
        <Link
          href={href}
          className="mb-1 font-[var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--golden-earth)] no-underline line-clamp-1 hover:underline"
        >
          {categoryLabel}
        </Link>
        <Link href={href} className="no-underline">
          <h3 className="mb-2.5 line-clamp-2 font-[var(--font-cormorant)] text-[18px] font-semibold leading-snug text-coffee-bean transition-colors hover:text-[var(--golden-earth)]">
            {title}
          </h3>
        </Link>

        <div className="mt-auto flex flex-wrap items-baseline gap-2 gap-y-1">
          <span className="font-[var(--font-cormorant)] text-[22px] font-semibold tabular-nums text-coffee-bean">
            {formatPrice(product.price)}
          </span>
          {onSale && product.originalPrice != null && (
            <>
              <span className="font-[var(--font-dm-sans)] text-[13px] text-coffee-bean/50 line-through tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
              {discountPct > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 font-[var(--font-dm-sans)] text-[11px] font-semibold"
                  style={{
                    color: SALE_RED,
                    backgroundColor: "rgba(217, 79, 79, 0.09)",
                  }}
                >
                  {discountPct}% off
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
