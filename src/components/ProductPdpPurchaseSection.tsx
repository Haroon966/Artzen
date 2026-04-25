"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import type { Product } from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";

const FINISHES = [
  { name: "Natural", color: "#D4C4A8" },
  { name: "Dark Slate", color: "#1E2832" },
  { name: "Sage", color: "#7DAA8A" },
  { name: "Walnut", color: "#C4A882" },
] as const;

/** Legacy PDP when `sizeOptions` is missing from catalog data */
const LEGACY_SIZES = ["Small", "Medium", "Large"] as const;
const LEGACY_MATERIALS = ["MDF Wood", "Acrylic", "Premium"] as const;

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function defaultLegacySize(dimensions?: string): (typeof LEGACY_SIZES)[number] {
  if (!dimensions) return "Medium";
  const d = dimensions.toLowerCase();
  if (/\b40\b|large/i.test(dimensions)) return "Large";
  if (/\b20\b|small/i.test(dimensions)) return "Small";
  if (/\b30\b|medium/i.test(dimensions)) return "Medium";
  if (d.includes("large")) return "Large";
  if (d.includes("small")) return "Small";
  return "Medium";
}

function defaultLegacyMaterial(material?: string): (typeof LEGACY_MATERIALS)[number] {
  if (!material) return "MDF Wood";
  const m = material.toLowerCase();
  if (m.includes("acrylic")) return "Acrylic";
  if (m.includes("premium") || m.includes("mirror")) return "Premium";
  return "MDF Wood";
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

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function ProductPdpPurchaseSection({
  product,
  onSale,
  discountPct,
  children,
}: {
  product: Product;
  onSale: boolean;
  discountPct: number;
  children: React.ReactNode;
}) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const opts = product.sizeOptions;
  const hasPdfSizes = opts != null && opts.length > 0;

  const [selectedId, setSelectedId] = useState(() => opts?.[0]?.id ?? "default");

  const selected = useMemo(() => {
    if (!opts?.length) return null;
    return opts.find((o) => o.id === selectedId) ?? opts[0];
  }, [opts, selectedId]);

  const displayPrice = selected?.price ?? product.price;
  const displayMaterial = selected?.material ?? product.material;

  const showStrikeSale =
    !hasPdfSizes && onSale && product.originalPrice != null && product.originalPrice > product.price;

  const [legacySize, setLegacySize] = useState<(typeof LEGACY_SIZES)[number]>(() =>
    defaultLegacySize(product.dimensions)
  );
  const [legacyMaterial, setLegacyMaterial] = useState<(typeof LEGACY_MATERIALS)[number]>(() =>
    defaultLegacyMaterial(product.material)
  );
  const [finish, setFinish] = useState<string>("Natural");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [buyNowPending, setBuyNowPending] = useState(false);

  const fav = isFavorite(product.id);

  const payload = useMemo(() => {
    if (hasPdfSizes && selected) {
      return {
        id: `${product.id}::${selected.id}`,
        slug: product.slug,
        name: `${productDisplayName(product)} — ${selected.label}`,
        price: selected.price,
        image: product.image,
      };
    }
    return {
      id: product.id,
      slug: product.slug,
      name: productDisplayName(product),
      price: product.price,
      image: product.image,
    };
  }, [hasPdfSizes, selected, product]);

  useEffect(() => {
    trackViewItem({
      item_id: payload.id,
      item_name: payload.name,
      price: payload.price,
    });
  }, [payload.id, payload.name, payload.price]);

  const bumpQty = useCallback((delta: number) => {
    setQty((q) => Math.max(1, Math.min(99, q + delta)));
  }, []);

  const handleAdd = useCallback(() => {
    if (added) return;
    addItem(payload, qty);
    trackAddToCart({
      item_id: payload.id,
      item_name: payload.name,
      price: payload.price,
      quantity: qty,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }, [addItem, payload, qty, added]);

  const handleBuyNow = useCallback(() => {
    if (buyNowPending) return;
    setBuyNowPending(true);
    addItem(payload, qty);
    trackAddToCart({
      item_id: payload.id,
      item_name: payload.name,
      price: payload.price,
      quantity: qty,
    });
    window.setTimeout(() => setBuyNowPending(false), 1500);
  }, [addItem, payload, qty, buyNowPending]);

  return (
    <>
      <div className="mt-4 flex flex-wrap items-baseline gap-2.5 border-b border-[var(--border)] pb-4">
        <span className="font-[var(--font-cormorant)] text-[32px] font-semibold leading-none text-[var(--text-primary)] max-[480px]:text-[26px]">
          {formatPrice(hasPdfSizes ? displayPrice : product.price)}
        </span>
        {showStrikeSale && product.originalPrice != null && (
          <>
            <span className="font-[var(--font-dm-sans)] text-lg text-[var(--text-muted)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
            {discountPct > 0 && (
              <span className="rounded-[var(--radius-pill)] bg-[rgba(201,68,68,0.09)] px-2.5 py-0.5 font-[var(--font-dm-sans)] text-[12px] font-semibold text-[var(--red)]">
                Save {discountPct}%
              </span>
            )}
          </>
        )}
      </div>

      {children}

      <div className="mt-6 space-y-5">
        <div role="group" aria-labelledby="pdp-size-heading">
          <p
            id="pdp-size-heading"
            className="mb-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)]"
          >
            {hasPdfSizes ? "Size & price" : "Size"}{" "}
            <span className="font-normal text-[var(--text-muted)]">
              {hasPdfSizes ? "(from rate list)" : ""}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {hasPdfSizes && opts
              ? opts.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    aria-pressed={selectedId === o.id}
                    aria-label={`${o.label}, ${formatPrice(o.price)}`}
                    className={`max-w-full rounded-[var(--radius-pill)] border-[1.5px] px-[14px] py-[9px] text-left font-[var(--font-dm-sans)] text-[12.5px] leading-snug transition-colors sm:text-[13px] ${
                      selectedId === o.id
                        ? "border-[var(--sage)] bg-[var(--sage-muted)] font-medium text-[var(--slate)]"
                        : "border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--sage)] hover:text-[var(--slate)]"
                    }`}
                  >
                    <span className="block">{o.label}</span>
                    <span className="mt-0.5 block tabular-nums text-[11.5px] text-[var(--text-muted)] sm:text-[12px]">
                      {formatPrice(o.price)}
                    </span>
                  </button>
                ))
              : LEGACY_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLegacySize(s)}
                    aria-pressed={legacySize === s}
                    aria-label={`Size ${s}`}
                    className={`rounded-[var(--radius-pill)] border-[1.5px] px-[18px] py-[7px] font-[var(--font-dm-sans)] text-[13px] transition-colors ${
                      legacySize === s
                        ? "border-[var(--sage)] bg-[var(--sage-muted)] font-medium text-[var(--slate)]"
                        : "border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--sage)] hover:text-[var(--slate)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
          </div>
        </div>

        <div role="group" aria-labelledby="pdp-material-heading">
          <p
            id="pdp-material-heading"
            className="mb-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)]"
          >
            Material
          </p>
          {hasPdfSizes ? (
            <p className="m-0 max-w-prose rounded-[var(--radius-md)] border border-[var(--border-mid)] bg-[var(--bg-card)] px-3.5 py-2.5 font-[var(--font-dm-sans)] text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {displayMaterial ?? "See product notes"}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {LEGACY_MATERIALS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLegacyMaterial(m)}
                  aria-pressed={legacyMaterial === m}
                  aria-label={`Material ${m}`}
                  className={`rounded-[var(--radius-pill)] border-[1.5px] px-[18px] py-[7px] font-[var(--font-dm-sans)] text-[13px] transition-colors ${
                    legacyMaterial === m
                      ? "border-[var(--sage)] bg-[var(--sage-muted)] font-medium text-[var(--slate)]"
                      : "border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--sage)] hover:text-[var(--slate)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div role="group" aria-labelledby="pdp-finish-heading">
          <p
            id="pdp-finish-heading"
            className="mb-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)]"
          >
            Finish: <span className="font-normal text-[var(--text-muted)]">{finish}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FINISHES.map((f) => (
              <button
                key={f.name}
                type="button"
                title={f.name}
                onClick={() => setFinish(f.name)}
                className={`h-8 w-8 shrink-0 rounded-full border-[2.5px] transition-[border-color,transform] outline-none ${
                  finish === f.name
                    ? "border-[var(--sage)] scale-110"
                    : "border-transparent hover:border-[var(--sage)] hover:scale-110"
                }`}
                style={{ backgroundColor: f.color }}
                aria-label={f.name}
                aria-pressed={finish === f.name}
              />
            ))}
          </div>
        </div>

        <p className="font-[var(--font-dm-sans)] text-[12.5px] leading-relaxed text-[var(--text-muted)]">
          <strong className="font-medium text-[var(--text-secondary)]">Cash on Delivery</strong>{" "}
          nationwide. We&apos;ll confirm your order on WhatsApp within 1–2 business days.{" "}
          <Link href="/cod/" className="text-[var(--sage-deep)] underline hover:text-[var(--sage)]">
            COD details
          </Link>
          {" · "}
          <Link
            href="/contact/"
            className="text-[var(--sage-deep)] underline hover:text-[var(--sage)]"
          >
            Returns &amp; support
          </Link>
          .
        </p>

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex h-[50px] items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-mid)] bg-[var(--bg-card)]">
            <button
              type="button"
              className="flex h-full w-11 items-center justify-center border-0 bg-transparent text-lg text-[var(--slate-muted)] transition-colors hover:bg-[var(--off-white-mid)] hover:text-[var(--slate)]"
              aria-label="Decrease quantity"
              onClick={() => bumpQty(-1)}
            >
              −
            </button>
            <span className="w-11 text-center font-[var(--font-dm-sans)] text-[15px] font-medium text-[var(--text-primary)] tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              className="flex h-full w-11 items-center justify-center border-0 bg-transparent text-lg text-[var(--slate-muted)] transition-colors hover:bg-[var(--off-white-mid)] hover:text-[var(--slate)]"
              aria-label="Increase quantity"
              onClick={() => bumpQty(1)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={added}
            className={`flex h-[50px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border-0 font-[var(--font-dm-sans)] text-[14px] font-medium text-[var(--off-white)] transition-[background,transform] sm:min-w-[140px] ${
              added
                ? "bg-[var(--sage-deep)]"
                : "bg-[var(--slate)] hover:bg-[var(--slate-soft)] active:scale-[0.98]"
            }`}
          >
            {added ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Added!
              </>
            ) : (
              <>
                <CartIcon className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </button>

          <Link
            href="/checkout"
            onClick={handleBuyNow}
            aria-disabled={buyNowPending}
            className={`flex h-[50px] min-w-0 flex-1 items-center justify-center rounded-[var(--radius-md)] border-0 font-[var(--font-dm-sans)] text-[14px] font-medium text-white no-underline transition-[background,transform] sm:min-w-[120px] ${
              buyNowPending
                ? "pointer-events-none bg-[var(--sage-light)] opacity-80"
                : "bg-[var(--sage)] hover:bg-[var(--sage-light)] active:scale-[0.98]"
            }`}
          >
            {buyNowPending ? "Opening checkout..." : "Buy Now"}
          </Link>

          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-mid)] bg-[var(--bg-card)] transition-colors ${
              fav
                ? "border-[rgba(201,68,68,0.3)] bg-[rgba(201,68,68,0.06)] text-[var(--red)]"
                : "text-[var(--text-muted)] hover:border-[rgba(201,68,68,0.3)] hover:bg-[rgba(201,68,68,0.06)] hover:text-[var(--red)]"
            }`}
            aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={fav}
          >
            <HeartIcon className="h-[18px] w-[18px]" filled={fav} />
          </button>
        </div>
      </div>

      <div
        className="pdp-sticky-actions fixed left-0 right-0 z-[200] flex gap-2.5 border-t border-[var(--border-mid)] bg-[var(--off-white)] px-4 py-2.5 md:hidden"
        style={{
          bottom: "var(--site-mobile-tabbar-h, 64px)",
          paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        }}
        aria-label="Quick purchase actions"
      >
        <button
          type="button"
          onClick={handleAdd}
          disabled={added}
          className="h-[50px] flex-1 rounded-[var(--radius-md)] border-0 bg-[var(--slate)] font-[var(--font-dm-sans)] text-[14.5px] font-medium text-[var(--off-white)]"
        >
          {added ? "Added!" : "Add to Cart"}
        </button>
        <Link
          href="/checkout"
          onClick={handleBuyNow}
          aria-disabled={buyNowPending}
          className={`flex h-[50px] flex-1 items-center justify-center rounded-[var(--radius-md)] font-[var(--font-dm-sans)] text-[14.5px] font-medium text-white no-underline ${
            buyNowPending
              ? "pointer-events-none bg-[var(--sage-light)] opacity-80"
              : "bg-[var(--sage)]"
          }`}
        >
          {buyNowPending ? "Opening..." : "Buy Now"}
        </Link>
      </div>
    </>
  );
}
