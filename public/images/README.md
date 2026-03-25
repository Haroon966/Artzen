# Images

- **Hero carousel** — Place hero images here: `hero-1.webp` (required). Optional: `hero-2.webp`, `hero-3.webp`. Add more entries in `src/app/page.tsx` (`heroImages` array) if you add more files.
- **`products/`** — Product images (PNG, JPG, or WebP). Paths in `content/catalog.json` must match filenames (e.g. `/images/products/yourfile.webp`). `placeholder.svg` is used until you add real images.

## Static export and performance

This site uses Next.js **`output: "export"`** with **`images: { unoptimized: true }`**. There is no server-side image optimizer: whatever you commit under `public/` is sent to the browser as-is.

- Prefer **WebP** (or AVIF if you convert offline) at moderate dimensions (e.g. long edge **≤ 1600px** for PDP galleries).
- After adding or replacing product photos, run:

  ```bash
  npm run images:optimize
  ```

  This re-encodes rasters in `public/images/products/` in place (same names/extensions) to trim file size when possible.

- Hero files here are already WebP; keep each under ~100KB if you replace them.
