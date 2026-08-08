#!/usr/bin/env node
/**
 * Push local Artzens catalog (src/lib/data.generated.ts) into Shopify via Admin API.
 *
 * Requires (in .env.local or environment):
 *   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN=shpat_...
 * Optional:
 *   SHOPIFY_API_VERSION=2025-01
 *   ARTZENS_IMAGE_BASE_URL=https://artzens.com
 *   NEXT_PUBLIC_SITE_URL=https://artzens.com
 *
 * Usage: npm run catalog:to-shopify
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const GENERATED = path.join(PROJECT_ROOT, "src", "lib", "data.generated.ts");
const MAP_PATH = path.join(__dirname, ".shopify-import-map.json");

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
  process.env.SHOPIFY_STORE_DOMAIN?.trim() ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
const API_VERSION = process.env.SHOPIFY_API_VERSION?.trim() || "2025-01";
const IMAGE_BASE = (
  process.env.ARTZENS_IMAGE_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://artzens.com"
).replace(/\/$/, "");

if (!DOMAIN || !TOKEN) {
  console.error(
    "Missing SHOPIFY_STORE_DOMAIN (or NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) and SHOPIFY_ADMIN_TOKEN."
  );
  console.error("See docs/shopify-setup.md");
  process.exit(1);
}

/** Extract a top-level `export const name = [...]` array from generated TS. */
function extractExportArray(src, name) {
  const re = new RegExp(`export const ${name}(?::[^=]+)?=\\s*`);
  const m = re.exec(src);
  if (!m) throw new Error(`Could not find export const ${name}`);
  let i = m.index + m[0].length;
  while (src[i] && /\s/.test(src[i])) i++;
  if (src[i] !== "[") throw new Error(`Expected [ after ${name}`);
  let depth = 0;
  let inString = false;
  let quote = "";
  let escape = false;
  const start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        return JSON.parse(src.slice(start, i + 1));
      }
    }
  }
  throw new Error(`Unclosed array for ${name}`);
}

function absoluteImageUrl(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  const p = src.startsWith("/") ? src : `/${src}`;
  return `${IMAGE_BASE}${p}`;
}

async function adminFetch(pathname, { method = "GET", body } = {}) {
  const url = `https://${DOMAIN}/admin/api/${API_VERSION}${pathname}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg =
      json?.errors ||
      json?.error ||
      text.slice(0, 400) ||
      res.statusText;
    throw new Error(`Admin ${method} ${pathname} → ${res.status}: ${JSON.stringify(msg)}`);
  }
  return json;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildVariants(product) {
  const opts = product.sizeOptions;
  if (opts?.length) {
    return opts.map((o, idx) => ({
      option1: o.label,
      price: String(o.price),
      sku: `${product.slug}-${o.id || idx}`,
      inventory_management: null,
      requires_shipping: true,
    }));
  }
  return [
    {
      option1: "Default Title",
      price: String(product.price),
      sku: product.slug,
      inventory_management: null,
      requires_shipping: true,
    },
  ];
}

async function ensureCustomCollection(collection, map) {
  const existing = map.collections[collection.slug];
  if (existing?.id) return existing;

  const created = await adminFetch("/custom_collections.json", {
    method: "POST",
    body: {
      custom_collection: {
        title: collection.name,
        handle: collection.slug,
        body_html: collection.description || "",
        published: true,
      },
    },
  });
  const c = created.custom_collection;
  map.collections[collection.slug] = { id: c.id, handle: c.handle };
  await sleep(350);
  return map.collections[collection.slug];
}

async function createOrSkipProduct(product, collectionShopifyId, map) {
  if (map.products[product.slug]?.id) {
    console.log(`  skip (exists): ${product.slug}`);
    return map.products[product.slug];
  }

  const imageUrls = [];
  const primary = absoluteImageUrl(product.image);
  if (primary) imageUrls.push(primary);
  for (const img of product.images || []) {
    const u = absoluteImageUrl(img);
    if (u && !imageUrls.includes(u)) imageUrls.push(u);
  }

  const variants = buildVariants(product);
  const hasSizeOption =
    product.sizeOptions?.length > 0 ||
    (variants.length === 1 && variants[0].option1 !== "Default Title");

  const payload = {
    product: {
      title: product.name,
      handle: product.slug,
      body_html: `<p>${product.longDescription || product.description || ""}</p>`,
      vendor: "Artzens",
      product_type: product.collectionSlug || "",
      status: "active",
      published: true,
      options: hasSizeOption
        ? [{ name: "Size" }]
        : [{ name: "Title" }],
      variants,
      images: imageUrls.slice(0, 8).map((src) => ({ src })),
    },
  };

  // Default Title products should not send a custom Size option
  if (!product.sizeOptions?.length) {
    payload.product.options = [{ name: "Title" }];
    payload.product.variants = [
      {
        price: String(product.price),
        sku: product.slug,
        inventory_management: null,
        requires_shipping: true,
      },
    ];
  }

  const created = await adminFetch("/products.json", {
    method: "POST",
    body: payload,
  });
  const p = created.product;

  const variantMap = {};
  for (const v of p.variants || []) {
    const label = v.option1 || v.title || "Default Title";
    variantMap[label] = {
      id: v.id,
      admin_graphql_api_id: v.admin_graphql_api_id,
      price: v.price,
    };
  }

  map.products[product.slug] = {
    id: p.id,
    handle: p.handle,
    admin_graphql_api_id: p.admin_graphql_api_id,
    variants: variantMap,
  };

  if (collectionShopifyId) {
    try {
      await adminFetch("/collects.json", {
        method: "POST",
        body: {
          collect: {
            product_id: p.id,
            collection_id: collectionShopifyId,
          },
        },
      });
    } catch (err) {
      console.warn(`  collect link failed for ${product.slug}:`, err.message);
    }
  }

  await sleep(400);
  console.log(`  created: ${product.slug} (${(p.variants || []).length} variants)`);
  return map.products[product.slug];
}

async function main() {
  const src = fs.readFileSync(GENERATED, "utf8");
  const collections = extractExportArray(src, "collections");
  const products = extractExportArray(src, "products");

  /** @type {{ collections: Record<string, any>, products: Record<string, any> }} */
  let map = { collections: {}, products: {} };
  if (fs.existsSync(MAP_PATH)) {
    try {
      map = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
      map.collections ||= {};
      map.products ||= {};
    } catch {
      /* fresh map */
    }
  }

  console.log(
    `Importing ${collections.length} collections, ${products.length} products → ${DOMAIN}`
  );

  const collectionIdBySlug = {};
  for (const c of collections) {
    console.log(`Collection: ${c.slug}`);
    const entry = await ensureCustomCollection(c, map);
    collectionIdBySlug[c.slug] = entry.id;
    fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
  }

  let i = 0;
  for (const product of products) {
    i++;
    console.log(`[${i}/${products.length}] ${product.slug}`);
    const colId = collectionIdBySlug[product.collectionSlug];
    await createOrSkipProduct(product, colId, map);
    if (i % 5 === 0) {
      fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
    }
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`Done. Map written to ${MAP_PATH}`);
  console.log(
    "Next (Basic plan): npm run catalog:apply-shopify-map  → then set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and rebuild."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
