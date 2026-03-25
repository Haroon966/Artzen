# Admin: managing the product catalog (100% free)

This project supports **three complementary approaches**. Pick one as your **source of truth** for the live storefront.

## Chosen default path: WooCommerce + import (Option 1)

**Best fit** for the current codebase: products live in **WordPress/WooCommerce** (e.g. deckure.com). This Next app is a **static mirror** refreshed at build time.

1. Add, edit, or remove products in the **WooCommerce admin** (categories map to collections).
2. From the **deckure** project root, run:

   ```bash
   node scripts/import-deckure-products.mjs
   ```

3. Commit changes to `src/lib/data.generated.ts` and `public/images/products/`, then push. Your host (e.g. Netlify) rebuilds and publishes the new catalog.

**Automation (free):** use the GitHub Action [`.github/workflows/sync-deckure-products.yml`](.github/workflows/sync-deckure-products.yml) (manual or scheduled). After it pushes, trigger a deploy (e.g. Netlify **Build hooks** — create a hook URL in Netlify and call it from a second workflow step, or rely on auto-deploy on push). See comments in the workflow file.

---

## Option 2: Git-based admin (Decap CMS)

Use when you want a **browser UI** that commits JSON to this repo — **no** WooCommerce as catalog source.

1. Copy [`content/catalog.example.json`](content/catalog.example.json) to `content/catalog.json` and fill it (or bootstrap with `WRITE_CATALOG_JSON=true` — see [scripts/README.md](scripts/README.md)).
2. Open **`/admin/`** on your deployed site (or locally) to use [Decap CMS](https://decapcms.org/).
3. Configure the Decap **backend** in [`public/admin/config.yml`](public/admin/config.yml) (`github` or Netlify **Git Gateway** + Identity). Replace placeholder `owner/repo` with your GitHub repository.
4. On Netlify (or CI), set **`USE_CONTENT_CATALOG=true`** and use a build command that runs the catalog compiler before Next:

   ```bash
   node scripts/catalog-to-generated.mjs && npm run build
   ```

   Default `netlify.toml` is unchanged; override the build command in the Netlify UI when you enable this path.

**Images:** Decap is set to upload under `public/images/uploads/`. Reference those paths in `image` / `images` fields (e.g. `/images/uploads/photo.webp`).

---

## Option 3: Supabase (free tier) + Auth.js

Use when you need a **database**, realtime updates without a full static rebuild, or a custom `/admin` app.

This **conflicts** with pure `output: 'export'` for a fully dynamic catalog. You must move to server-capable hosting and usually **remove or narrow** static export. See [`docs/supabase-migration.md`](docs/supabase-migration.md) for schema notes, env vars, and migration steps.

---

## Quick reference

| Path              | Admin UI              | Rebuild required?      |
| ----------------- | --------------------- | ---------------------- |
| Woo + import      | WordPress/WooCommerce | Yes (static site)      |
| Decap + JSON      | Decap at `/admin/`    | Yes (commit → build)   |
| Supabase + Auth.js| Your app + Supabase   | Depends on SSR/ISR setup |

Do **not** enable `USE_CONTENT_CATALOG=true` while still relying on Woo import output unless you intentionally switch sources — one should be canonical per environment.
