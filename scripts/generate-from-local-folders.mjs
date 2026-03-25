#!/usr/bin/env node
/**
 * Builds src/lib/data.generated.ts from public/images/products/* category folders.
 * Pairs PNG + JPEG/mockup shots by normalized filename stem (handles spacing variants).
 * Preserves Customize Keychain products (no category folder).
 *
 * Run: node scripts/generate-from-local-folders.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

/** Keychain — not generated from folders */
const KEYCHAIN_COLLECTION = {
  slug: "customize-keychain",
  name: "Customize KeyChain",
  description: "",
  productIds: ["personalized-name-keychain", "customized-keychains", "customized-keychains-in-pakistan"],
};

const KEYCHAIN_PRODUCTS = [
  {
    id: "personalized-name-keychain",
    slug: "personalized-name-keychain",
    name: "Personalized Name Keychain",
    description: "Size : 3*1",
    longDescription:
      "The Charm of Personalized Accessories Keychains sirf chabiyan sambhalne ka zariya nahi hain, balkay ye aapki personality ki akasi karti hain. Hamari Customized Keychains in Pakistan ki nayi collection un logo ke liye hai jo apni rozmarra ki cheezon mein ek personal touch chahte hain. Chahe aap apne liye ek stylish accessory dhoond rahe hon ya kisi pyare ko ek munfarid tohfa dena chahte hon, hamari category mein aapko har tarah ke designs milenge. Why Customized Keychains are the Perfect Gift? Jab baat gifting ki aati hai, to log aksar confuse ho jate hain. Ek Personalized Name Keychain ek aisa gift hai jo chota hone ke bawajood boht bari ehmiyat rakhta hai. Ye batata hai ke aapne gift lene mein waqt aur tawajjo lagayi hai. Hamari collection mein aap apne doston, family, aur colleagues ke liye unke naam, pasandida quotes, ya khaas tareekhon (dates) ke sath keychains tayyar karwa sakte hain. Explore Our Diverse Range of Designs Humne is category ko har tabqay ki pasand ko madd-e-nazar rakhte hue design kiya hai: Personalized Name Keychains: Hamari sabse zyada bikne wali product. Hum premium acrylic aur metal ka istemal karte hain taake aapka naam khubsoorat fonts mein chamakta nazar aaye. Islamic Calligraphy Keychains: In mein \"Hasbunallahu wa ni'mal wakeel \" ya \"SubhanAllah\" jaise azkaar nihayat nafees calligraphy mein banaye gaye hain. Ye aapko hamesha Allah ki yaad dilate rehte hain. Photo & Memory Keychains: Apni pasandida tasveer ko hamesha apne sath rakhein. Ye keychains couples aur parents ke liye behtareen hain. Corporate & Logo Keychains: Agar aapka koi business hai, to hum aapke brand logo ke sath bulk mein keychains tayyar kar sakte hain jo marketing ke liye behtareen tool hain. Premium Quality & Durability at Unbeatable Prices Pakistan mein aksar sasti products ki quality achi nahi hoti, lekin humne is purane tasawwur ko khatam kar diya hai. Hamari Acrylic Name Keychains scratch-resistant hain aur inka rang kabhi pheeka nahi parta. Sirf Rs. 200 ki shuru...",
    price: 200,
    image: "/images/products/personalized-name-keychain.webp",
    collectionSlug: "customize-keychain",
    dimensions: "3*1",
  },
  {
    id: "customized-keychains",
    slug: "customized-keychains",
    name: "Customized Keychain",
    description: "Size : 3*1",
    longDescription:
      "The Charm of Personalized Accessories Keychains sirf chabiyan sambhalne ka zariya nahi hain, balkay ye aapki personality ki akasi karti hain. Hamari Customized Keychains in Pakistan ki nayi collection un logo ke liye hai jo apni rozmarra ki cheezon mein ek personal touch chahte hain. Chahe aap apne liye ek stylish accessory dhoond rahe hon ya kisi pyare ko ek munfarid tohfa dena chahte hon, hamari category mein aapko har tarah ke designs milenge. Why Customized Keychains are the Perfect Gift? Jab baat gifting ki aati hai, to log aksar confuse ho jate hain. Ek Personalized Name Keychain ek aisa gift hai jo chota hone ke bawajood boht bari ehmiyat rakhta hai. Ye batata hai ke aapne gift lene mein waqt aur tawajjo lagayi hai. Hamari collection mein aap apne doston, family, aur colleagues ke liye unke naam, pasandida quotes, ya khaas tareekhon (dates) ke sath keychains tayyar karwa sakte hain. Explore Our Diverse Range of Designs Humne is category ko har tabqay ki pasand ko madd-e-nazar rakhte hue design kiya hai: Personalized Name Keychains: Hamari sabse zyada bikne wali product. Hum premium acrylic aur metal ka istemal karte hain taake aapka naam khubsoorat fonts mein chamakta nazar aaye. Islamic Calligraphy Keychains: In mein \"Hasbunallahu wa ni'mal wakeel \" ya \"SubhanAllah\" jaise azkaar nihayat nafees calligraphy mein banaye gaye hain. Ye aapko hamesha Allah ki yaad dilate rehte hain. Photo & Memory Keychains: Apni pasandida tasveer ko hamesha apne sath rakhein. Ye keychains couples aur parents ke liye behtareen hain. Corporate & Logo Keychains: Agar aapka koi business hai, to hum aapke brand logo ke sath bulk mein keychains tayyar kar sakte hain jo marketing ke liye behtareen tool hain. Premium Quality & Durability at Unbeatable Prices Pakistan mein aksar sasti products ki quality achi nahi hoti, lekin humne is purane tasawwur ko khatam kar diya hai. Hamari Acrylic Name Keychains scratch-resistant hain aur inka rang kabhi pheeka nahi parta. Sirf Rs. 200 ki shuru...",
    price: 200,
    image: "/images/products/customized-keychains.webp",
    collectionSlug: "customize-keychain",
    dimensions: "3*1",
  },
  {
    id: "customized-keychains-in-pakistan",
    slug: "customized-keychains-in-pakistan",
    name: "Customized Keychain",
    description: "Size : 3*1",
    longDescription:
      "The Charm of Personalized Accessories Keychains sirf chabiyan sambhalne ka zariya nahi hain, balkay ye aapki personality ki akasi karti hain. Hamari Customized Keychains in Pakistan ki nayi collection un logo ke liye hai jo apni rozmarra ki cheezon mein ek personal touch chahte hain. Chahe aap apne liye ek stylish accessory dhoond rahe hon ya kisi pyare ko ek munfarid tohfa dena chahte hon, hamari category mein aapko har tarah ke designs milenge. Why Customized Keychains are the Perfect Gift? Jab baat gifting ki aati hai, to log aksar confuse ho jate hain. Ek Personalized Name Keychain ek aisa gift hai jo chota hone ke bawajood boht bari ehmiyat rakhta hai. Ye batata hai ke aapne gift lene mein waqt aur tawajjo lagayi hai. Hamari collection mein aap apne doston, family, aur colleagues ke liye unke naam, pasandida quotes, ya khaas tareekhon (dates) ke sath keychains tayyar karwa sakte hain. Explore Our Diverse Range of Designs Humne is category ko har tabqay ki pasand ko madd-e-nazar rakhte hue design kiya hai: Personalized Name Keychains: Hamari sabse zyada bikne wali product. Hum premium acrylic aur metal ka istemal karte hain taake aapka naam khubsoorat fonts mein chamakta nazar aaye. Islamic Calligraphy Keychains: In mein \"Hasbunallahu wa ni'mal wakeel \" ya \"SubhanAllah\" jaise azkaar nihayat nafees calligraphy mein banaye gaye hain. Ye aapko hamesha Allah ki yaad dilate rehte hain. Photo & Memory Keychains: Apni pasandida tasveer ko hamesha apne sath rakhein. Ye keychains couples aur parents ke liye behtareen hain. Corporate & Logo Keychains: Agar aapka koi business hai, to hum aapke brand logo ke sath bulk mein keychains tayyar kar sakte hain jo marketing ke liye behtareen tool hain. Premium Quality & Durability at Unbeatable Prices Pakistan mein aksar sasti products ki quality achi nahi hoti, lekin humne is purane tasawwur ko khatam kar diya hai. Hamari Acrylic Name Keychains scratch-resistant hain aur inka rang kabhi pheeka nahi parta. Sirf Rs. 200 ki shuru...",
    price: 200,
    image: "/images/products/customized-keychains-in-pakistan.webp",
    collectionSlug: "customize-keychain",
    dimensions: "3*1",
  },
];

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

/**
 * @param {typeof CATEGORY_DIRS[0]} cfg
 * @param {Set<string>} usedSlugs global id/slug registry (keychain + all categories)
 */
function buildCategoryProducts(cfg, usedSlugs) {
  const categoryAbs = path.join(PRODUCTS_PUBLIC, cfg.dir);
  if (!fs.existsSync(categoryAbs) || !fs.statSync(categoryAbs).isDirectory()) {
    console.warn(`Skip missing category folder: ${cfg.dir}`);
    return [];
  }

  const files = collectImagesUnderCategoryDir(categoryAbs);
  const groups = new Map();

  for (const abs of files) {
    const base = path.basename(abs);
    const key = normalizeStem(base);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(abs);
  }

  const products = [];

  for (const [, paths] of groups) {
    paths.sort((a, b) => {
      const ra = rankExt(path.extname(a));
      const rb = rankExt(path.extname(b));
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b);
    });

    const firstBase = path.basename(paths[0]);
    let slug = safeSlug(displayNameFromBase(firstBase));
    if (!slug || slug === "item") slug = safeSlug(normalizeStem(firstBase));

    let unique = slug;
    let n = 2;
    while (usedSlugs.has(unique)) {
      unique = `${slug}-${n}`;
      n++;
    }
    usedSlugs.add(unique);

    const name = displayNameFromBase(firstBase);
    const urls = [...new Set(paths.map(publicUrl))];
    const main = urls[0];
    const gallery = urls.length > 1 ? urls : undefined;

    const shortDesc = "Premium quality MDF wall art. Cash on Delivery across Pakistan.";
    products.push({
      id: unique,
      slug: unique,
      name,
      description: shortDesc,
      longDescription: shortDesc,
      price: cfg.defaultPrice,
      image: main,
      ...(gallery && { images: gallery }),
      collectionSlug: cfg.slug,
    });
  }

  return products;
}

function main() {
  const folderProducts = [];
  const collections = [KEYCHAIN_COLLECTION];
  const usedSlugs = new Set(KEYCHAIN_PRODUCTS.map((p) => p.id));

  for (const cfg of CATEGORY_DIRS) {
    const prods = buildCategoryProducts(cfg, usedSlugs);
    folderProducts.push(...prods);
    collections.push({
      slug: cfg.slug,
      name: cfg.name,
      description: "",
      productIds: prods.map((p) => p.id),
    });
  }

  /** Homepage order: keychain first in nav is optional; match data.ts HOMEPAGE_COLLECTION_SLUGS */
  const orderedCollections = [
    collections.find((c) => c.slug === "customize-keychain"),
    collections.find((c) => c.slug === "premium-islamic-art-collection"),
    collections.find((c) => c.slug === "wall-decoration"),
    collections.find((c) => c.slug === "islamic-calligraphy"),
    collections.find((c) => c.slug === "vintage-logo"),
  ].filter(Boolean);

  const products = [...KEYCHAIN_PRODUCTS, ...folderProducts];

  const content = `// Auto-generated by scripts/generate-from-local-folders.mjs – do not edit by hand.
// Re-run: npm run catalog:from-folders

import type { Collection, Product } from "./data";

export const collections: Collection[] = ${JSON.stringify(orderedCollections, null, 2)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, content, "utf8");
  console.log(`Wrote ${OUT_PATH}`);
  console.log(
    `Collections: ${orderedCollections.length}, products: ${products.length} (keychain: ${KEYCHAIN_PRODUCTS.length}, from folders: ${folderProducts.length})`
  );
}

main();
