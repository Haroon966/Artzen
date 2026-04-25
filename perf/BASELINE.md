# Mobile performance baseline (Lighthouse)

Environment: static export served locally (`npx serve out`), Lighthouse 11.6.0, mobile emulation, performance category only.

These numbers reflect **local cold-run conditions** (no CDN, single CPU); use them to compare **before/after** on the same machine, not as production absolutes.

Raw JSON artifacts: `perf/lighthouse-mobile-home.json`, `perf/lighthouse-mobile-shop.json`, `perf/lighthouse-mobile-pdp-bear.json` (regenerate via `npm run perf:lighthouse`).

| Page | Perf score | LCP | TBT | CLS | Speed Index |
|------|------------|-----|-----|-----|-------------|
| Home (/) | 54 | 3.6 s | 5,250 ms | 0 | 6.8 s |
| Shop (/shop/) | 49 | 7.0 s | 1,810 ms | 0 | 2.1 s |
| PDP (/products/bear/) | 85 | 3.9 s | 180 ms | 0 | 1.1 s |

## LCP element (largest paint)

### Home (/)
- (no node detail in this run)

### Shop (/shop/)
- (no node detail in this run)

### PDP (/products/bear/)
- (no node detail in this run)

## Long main-thread tasks (top entries)

### Home (/)
- 5.00s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.28s — http://127.0.0.1:4177/
- 0.23s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.16s — http://127.0.0.1:4177/_next/static/chunks/ba7b3a81ad2ae36f.js
- 0.12s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.11s — http://127.0.0.1:4177/_next/static/chunks/d1e380e53588e373.js

### Shop (/shop/)
- 0.74s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.65s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.35s — http://127.0.0.1:4177/shop/
- 0.20s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.15s — http://127.0.0.1:4177/shop/
- 0.09s — Unattributable

### PDP (/products/bear/)
- 0.23s — http://127.0.0.1:4177/products/bear/
- 0.22s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.08s — Unattributable
- 0.08s — Unattributable
- 0.07s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js
- 0.07s — http://127.0.0.1:4177/_next/static/chunks/69be39811437728d.js

---

**CI thresholds:** see [perf/BUDGETS.md](./BUDGETS.md) and run `npm run perf:check` after `npm run perf:lighthouse`.
