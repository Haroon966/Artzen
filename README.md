# Artzen (artzen.pk)

Premium Islamic wall art, MDF wood calligraphy, and home decor. E-commerce site for Pakistan with PKR and Cash on Delivery. Next.js server mode with optional **Firebase** catalog, orders, and admin.

## Stack

- **Next.js 16** (App Router) — server routes for `/api/*`, Firestore-backed catalog when configured
- **Tailwind CSS** for styling
- Deploy to a **Node** host (Vercel, Cloud Run, VPS, etc.); see **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**

## Admin (products & catalog)

**Firebase:** seed Firestore (`npm run seed:firestore`), set admin claim (`npm run admin:set-claim`), then use **`/admin`** (login, products, orders, Storage uploads). Legacy static workflows (**WooCommerce**, **Decap CMS**, **Supabase** notes) remain in **[ADMIN.md](ADMIN.md)**.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

Use a platform that runs `next start` (or the host’s Next.js integration). Static `out/` export is no longer the default so API routes and Firebase Admin can run.

## Orders (how customers shop & how you see orders)

**Customer flow:** Browse → Add to cart (saved in the browser) → Cart → Checkout → enter name, phone, city, address → **Place order**. The cart clears only after a successful submit.

**How you receive orders:** Checkout **POSTs to `/api/orders`** (Firestore when `FIREBASE_SERVICE_ACCOUNT_KEY` is set) and, if configured, **Formspree** for email. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Admin order list: **`/admin/orders`**.

**What each submission includes:** A unique **order reference** (e.g. `AZ-20250318-A1B2`), human-readable line items, a JSON block with `id`, `slug`, quantities, prices, and product URLs for fulfillment, plus delivery fields.

**Setup (required for live orders):**

1. Create a form at [formspree.io](https://formspree.io).
2. In Formspree, turn on **email notifications** to your address.
3. Copy the form ID into `.env.local` (see [`.env.example`](.env.example)):

   ```bash
   NEXT_PUBLIC_FORMSPREE_ID=your_form_id
   ```

4. Set the same variable on your host (Netlify / Vercel / etc.) and **rebuild**. If `NEXT_PUBLIC_FORMSPREE_ID` is missing, checkout cannot submit.

**Optional env vars:** `NEXT_PUBLIC_SITE_URL` (product links in emails), `NEXT_PUBLIC_WHATSAPP_PHONE` (WhatsApp button + “send order copy” link).

After checkout, customers can **send a copy of the order on WhatsApp** as a backup channel.

To use another service instead of Formspree, edit [`src/app/checkout/CheckoutForm.tsx`](src/app/checkout/CheckoutForm.tsx) (submit URL and payload).

## SEO

- **Sitemap:** `/sitemap.xml` (generated at build)
- **Robots:** `/robots.txt` (generated at build)
- **Metadata:** Unique title/description per page; `<meta name="robots" content="index, follow">` and `<meta name="publisher" content="Artzen">` in layout
- **Schema:** Organization (layout), WebSite with publisher (layout), Product + Breadcrumb (product pages)
- **X-Robots-Tag header:** Set by the host, not by the static export. **Vercel:** `vercel.json` sends `X-Robots-Tag: index, follow`. **Netlify:** `netlify.toml` does the same. **Cloudflare Pages:** `public/_headers` is copied to `out/` and applied. For other hosts, configure this header in your CDN or hosting dashboard.

Add your real product images under `public/images/products/` and update `src/lib/data.ts` with the correct paths. Replace `public/images/placeholder.svg` with a real logo if desired; schema references `https://artzen.pk/logo.png` (or set `NEXT_PUBLIC_SITE_URL` to your live origin).

## Project structure

- `src/app/` — Pages (home, collections, products, cart, checkout, about, cod, contact, guide)
- `src/components/` — Header, Footer, ProductCard, CategoryGrid, AddToCartButton, etc.
- `src/context/` — CartContext (client-side cart state)
- `src/lib/data.ts` — Collections and products (edit for your catalog)
