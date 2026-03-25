#!/usr/bin/env node
/**
 * One-time script: fetch all products from deckure.com WooCommerce Store API,
 * download images to public/images/products/, and write src/lib/data.generated.ts.
 * Run from project root: node scripts/import-deckure-products.mjs
 * Requires Node 18+ (native fetch).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const API_BASE = "https://deckure.com/wp-json/wc/store/v1";
const PRODUCTS_DIR = path.join(PROJECT_ROOT, "public", "images", "products");
const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg";

function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  let text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  text = text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
  return text;
}

function truncate(str, maxLen = 2000) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

function safeSlug(slug) {
  return String(slug).replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "product";
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const url = `${API_BASE}/products?per_page=${perPage}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < perPage) break;
    page++;
  }
  return all;
}

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buf);
  return true;
}

function getExtension(url) {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const ext = path.extname(pathname).toLowerCase();
    if ([".webp", ".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return ext.slice(1);
  } catch {
    /* invalid URL */
  }
  return "webp";
}

async function main() {
  console.log("Fetching products from deckure.com Store API...");
  const apiProducts = await fetchAllProducts();
  console.log(`Fetched ${apiProducts.length} products.`);

  const collectionMap = new Map();
  const seenSlugs = new Set();
  const productIdToSlug = new Map();

  for (const p of apiProducts) {
    const cat = (p.categories || []).find((c) => c.slug && c.slug !== "all-products");
    const collectionSlug = cat ? cat.slug : "all-products";
    const collectionName = cat ? cat.name : "All Products";
    if (!collectionMap.has(collectionSlug)) {
      collectionMap.set(collectionSlug, { slug: collectionSlug, name: collectionName, productIds: [] });
    }
    let slug = p.slug || `product-${p.id}`;
    if (seenSlugs.has(slug)) slug = `${slug}-${p.id}`;
    seenSlugs.add(slug);
    productIdToSlug.set(String(p.id), slug);
    collectionMap.get(collectionSlug).productIds.push(slug);
  }

  const collections = Array.from(collectionMap.values()).map((c) => ({
    slug: c.slug,
    name: c.name,
    description: "",
    productIds: c.productIds,
  }));

  const products = [];
  for (const p of apiProducts) {
    const slug = productIdToSlug.get(String(p.id)) || p.slug || `product-${p.id}`;
    const cat = (p.categories || []).find((c) => c.slug && c.slug !== "all-products");
    const collectionSlug = cat ? cat.slug : "all-products";

    const price = parseInt(p.prices?.price ?? "0", 10) || 0;
    const regularPrice = parseInt(p.prices?.regular_price ?? "0", 10) || 0;
    const onSale = p.on_sale && regularPrice > price;
    const originalPrice = onSale ? regularPrice : undefined;

    const shortDesc = stripHtml(p.short_description || "").slice(0, 500);
    const longDesc = truncate(stripHtml(p.description || ""), 2000);

    let imagePath = PLACEHOLDER_IMAGE;
    const images = (p.images || []);
    const mainImageUrl = images[0]?.src;
    if (mainImageUrl) {
      const ext = getExtension(mainImageUrl);
      const baseName = `${safeSlug(slug)}.${ext}`;
      const filepath = path.join(PRODUCTS_DIR, baseName);
      const ok = await downloadImage(mainImageUrl, filepath);
      if (ok) imagePath = `/images/products/${baseName}`;
    }

    const galleryPaths = [];
    for (let i = 1; i < images.length && galleryPaths.length < 5; i++) {
      const src = images[i]?.src;
      if (!src) continue;
      const ext = getExtension(src);
      const baseName = `${safeSlug(slug)}-${i}.${ext}`;
      const filepath = path.join(PRODUCTS_DIR, baseName);
      const ok = await downloadImage(src, filepath);
      if (ok) galleryPaths.push(`/images/products/${baseName}`);
    }

    const materialMatch = (p.short_description || "").match(/Material\s*:\s*([^<\n]+)/i);
    const dimensionsMatch = (p.short_description || "").match(/Size\s*:\s*([^<\n]+)/i);
    const material = materialMatch ? stripHtml(materialMatch[1]).trim().slice(0, 100) : undefined;
    const dimensions = dimensionsMatch ? stripHtml(dimensionsMatch[1]).trim().slice(0, 80) : undefined;

    products.push({
      id: slug,
      slug,
      name: (p.name || "").trim() || "Unnamed Product",
      description: shortDesc || "Premium quality. Cash on Delivery across Pakistan.",
      longDescription: longDesc || shortDesc || "Premium quality. Cash on Delivery across Pakistan.",
      price,
      ...(originalPrice != null && { originalPrice }),
      image: imagePath,
      ...(galleryPaths.length > 0 && { images: galleryPaths }),
      collectionSlug,
      ...(material && { material }),
      ...(dimensions && { dimensions }),
    });
  }

  const outPath = path.join(PROJECT_ROOT, "src", "lib", "data.generated.ts");
  const content = `// Auto-generated by scripts/import-deckure-products.mjs – do not edit by hand.

import type { Collection, Product } from "./data";

export const collections: Collection[] = ${JSON.stringify(collections, null, 2)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Collections: ${collections.length}, Products: ${products.length}`);

  if (process.env.WRITE_CATALOG_JSON === "true") {
    const catalogPath = path.join(PROJECT_ROOT, "content", "catalog.json");
    fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
    fs.writeFileSync(
      catalogPath,
      `${JSON.stringify({ collections, products }, null, 2)}\n`,
      "utf8"
    );
    console.log(`Wrote ${catalogPath} (WRITE_CATALOG_JSON=true)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
