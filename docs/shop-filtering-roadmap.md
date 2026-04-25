# Shop Filtering And Sorting Roadmap

## Goal
Move shop filters and sorting from client-only state to URL-driven and then server-backed queries, so results are shareable, crawlable, and faster at scale.

## Step 1: URL-Synced Client Filters
- Mirror `sort`, selected facets, and price bounds into query params (`sort`, `facet`, `from`, `to`).
- Parse query params as initial state in `ShopShellClient` and `ShopGallery`.
- Update URL with `replace` (no full navigation) whenever filter state changes.

## Step 2: Server-Backed Catalog Query
- Add a server query helper in `src/lib/catalog-server.ts` for filter + sort inputs.
- Update `src/app/shop/page.tsx` to read `searchParams`, query products server-side, and pass hydrated results to the client.
- Keep active filters visible and editable in the client UI while using server-returned results.

## Step 3: Performance + SEO Hardening
- Add cache strategy for common filter combinations.
- Add canonical URL rules for query-heavy states to avoid duplicate SEO surfaces.
- Emit analytics dimensions from URL state for consistent attribution across refresh/share/revisit flows.
