/** Shopify cart permalink / Buy Button–style checkout redirect (works on Basic plan). */

import { getShopifyStoreDomain } from "./config";

/**
 * Normalize a Storefront GID or numeric id to the numeric variant id
 * used in `/cart/VARIANT_ID:QTY` permalinks.
 */
export function shopifyVariantNumericId(id: string | undefined | null): string | null {
  if (!id) return null;
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/ProductVariant\/(\d+)/i);
  return m?.[1] ?? null;
}

export type CartPermalinkLine = {
  /** Shopify variant GID (`gid://shopify/ProductVariant/…`) or numeric id. */
  merchandiseId?: string;
  quantity: number;
};

/**
 * Build `https://{shop}.myshopify.com/cart/111:1,222:2` — Shopify adds the
 * lines and opens hosted cart/checkout (Basic plan; no Headless channel needed).
 */
export function buildShopifyCartPermalink(
  lines: CartPermalinkLine[],
  domain = getShopifyStoreDomain()
): string | null {
  if (!domain) return null;

  const parts: string[] = [];
  for (const line of lines) {
    const variantId = shopifyVariantNumericId(line.merchandiseId);
    if (!variantId || line.quantity <= 0) continue;
    parts.push(`${variantId}:${Math.floor(line.quantity)}`);
  }
  if (parts.length === 0) return null;

  const host = domain.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  // Cart permalink; Shopify then offers Checkout on their hosted page.
  return `https://${host}/cart/${parts.join(",")}`;
}

/** Instant Buy Now → Shopify checkout (permalink). Returns error message if blocked. */
export function buyNowCheckoutUrl(
  merchandiseId: string | undefined,
  quantity = 1
): { url: string } | { error: string } {
  if (!getShopifyStoreDomain()) {
    return {
      error:
        "Shopify checkout is not configured. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.",
    };
  }
  const url = buildShopifyCartPermalink([
    { merchandiseId, quantity },
  ]);
  if (!url) {
    return {
      error:
        "This product is missing a Shopify variant id. Sync the catalog first.",
    };
  }
  return { url };
}
