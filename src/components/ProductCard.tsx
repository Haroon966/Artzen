"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, memo } from "react";
import type { Product } from "@/lib/data";
import type { ShopListProduct } from "@/lib/shop-list-product";
import {
  getCollection,
  getCollectionDisplayName,
  PRODUCT_SLUGS_NEW_BADGE,
} from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";
import { useFavorites } from "@/context/FavoritesContext";
import { trackSelectItem } from "@/lib/analytics";
import {
  buildProductOrderWhatsAppMessage,
  getSiteOrigin,
  whatsAppOrderLink,
} from "@/lib/site";
import { CatalogImageWatermark } from "@/components/CatalogImageWatermark";
import {
  catalogImageProtectClassName,
  productImageInteractionProps,
} from "@/lib/image-protection";

const SALE_RED = "#c94444";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

type ProductCardModel = Product | ShopListProduct;

function cartPayload(product: ProductCardModel) {
  return {
    name: productDisplayName(product),
    price: product.price,
    slug: product.slug,
  };
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ProductCardInner({
  product,
  itemIndex,
}: {
  product: ProductCardModel;
  itemIndex?: number;
}) {
  const { toggleFavorite, isFavorite } = useFavorites();

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
  const showHoverMockup = cardMockup != null && cardMockup !== cardPrimary;

  const orderHref = whatsAppOrderLink(
    buildProductOrderWhatsAppMessage({
      productName: cartPayload(product).name,
      productUrl: `${getSiteOrigin()}/products/${product.slug}`,
      price: product.price,
      quantity: 1,
    })
  );

  const handleFav = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(product.id);
    },
    [toggleFavorite, product.id]
  );

  const handleSelect = useCallback(() => {
    trackSelectItem({
      item_id: product.id,
      item_name: title,
      price: product.price,
      index: itemIndex,
    });
  }, [product.id, product.price, title, itemIndex]);

  return (
    <article
      className="product-card group relative flex flex-col overflow-hidden rounded-2xl border border-solid border-[color:rgba(30,40,50,0.22)] bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-[color:rgba(125,170,138,0.45)] hover:shadow-[0_20px_48px_rgba(44,24,16,0.08)] max-lg:hover:translate-y-0 lg:hover:-translate-y-[5px]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f0ece3]">
        <Link
          href={href}
          onClick={handleSelect}
          className={`relative block h-full w-full ${catalogImageProtectClassName}`}
          aria-label={`View ${title}`}
        >
          {showHoverMockup ? (
            <>
              <Image
                src={cardPrimary}
                alt={title}
                fill
                className="object-contain object-top px-0 pt-2 pb-2 transition-opacity duration-500 ease-out group-hover:opacity-0"
                sizes="(max-width: 640px) min(50vw, 1400px), (max-width: 1024px) min(33vw, 1400px), min(280px, 1400px)"
                {...productImageInteractionProps}
              />
              <Image
                src={cardMockup}
                alt=""
                fill
                className="object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                sizes="(max-width: 640px) min(50vw, 1400px), (max-width: 1024px) min(33vw, 1400px), min(280px, 1400px)"
                {...productImageInteractionProps}
              />
            </>
          ) : (
            <Image
              src={cardPrimary}
              alt={title}
              fill
              className="object-contain object-top px-0 pt-2 pb-2"
              sizes="(max-width: 640px) min(50vw, 1400px), (max-width: 1024px) min(33vw, 1400px), min(280px, 1400px)"
              {...productImageInteractionProps}
            />
          )}
        </Link>
        <CatalogImageWatermark variant="card" />

        {onSale && (
          <span
            className="pointer-events-none absolute left-3 top-3 z-[3] rounded-full px-2.5 py-1 font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.06em] text-white shadow-sm"
            style={{ backgroundColor: SALE_RED }}
          >
            Sale
          </span>
        )}
        {showNew && !onSale && (
          <span className="pointer-events-none absolute left-3 top-3 z-[3] rounded-full bg-[var(--golden-earth)] px-2.5 py-1 font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.06em] text-coffee-bean">
            New
          </span>
        )}

        <button
          type="button"
          onClick={handleFav}
          className={`absolute right-2.5 top-2.5 z-[4] flex h-11 w-11 max-md:h-11 max-md:w-11 items-center justify-center rounded-full border-0 bg-white/90 shadow-sm transition-[opacity,transform,background-color] duration-250 max-lg:translate-y-0 max-lg:opacity-100 lg:h-[34px] lg:w-[34px] lg:-translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 ${
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

        <a
          href={orderHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 z-[3] flex h-11 items-center justify-center gap-2 bg-coffee-bean font-[var(--font-dm-sans)] text-[13px] font-medium text-white no-underline transition-[transform,background-color] duration-300 ease-out hover:bg-coffee-hover max-lg:translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0"
          aria-label="Call to order on WhatsApp"
        >
          <PhoneIcon className="h-3.5 w-3.5" />
          Call to Order
        </a>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-[18px] pt-3.5">
        <Link
          href={href}
          onClick={handleSelect}
          className="mb-1 font-[var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--golden-earth)] no-underline line-clamp-1 hover:underline"
        >
          {categoryLabel}
        </Link>
        <Link href={href} onClick={handleSelect} className="no-underline">
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
    </article>
  );
}

ProductCardInner.displayName = "ProductCard";

export const ProductCard = memo(ProductCardInner);
