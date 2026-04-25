# Performance budgets

Targets are for **mobile Lighthouse** runs against a **local static export** (`npm run perf:lighthouse`), same as [BASELINE.md](./BASELINE.md). They are **regression guardrails**, not production SLAs.

## Long-term goals (manual)

| Route   | Perf score | TBT (directional) | Notes                          |
|---------|------------|-------------------|--------------------------------|
| Home    | ≥ 75       | −40% vs baseline  | Reduce main-thread JS / LCP    |
| Shop    | ≥ 75       | −40% vs baseline  | Pagination + lighter payload   |
| PDP     | ≥ 80       | Keep low          | Already strongest in baseline  |

## CI gates (automated)

Thresholds live in [`budgets.json`](./budgets.json). The check script reads the JSON reports in this folder (produced by `npm run perf:lighthouse`).

- **Performance score** — `categories.performance.score` (0–1); CI uses a floor slightly below recent baseline so small noise does not fail builds.
- **LCP** — `largest-contentful-paint` numeric value (ms).
- **TBT** — `total-blocking-time` numeric value (ms).
- **CLS** — `cumulative-layout-shift` numeric value.

Run locally:

```bash
npm run perf:lighthouse   # build + serve + write perf/*.json + BASELINE.md
npm run perf:check        # budgets only (expects JSON already present)
```

Or one shot:

```bash
npm run perf:ci
```

## Static assets

`npm run perf:assets` enforces:

- Favicon / app icon PNG size caps (see `budgets.json` → `assets`).
- Product images under `public/images/` — max file size and width (metadata via `sharp`).

After adding large raster sources, run `npm run images:optimize` and `npm run images:icons` before committing.

## CDN / caching

Repeat visits depend on host `Cache-Control` (see `netlify.toml`, `vercel.json`, `public/_headers`). Local Lighthouse does not simulate CDN; compare before/after on the same machine for JS/image changes.
