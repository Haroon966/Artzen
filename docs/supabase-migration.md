# Supabase (free tier) + Auth.js — migration notes

Use this path if you need a **database-backed** catalog, authenticated `/admin`, or updates without committing JSON to Git. It is **not** implemented in this repo by default: the storefront uses **static export** (`output: "export"` in [`next.config.ts`](../next.config.ts)), which conflicts with a fully dynamic product API unless you change hosting and build strategy.

## Free-tier building blocks

- [Supabase](https://supabase.com/) — Postgres, optional Row Level Security, Storage for images, Auth (email/OAuth) on the free tier within [published limits](https://supabase.com/pricing).
- [Auth.js](https://authjs.dev/) (NextAuth) — open-source session layer for Next.js; pair with the Supabase adapter or use Supabase Auth only.

Avoid paid-only auth SaaS if you need a $0 stack.

## High-level steps

1. **Create a Supabase project** and note `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public) and the **service role** key for server-only admin scripts (never expose in the browser).

2. **Schema sketch** (adapt to your needs):

   - `collections` table: `slug` (pk), `name`, `description`, `sort_order`
   - `products` table: `id` (uuid or slug), `slug` (unique), `name`, `description`, `long_description`, `price`, `original_price`, `image`, `collection_slug` (fk), `material`, `dimensions`, `is_new`, timestamps
   - `product_images` table (optional): `product_id`, `url`, `sort_order` for galleries

3. **Images**: upload to **Supabase Storage** (public bucket) or keep URLs in `products.image` pointing at existing CDN paths.

4. **Next.js changes**:

   - Remove or narrow **`output: "export"`** so Route Handlers / Server Actions and dynamic `generateStaticParams` / `fetch` with revalidation can run (e.g. deploy to Vercel hobby or Netlify with Next runtime).
   - Replace imports from [`data.generated.ts`](../src/lib/data.generated.ts) with server-side queries (Supabase client in Server Components or a small data-access layer).
   - Protect admin routes with Auth.js (or Supabase session) and restrict inserts/updates to admin users (RLS policies or server-only service role).

5. **SEO**: keep generating metadata from DB fields; use `revalidate` or on-demand revalidation when products change.

## Environment variables (example)

Add to `.env.local` (and your host); **do not** commit secrets.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only
AUTH_SECRET=                  # Auth.js
```

## Relation to other admin options

- **WooCommerce import** and **Decap + `content/catalog.json`** stay valid for static hosting.
- Supabase is appropriate when you accept **serverful** Next.js and ongoing free-tier quota management.
