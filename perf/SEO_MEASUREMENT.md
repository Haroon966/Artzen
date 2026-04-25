# SEO Measurement Loop

Use this checklist after each SEO phase rollout.

## 1) Validate indexability + canonical tags

Run on production domain:

- `curl -I https://artzens.com/shop/`
- `curl -I https://artzens.com/shop/?sale=1`
- `curl -I https://artzens.com/cart/`
- `curl -I https://artzens.com/checkout/`
- `curl -I https://artzens.com/profile/`
- `curl -I https://artzens.com/favorites/`

Expected:

- indexable routes return `X-Robots-Tag: index, follow`
- utility routes return `X-Robots-Tag: noindex, follow`

Then inspect rendered HTML for canonical/meta robots:

- `/shop/` canonical => `/shop/`
- `/shop/?sale=1` canonical => `/shop?sale=1`
- faceted/search/sort variants contain `noindex,follow`

## 2) Re-run mobile Lighthouse baseline

- `npm run perf:lighthouse`
- Compare `perf/BASELINE.md` and JSON traces in `perf/`.
- Track at least: LCP, INP/TBT proxy, CLS on home, shop, and one PDP.

## 3) Track weekly Search Console metrics

Monitor by page type:

- Home
- Shop
- Collection pages (`/collections/*`)
- Product pages (`/products/*`)

Metrics:

- Impressions
- Clicks
- CTR
- Average position
- Indexed pages quality (exclude utility/noindex pages)

## 4) Regression guardrails

If any of these regress, create a follow-up fix:

- Shop LCP regresses by >10%
- Indexed utility pages increase
- CTR drops on collection/PDP templates after metadata/content edits
