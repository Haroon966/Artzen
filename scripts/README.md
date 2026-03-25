# Scripts

## import-deckure-products.mjs

One-time (or periodic) script to import all products and images from the live [deckure.com](https://deckure.com/) WooCommerce store into this Next.js site.

**What it does:**

- Fetches all products from the public Store API: `https://deckure.com/wp-json/wc/store/v1/products`
- Builds collections from product categories (excluding "All Products")
- Strips HTML from descriptions and maps prices (including sale/original price)
- Downloads each product’s main image to `public/images/products/` (filename from product slug)
- Writes `src/lib/data.generated.ts` with `collections` and `products` arrays

**Requirements:** Node 18+ (uses native `fetch`).

**Run from project root:**

```bash
node scripts/import-deckure-products.mjs
```

After running, commit the updated `src/lib/data.generated.ts` and any new files in `public/images/products/`. To refresh data when the live store changes, run the script again.

**Optional — bootstrap Decap / `content/catalog.json`:**

```bash
WRITE_CATALOG_JSON=true node scripts/import-deckure-products.mjs
```

Writes `content/catalog.json` alongside `data.generated.ts` so you can switch to the Git-based admin flow (see [ADMIN.md](../ADMIN.md)).

## catalog-to-generated.mjs

Reads `content/catalog.json` and writes `src/lib/data.generated.ts`. Runs only when **`USE_CONTENT_CATALOG=true`** (intended for Netlify/CI when using Decap CMS).

```bash
USE_CONTENT_CATALOG=true node scripts/catalog-to-generated.mjs
```

Copy `content/catalog.example.json` → `content/catalog.json` before the first run. Build command example:

```bash
USE_CONTENT_CATALOG=true node scripts/catalog-to-generated.mjs && npm run build
```

## validate-catalog.mjs

Validates `content/catalog.json` against `content/catalog.schema.json` and checks that every `collection.productIds` entry exists and every `product.collectionSlug` matches a collection.

```bash
npm run catalog:validate
```

## optimize-images.mjs

Re-encodes raster files under `public/images/products/` in place. See [public/images/README.md](../public/images/README.md).

```bash
npm run images:optimize
```
