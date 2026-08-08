# Shopify + Artzens (Basic plan checkout redirect)

Artzens (`artzens.com`) = your custom Next.js design on Hostinger.  
Shopify ([store.artzens.com](https://store.artzens.com/)) = products, checkout, orders.

Cart stays on Artzens. **Proceed to checkout** redirects to:

`https://store.artzens.com/cart/VARIANT_ID:QTY,...`

Works on **Shopify Basic** — no Headless / Grow plan required.

## How it fits together

```mermaid
flowchart LR
  Artzens[artzens.com] -->|browse add to cart| LocalCart[Local cart]
  LocalCart -->|Proceed to checkout| Store["store.artzens.com/cart/..."]
  Store --> Checkout[Shopify checkout COD]
  Checkout --> Admin[Shopify Admin Orders]
```

## 1. Store setup

1. PKR currency, Pakistan.
2. Password protection **off**.
3. Custom domain: [store.artzens.com](https://store.artzens.com/) (you already have this).
4. Admin API host remains `*.myshopify.com` (e.g. `wx0c1x-mp.myshopify.com`).

## 2. Env (`.env.local` / GitHub Actions)

```bash
NEXT_PUBLIC_SITE_URL=https://artzens.com
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=store.artzens.com

# Scripts only — Admin API
SHOPIFY_STORE_DOMAIN=wx0c1x-mp.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxx
```

Restart `npm run dev` after changing env.

## 3. Admin API app

1. Settings → Apps → Develop apps (or Dev Dashboard).
2. App with `read_products` (+ `write_products` if importing).
3. Install → copy Admin token into `SHOPIFY_ADMIN_TOKEN`.

## 4. Link variant ids (products already on store.artzens.com)

```bash
npm run catalog:sync-variant-ids
```

Or push from repo then apply map:

```bash
npm run catalog:to-shopify
npm run catalog:apply-shopify-map
```

## 5. Payments

Settings → Payments → enable **Cash on Delivery**.

## 6. Test

1. Restart `npm run dev`
2. Add product → cart → **Proceed to checkout**
3. Should open `store.artzens.com/cart/...`
4. Place test COD order → Shopify Admin → Orders

## 7. Hostinger deploy

Bake `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=store.artzens.com` into the build (GitHub secret or local `.env.local` before `npm run build:hostinger-upload`).
