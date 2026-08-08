#!/usr/bin/env node
/**
 * Merge scripts/.shopify-import-map.json variant ids into src/lib/data.generated.ts
 * so Basic-plan cart permalink checkout works without Storefront/Headless API.
 *
 * Run after: npm run catalog:to-shopify
 * Usage: npm run catalog:apply-shopify-map
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const GENERATED = path.join(PROJECT_ROOT, "src", "lib", "data.generated.ts");
const MAP_PATH = path.join(__dirname, ".shopify-import-map.json");

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

function variantGid(entry) {
  if (!entry) return undefined;
  if (entry.admin_graphql_api_id) return entry.admin_graphql_api_id;
  if (entry.id != null) return `gid://shopify/ProductVariant/${entry.id}`;
  return undefined;
}

function applyMap(products, map) {
  let updated = 0;
  for (const product of products) {
    const entry = map.products?.[product.slug];
    if (!entry?.variants) continue;

    const variantEntries = Object.entries(entry.variants);
    if (variantEntries.length === 0) continue;

    if (product.sizeOptions?.length) {
      for (const opt of product.sizeOptions) {
        const match =
          entry.variants[opt.label] ||
          variantEntries.find(([label]) => label === opt.label)?.[1];
        const gid = variantGid(match);
        if (gid) {
          opt.shopifyVariantId = gid;
        }
      }
      const firstGid =
        product.sizeOptions.find((o) => o.shopifyVariantId)?.shopifyVariantId ||
        variantGid(variantEntries[0][1]);
      if (firstGid) {
        product.shopifyVariantId = firstGid;
        updated++;
      }
    } else {
      const first = variantEntries[0][1];
      const gid = variantGid(first);
      if (gid) {
        product.shopifyVariantId = gid;
        updated++;
      }
    }

    if (entry.admin_graphql_api_id) {
      product.shopifyProductId = entry.admin_graphql_api_id;
    } else if (entry.id != null) {
      product.shopifyProductId = `gid://shopify/Product/${entry.id}`;
    }
  }
  return updated;
}

function main() {
  if (!fs.existsSync(MAP_PATH)) {
    console.error(`Missing ${MAP_PATH}. Run npm run catalog:to-shopify first.`);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  const src = fs.readFileSync(GENERATED, "utf8");
  const collections = extractExportArray(src, "collections");
  const products = extractExportArray(src, "products");
  const updated = applyMap(products, map);

  const generatedAt = new Date().toISOString();
  const content = `// Auto-generated — Shopify variant ids merged by scripts/apply-shopify-import-map.mjs
// Re-run after catalog:to-shopify: npm run catalog:apply-shopify-map

import type { Collection, Product } from "./data";

export const catalogGeneratedAt = ${JSON.stringify(generatedAt)} as const;

export const collections: Collection[] = ${JSON.stringify(collections, null, 2)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

  fs.writeFileSync(GENERATED, content, "utf8");
  console.log(
    `Updated ${updated} products with Shopify variant ids → ${GENERATED}`
  );
}

main();
