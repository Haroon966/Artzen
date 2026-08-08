/** Shopify config for Artzens (Basic-plan cart permalink + optional Storefront API). */

export const SHOPIFY_API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION?.trim() || "2025-01";

export function getShopifyStoreDomain(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ||
    process.env.SHOPIFY_STORE_DOMAIN?.trim() ||
    undefined
  );
}

export function getShopifyStorefrontToken(): string | undefined {
  return process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.trim() || undefined;
}

/**
 * True when checkout redirect can work (store domain only).
 * Basic plan: cart lives on Artzens; checkout uses Shopify `/cart/VARIANT:QTY` permalink.
 */
export function isShopifyConfigured(): boolean {
  return Boolean(getShopifyStoreDomain());
}

/** Optional Storefront API (Headless channel / paid features) — not required for permalink checkout. */
export function isShopifyStorefrontConfigured(): boolean {
  return Boolean(getShopifyStoreDomain() && getShopifyStorefrontToken());
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly errors?: unknown
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = getShopifyStoreDomain();
  const token = getShopifyStorefrontToken();
  if (!domain || !token) {
    throw new ShopifyError(
      "Shopify Storefront API is not configured. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN (optional for Basic cart-permalink checkout)."
    );
  }

  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ShopifyError(
      `Shopify Storefront HTTP ${res.status}: ${text.slice(0, 200)}`
    );
  }

  const json = (await res.json()) as GraphqlResponse<T>;
  if (json.errors?.length) {
    throw new ShopifyError(
      json.errors.map((e) => e.message).join("; "),
      json.errors
    );
  }
  if (!json.data) {
    throw new ShopifyError("Shopify Storefront returned no data");
  }
  return json.data;
}
