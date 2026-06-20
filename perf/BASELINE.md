# Mobile Lighthouse baseline

Environment: static export served locally (`npx serve out`), Lighthouse 11.x, mobile emulation, performance + SEO categories.

Regenerate: `npm run perf:lighthouse` from the repo root.

| Page | Perf | SEO | LCP | TBT | CLS | Speed Index |
|------|------|-----|-----|-----|-----|-------------|
| Home (/) | 78 | 100 | 4.9 s | 220 ms | 0 | 2.1 s |
| /shop/ | 83 | 100 | 4.0 s | 240 ms | 0 | 2.0 s |
| /products/bear/ | 80 | 100 | 5.0 s | 110 ms | 0 | 2.2 s |

## SEO failures (score < 100)

### Home (/)
- All SEO audits passed.

### /shop/
- All SEO audits passed.

### /products/bear/
- All SEO audits passed.


## LCP element (largest paint)

### Home (/)
- (no node detail in this run)

### /shop/
- (no node detail in this run)

### /products/bear/
- (no node detail in this run)

## Long main-thread tasks (top entries)

### Home (/)
- 0.29s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.29s — http://127.0.0.1:4178/
- 0.13s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.12s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.07s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.06s — Unattributable

### /shop/
- 0.29s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.23s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.21s — http://127.0.0.1:4178/shop/
- 0.11s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.06s — Unattributable
- 0.05s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js

### /products/bear/
- 0.22s — http://127.0.0.1:4178/products/bear/
- 0.20s — http://127.0.0.1:4178/_next/static/chunks/turbopack-d162885c80e6d7cc.js
- 0.09s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.07s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.06s — http://127.0.0.1:4178/_next/static/chunks/69be39811437728d.js
- 0.06s — Unattributable


---

Local runs are useful for **regression comparison**, not as a proxy for production CDN + HTTP/2 + edge caching.

**CI thresholds:** see [perf/BUDGETS.md](BUDGETS.md) and run `npm run perf:check` after `npm run perf:lighthouse`.
