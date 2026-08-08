#!/usr/bin/env node
/**
 * Pull Shopify catalog via Storefront API → src/lib/data.generated.ts
 *
 * Requires:
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=...
 *
 * Usage: npm run catalog:from-shopify
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "src", "lib", "data.generated.ts");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(path.join(PROJECT_ROOT, ".env.local"));
loadEnvFile(path.join(PROJECT_ROOT, ".env"));

const DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ||
  process.env.SHOPIFY_STORE_DOMAIN?.trim();
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.trim();
const API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION?.trim() ||
  process.env.SHOPIFY_API_VERSION?.trim() ||
  "2025-01";

if (!DOMAIN || !TOKEN) {
  console.error(
    "Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN."
  );
  console.error("See docs/shopify-setup.md");
  process.exit(1);
}

async function storefront(query, variables) {
  const res = await fetch(
    `https://${DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

const COLLECTIONS_QUERY = `
  query Collections($cursor: String) {
    collections(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        handle
        title
        description
        image { url }
        products(first: 100) {
          nodes { id handle }
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        featuredImage { url }
        images(first: 12) { nodes { url } }
        collections(first: 5) {
          nodes { handle }
        }
        variants(first: 50) {
          nodes {
            id
            title
            availableForSale
            price { amount }
            compareAtPrice { amount }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

async function fetchAllCollections() {
  const all = [];
  let cursor = null;
  for (;;) {
    const data = await storefront(COLLECTIONS_QUERY, { cursor });
    all.push(...data.collections.nodes);
    if (!data.collections.pageInfo.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }
  return all;
}

async function fetchAllProducts() {
  const all = [];
  let cursor = null;
  for (;;) {
    const data = await storefront(PRODUCTS_QUERY, { cursor });
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return all;
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toLocalOrAbsoluteImage(url) {
  if (!url) return "/images/products/placeholder.svg";
  try {
    const u = new URL(url);
    // Prefer keeping Shopify CDN URLs (images may not exist on Artzens host after sync)
    return u.href;
  } catch {
    return url;
  }
}

function mapProduct(node) {
  const variants = node.variants?.nodes || [];
  const first = variants[0];
  const price = first ? Math.round(parseFloat(first.price.amount)) : 0;
  const compare = first?.compareAtPrice?.amount
    ? Math.round(parseFloat(first.compareAtPrice.amount))
    : undefined;

  const collectionSlug =
    node.collections?.nodes?.[0]?.handle || "uncategorized";

  const images = (node.images?.nodes || []).map((i) =>
    toLocalOrAbsoluteImage(i.url)
  );
  const image =
    toLocalOrAbsoluteImage(node.featuredImage?.url) ||
    images[0] ||
    "/images/products/placeholder.svg";

  const description =
    stripHtml(node.description) ||
    stripHtml(node.descriptionHtml) ||
    "Premium quality wall art. Cash on Delivery across Pakistan.";

  /** @type {any} */
  const product = {
    id: node.handle,
    slug: node.handle,
    name: node.title,
    description,
    longDescription: description,
    price,
    image,
    images: images.length ? images : [image],
    collectionSlug,
    shopifyProductId: node.id,
    shopifyVariantId: first?.id,
  };

  if (compare != null && compare > price) {
    product.originalPrice = compare;
  }

  const sizeOpts = [];
  for (const v of variants) {
    const sizeOpt = v.selectedOptions?.find(
      (o) => o.name.toLowerCase() === "size"
    );
    const label =
      sizeOpt?.value ||
      (v.title !== "Default Title" ? v.title : null);
    if (!label || label === "Default Title") continue;
    sizeOpts.push({
      id: v.id.split("/").pop() || label,
      label,
      price: Math.round(parseFloat(v.price.amount)),
      shopifyVariantId: v.id,
    });
  }

  if (sizeOpts.length > 0) {
    product.sizeOptions = sizeOpts;
    product.price = sizeOpts[0].price;
    product.shopifyVariantId = sizeOpts[0].shopifyVariantId;
    product.pricingDetail = sizeOpts
      .map((o) => `${o.label} · Rs. ${o.price}`)
      .join(" · ");
  }

  return product;
}

function mapCollection(node, productsByHandle) {
  const productIds = (node.products?.nodes || [])
    .map((p) => p.handle)
    .filter((h) => productsByHandle.has(h));

  return {
    slug: node.handle,
    name: node.title,
    description: node.description || "",
    image: node.image?.url
      ? toLocalOrAbsoluteImage(node.image.url)
      : undefined,
    productIds,
  };
}

function main() {
  return Promise.resolve().then(async () => {
    console.log(`Syncing catalog from ${DOMAIN}…`);
    const [shopCollections, shopProducts] = await Promise.all([
      fetchAllCollections(),
      fetchAllProducts(),
    ]);

    const products = shopProducts.map(mapProduct);
    const productsByHandle = new Map(products.map((p) => [p.slug, p]));

    let collections = shopCollections.map((c) =>
      mapCollection(c, productsByHandle)
    );

    // Ensure every product appears in its collection's productIds
    for (const p of products) {
      let col = collections.find((c) => c.slug === p.collectionSlug);
      if (!col) {
        col = {
          slug: p.collectionSlug,
          name: p.collectionSlug,
          description: "",
          productIds: [],
        };
        collections.push(col);
      }
      if (!col.productIds.includes(p.id)) col.productIds.push(p.id);
    }

    // Drop empty helper collections with zero products
    collections = collections.filter((c) => c.productIds.length > 0);

    const generatedAt = new Date().toISOString();
    const content = `// Auto-generated by scripts/sync-shopify-catalog.mjs – do not edit by hand.
// Re-run: npm run catalog:from-shopify

import type { Collection, Product } from "./data";

export const catalogGeneratedAt = ${JSON.stringify(generatedAt)} as const;

export const collections: Collection[] = ${JSON.stringify(collections, null, 2)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

    fs.writeFileSync(OUT_PATH, content, "utf8");
    console.log(
      `Wrote ${OUT_PATH} (${collections.length} collections, ${products.length} products)`
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
