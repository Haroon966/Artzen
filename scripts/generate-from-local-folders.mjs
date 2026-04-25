#!/usr/bin/env node
/**
 * Builds src/lib/data.generated.ts from public/images/products/* category folders.
 *
 * Two ways to attach multiple images per product:
 *
 * 1) Product folder (recommended for several angles / mockups)
 *    public/images/products/<Category>/<Your Product Name>/*.png
 *    Any direct subfolder of a category whose name is NOT a technical asset folder
 *    (see isTechnicalAssetDir) becomes one product; all images inside (any depth) are
 *    the gallery, ordered by file path.
 *
 * 2) Flat PNG + JPEG folders (legacy)
 *    Files are grouped by normalized filename stem across e.g. PNG/ and * JPEG/ so
 *    "2001 - Bear.png" and "2001 - Bear.jpg" become one product with two images.
 *
 * Rate list PDFs (per category folder, `Rate List *.pdf`) drive price, material, and
 * dimensions when filenames start with a numeric code: `2001 - Bear.jpg`, `1001 - 4 Qul.jpg`.
 * Requires `pdftotext` (poppler-utils). Run: npm run catalog:from-folders
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  extractLeadingSkuFromBasename,
  findRateListPdf,
  parseStandardRateListPdf,
  parseVintageRateListPdf,
} from "./rate-list-pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const PRODUCTS_PUBLIC = path.join(PROJECT_ROOT, "public", "images", "products");
const OUT_PATH = path.join(PROJECT_ROOT, "src", "lib", "data.generated.ts");

/** Top-level dirs under public/images/products → site collection slug + label */
const CATEGORY_DIRS = [
  { dir: "Wall Decoration", slug: "wall-decoration", name: "Wall Decoration", defaultPrice: 2499 },
  {
    dir: "Islamic Calligraphy",
    slug: "islamic-calligraphy",
    name: "Islamic Calligraphy",
    defaultPrice: 1999,
  },
  {
    dir: "Premium Islamic Calligraphy",
    slug: "premium-islamic-art-collection",
    name: "Premium Islamic Art Collection",
    defaultPrice: 3899,
  },
  { dir: "Vintage Typographic", slug: "vintage-logo", name: "Vintage Logo", defaultPrice: 2999 },
];

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/** Category subfolders that hold bulk PNG/JPEG dumps — not separate products. */
const TECHNICAL_DIR_EXACT = new Set(
  [
    "png",
    "jpeg",
    "jpg",
    "webp",
    "svg",
    "mockups",
    "mockup",
    "psd",
    "wall decoration jpeg",
    "islamic calligraphy jpeg",
    "premium islamic calligraphy jpeg",
    "vintage typographic jpeg",
  ].map((s) => s.toLowerCase())
);

function normDirName(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, " ");
}

function isTechnicalAssetDir(name) {
  const n = normDirName(name);
  if (TECHNICAL_DIR_EXACT.has(n)) return true;
  if (n.endsWith(" jpeg")) return true;
  return false;
}

function safeSlug(s) {
  return (
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );
}

function normalizeStem(basename) {
  const noExt = basename.replace(/\.[^.]+$/i, "");
  return noExt.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Keep in sync with src/lib/product-name.ts stripTrailingImageDimensions */
function stripTrailingImageDimensions(s) {
  s = String(s).trim();
  if (!s) return s;
  const sizeRe = /\s*(?:[-–—]\s*)?\d+(?:\.\d+)?\s*[x×X*]\s*\d+(?:\.\d+)?\s*$/;
  let prev = "";
  while (s !== prev && sizeRe.test(s)) {
    prev = s;
    s = s.replace(sizeRe, "").trim();
    s = s.replace(/\s*[-–—]\s*$/u, "").trim();
  }
  return s;
}

function displayNameFromBase(basename) {
  const noExt = basename.replace(/\.[^.]+$/i, "").trim();
  const withoutSku = noExt.replace(/^\s*\d+\s*-\s*/, "").trim();
  const cleaned = stripTrailingImageDimensions(withoutSku);
  return cleaned || stripTrailingImageDimensions(noExt) || withoutSku || noExt;
}

function displayNameFromFolderName(folderName) {
  let s = String(folderName).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return folderName;
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function publicUrl(absPath) {
  const rel = path.relative(path.join(PROJECT_ROOT, "public"), absPath);
  return "/" + rel.split(path.sep).map(encodeURIComponent).join("/");
}

function rankExt(ext) {
  const e = ext.toLowerCase();
  if (e === ".png") return 0;
  if (e === ".webp") return 1;
  if (e === ".jpg" || e === ".jpeg") return 2;
  return 3;
}

function sortImagePaths(paths) {
  return [...paths].sort((a, b) => {
    const ra = rankExt(path.extname(a));
    const rb = rankExt(path.extname(b));
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

function discountRateForPrice(price) {
  if (!Number.isFinite(price) || price <= 0) return 0.15;
  if (price <= 3000) return 0.15;
  if (price <= 7000) return 0.18;
  return 0.2;
}

function withTieredOriginalPrice(product) {
  const price = Number(product.price);
  if (!Number.isFinite(price) || price <= 0) return product;
  const rate = discountRateForPrice(price);
  const originalPrice = Math.max(price + 1, Math.round(price / (1 - rate)));
  return {
    ...product,
    price,
    originalPrice,
  };
}

/** Unique public URLs in stable path order (after sortImagePaths). */
function orderedUniqueUrls(pathsSorted) {
  const seen = new Set();
  const out = [];
  for (const abs of pathsSorted) {
    const u = publicUrl(abs);
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function collectImagesUnderCategoryDir(categoryAbs) {
  const files = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name);
        if (!IMAGE_EXT.has(ext.toLowerCase())) continue;
        if (ent.name === "placeholder.svg") continue;
        files.push(full);
      }
    }
  }
  walk(categoryAbs);
  return files;
}

function allocateSlug(baseSlug, usedSlugs) {
  let unique = baseSlug;
  let n = 2;
  while (usedSlugs.has(unique)) {
    unique = `${baseSlug}-${n}`;
    n++;
  }
  usedSlugs.add(unique);
  return unique;
}

const shortDesc = "Premium quality MDF wall art. Cash on Delivery across Pakistan.";

/**
 * @param {typeof CATEGORY_DIRS[0]} cfg
 * @param {Set<string>} usedSlugs global id/slug registry across categories
 * @param {Map<number, { price: number, material?: string, dimensions?: string, pricingDetail?: string, sizeOptions?: Array<{id:string,label:string,price:number,material?:string}> }>|null} rateMap
 * @param {{ price: number, material: string, dimensions: string, pricingDetail?: string, sizeOptions?: Array<{id:string,label:string,price:number,material?:string}> } | null} vintageFlat
 */
function buildCategoryProducts(cfg, usedSlugs, rateMap, vintageFlat) {
  const categoryAbs = path.join(PRODUCTS_PUBLIC, cfg.dir);
  if (!fs.existsSync(categoryAbs) || !fs.statSync(categoryAbs).isDirectory()) {
    console.warn(`Skip missing category folder: ${cfg.dir}`);
    return [];
  }

  const consumedPaths = new Set();
  const products = [];

  function applyRateFromPdf(product, firstBasename) {
    if (cfg.slug === "vintage-logo" && vintageFlat) {
      product.price = vintageFlat.price;
      product.material = vintageFlat.material;
      product.dimensions = vintageFlat.dimensions;
      if (vintageFlat.pricingDetail) product.pricingDetail = vintageFlat.pricingDetail;
      if (vintageFlat.sizeOptions?.length) product.sizeOptions = vintageFlat.sizeOptions;
      return;
    }
    const sku = extractLeadingSkuFromBasename(firstBasename);
    if (sku == null || !rateMap || !rateMap.has(sku)) return;
    const r = rateMap.get(sku);
    product.price = r.price;
    if (r.material) product.material = r.material;
    if (r.dimensions) product.dimensions = r.dimensions;
    if (r.pricingDetail) product.pricingDetail = r.pricingDetail;
    if (r.sizeOptions?.length) product.sizeOptions = r.sizeOptions;
  }

  let directEntries;
  try {
    directEntries = fs.readdirSync(categoryAbs, { withFileTypes: true });
  } catch {
    return [];
  }

  // 1) One product per immediate subfolder that is not a technical asset directory
  for (const ent of directEntries) {
    if (!ent.isDirectory()) continue;
    if (isTechnicalAssetDir(ent.name)) continue;

    const subAbs = path.join(categoryAbs, ent.name);
    const paths = sortImagePaths(collectImagesUnderCategoryDir(subAbs));
    if (paths.length === 0) continue;

    for (const p of paths) consumedPaths.add(p);

    const urls = orderedUniqueUrls(paths);
    if (urls.length === 0) continue;

    const baseSlug = safeSlug(ent.name);
    const slug = allocateSlug(baseSlug || safeSlug(path.basename(paths[0])), usedSlugs);
    const name = displayNameFromFolderName(ent.name);
    const main = urls[0];

    const p = {
      id: slug,
      slug,
      name,
      description: shortDesc,
      longDescription: shortDesc,
      price: cfg.defaultPrice,
      image: main,
      images: urls,
      collectionSlug: cfg.slug,
    };
    applyRateFromPdf(p, path.basename(paths[0]));
    products.push(p);
  }

  // 2) Legacy: group remaining files by filename stem
  const files = collectImagesUnderCategoryDir(categoryAbs).filter((abs) => !consumedPaths.has(abs));
  const groups = new Map();

  for (const abs of files) {
    const base = path.basename(abs);
    const key = normalizeStem(base);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(abs);
  }

  for (const [, paths] of groups) {
    const sorted = sortImagePaths(paths);
    const urls = orderedUniqueUrls(sorted);
    if (urls.length === 0) continue;

    const firstBase = path.basename(sorted[0]);
    let baseSlug = safeSlug(displayNameFromBase(firstBase));
    if (!baseSlug || baseSlug === "item") baseSlug = safeSlug(normalizeStem(firstBase));

    const slug = allocateSlug(baseSlug, usedSlugs);
    const name = displayNameFromBase(firstBase);
    const main = urls[0];

    const p = {
      id: slug,
      slug,
      name,
      description: shortDesc,
      longDescription: shortDesc,
      price: cfg.defaultPrice,
      image: main,
      images: urls,
      collectionSlug: cfg.slug,
    };
    applyRateFromPdf(p, firstBase);
    products.push(p);
  }

  return products;
}

function main() {
  const folderProducts = [];
  const collections = [];
  const usedSlugs = new Set();

  /** @type {Map<string, Map<number, { price: number, material?: string, dimensions?: string }>>} */
  const rateMapsBySlug = new Map();
  /** @type {Map<string, { price: number, material: string, dimensions: string }>} */
  const vintageBySlug = new Map();

  for (const cfg of CATEGORY_DIRS) {
    const pdf = findRateListPdf(cfg.dir);
    if (cfg.slug === "vintage-logo") {
      vintageBySlug.set(cfg.slug, pdf ? parseVintageRateListPdf(pdf) : null);
      rateMapsBySlug.set(cfg.slug, new Map());
    } else {
      rateMapsBySlug.set(cfg.slug, pdf ? parseStandardRateListPdf(pdf) : new Map());
    }
  }

  for (const cfg of CATEGORY_DIRS) {
    const rateMap = rateMapsBySlug.get(cfg.slug) ?? new Map();
    const vintageFlat = cfg.slug === "vintage-logo" ? vintageBySlug.get(cfg.slug) ?? null : null;
    const prods = buildCategoryProducts(cfg, usedSlugs, rateMap, vintageFlat);
    folderProducts.push(...prods);
    collections.push({
      slug: cfg.slug,
      name: cfg.name,
      description: "",
      productIds: prods.map((p) => p.id),
    });
  }

  /** Homepage / nav order — align with src/lib/catalog-constants.ts HOMEPAGE_COLLECTION_SLUGS where relevant */
  const orderedCollections = [
    collections.find((c) => c.slug === "premium-islamic-art-collection"),
    collections.find((c) => c.slug === "wall-decoration"),
    collections.find((c) => c.slug === "islamic-calligraphy"),
    collections.find((c) => c.slug === "vintage-logo"),
  ].filter(Boolean);

  const products = folderProducts.map(withTieredOriginalPrice);

  const catalogGeneratedAt = new Date().toISOString();

  const content = `// Auto-generated by scripts/generate-from-local-folders.mjs – do not edit by hand.
// Re-run: npm run catalog:from-folders

import type { Collection, Product } from "./data";

export const catalogGeneratedAt = "${catalogGeneratedAt}" as const;

export const collections: Collection[] = ${JSON.stringify(orderedCollections, null, 2)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, content, "utf8");
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`Collections: ${orderedCollections.length}, products: ${products.length}`);
}

main();
