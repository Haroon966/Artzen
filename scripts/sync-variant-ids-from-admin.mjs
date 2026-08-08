#!/usr/bin/env node
/**
 * Pull variant ids from the public Shopify Online Store JSON
 * (https://{store}/products.json) — no Admin/Headless token required.
 * Works on Basic plan for cart permalink checkout.
 *
 * Usage:
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=store.artzens.com npm run catalog:sync-variant-ids
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

const PUBLIC_HOST = (
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ||
  process.env.SHOPIFY_STORE_DOMAIN?.trim() ||
  "store.artzens.com"
)
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

/** Artzens slug → Shopify product handle when they differ. */
const HANDLE_ALIASES = {
  "lion-5": "products-lion-5",
  "potrait-5": "products-potrait-5",
  "allah-noor-us-samawat-wal-ard-2": "allah-noor-us-samawat-wal-ard",
  "sohail-stamp-maker": "sohail-stamp-makar",
};
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
      if (depth === 0) return JSON.parse(src.slice(start, i + 1));
    }
  }
  throw new Error(`Unclosed array for ${name}`);
}

async function fetchAllPublicProducts() {
  const all = [];
  let page = 1;
  for (;;) {
    const url = `https://${PUBLIC_HOST}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`GET ${url} → ${res.status}`);
    }
    const data = await res.json();
    const batch = data.products || [];
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 250) break;
    page++;
    if (page > 40) break;
  }
  return all;
}

function normalizeLabel(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[×x]/g, "*")
    .trim();
}

async function main() {
  console.log(`Fetching public products from https://${PUBLIC_HOST}/products.json …`);
  const shopProducts = await fetchAllPublicProducts();
  console.log(`Shopify products: ${shopProducts.length}`);

  const map = { collections: {}, products: {}, source: PUBLIC_HOST };
  for (const p of shopProducts) {
    const variantMap = {};
    for (const v of p.variants || []) {
      const label = v.option1 || v.title || "Default Title";
      variantMap[label] = {
        id: v.id,
        admin_graphql_api_id: `gid://shopify/ProductVariant/${v.id}`,
        price: v.price,
        title: v.title,
      };
      // Also index by full variant title
      if (v.title && v.title !== label) {
        variantMap[v.title] = variantMap[label];
      }
    }
    map.products[p.handle] = {
      id: p.id,
      handle: p.handle,
      admin_graphql_api_id: `gid://shopify/Product/${p.id}`,
      variants: variantMap,
      rawVariants: p.variants || [],
    };
  }
  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`Wrote ${MAP_PATH}`);

  const src = fs.readFileSync(GENERATED, "utf8");
  const collections = extractExportArray(src, "collections");
  const products = extractExportArray(src, "products");

  let updated = 0;
  let missing = [];
  for (const product of products) {
    const handle = HANDLE_ALIASES[product.slug] || product.slug;
    const entry = map.products[handle];
    if (!entry) {
      missing.push(product.slug);
      continue;
    }

    const raw = entry.rawVariants || [];
    if (product.sizeOptions?.length && raw.length) {
      for (const opt of product.sizeOptions) {
        const want = normalizeLabel(opt.label);
        const match =
          raw.find((v) => normalizeLabel(v.option1) === want) ||
          raw.find((v) => normalizeLabel(v.title).includes(want)) ||
          raw.find((v) => want.includes(normalizeLabel(v.option1)));
        if (match) {
          opt.shopifyVariantId = `gid://shopify/ProductVariant/${match.id}`;
        }
      }
      const first =
        product.sizeOptions.find((o) => o.shopifyVariantId)?.shopifyVariantId ||
        (raw[0] ? `gid://shopify/ProductVariant/${raw[0].id}` : undefined);
      if (first) {
        product.shopifyVariantId = first;
        updated++;
      }
    } else if (raw[0]) {
      product.shopifyVariantId = `gid://shopify/ProductVariant/${raw[0].id}`;
      updated++;
    }

    product.shopifyProductId = `gid://shopify/Product/${entry.id}`;
  }

  const generatedAt = new Date().toISOString();
  const content = `// Auto-generated — variant ids from public ${PUBLIC_HOST}/products.json
// Re-run: npm run catalog:sync-variant-ids

import type { Collection, Product } from "./data";

export const catalogGeneratedAt = ${JSON.stringify(generatedAt)} as const;

export const collections: Collection[] = ${JSON.stringify(collections, null, 2)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;
  fs.writeFileSync(GENERATED, content, "utf8");
  console.log(`Updated ${updated} Artzens products with Shopify variant ids.`);
  if (missing.length) {
    console.log(
      `${missing.length} Artzens slugs not found on Shopify (handles may differ), e.g.:`,
      missing.slice(0, 8).join(", ")
    );
  }
  console.log("Restart npm run dev, then test Proceed to checkout → store.artzens.com/cart/...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
