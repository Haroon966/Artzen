import type { DragEvent, MouseEvent } from "react";

/**
 * Client-side deterrents for product/catalog imagery (not security against
 * DevTools or screenshots). Scope: PDP gallery, product cards, category grid,
 * cart line images — not logos, hero, or marketing-only assets.
 *
 * Web resolution: with `output: "export"` and `images.unoptimized`, bytes
 * come straight from `public/`. Keep sources bounded via `npm run images:optimize`
 * (see scripts/optimize-images.mjs). Keep the max width in sync below.
 *
 * Layer 3 (signed / expiring URLs): not available with a plain static export
 * unless images are moved to remote storage and loaded via absolute HTTPS URLs
 * with your own signing service or CDN — out of scope for this repo’s host.
 */
export const PRODUCT_WEB_IMAGE_MAX_WIDTH = 1400;

export function preventImageContextMenu(e: MouseEvent) {
  e.preventDefault();
}

export function preventImageDragStart(e: DragEvent) {
  e.preventDefault();
}

/** Spread onto `next/image` for catalog/product photos. */
export const productImageInteractionProps = {
  draggable: false,
  onContextMenu: preventImageContextMenu,
  onDragStart: preventImageDragStart,
} as const;

export const catalogImageProtectClassName = "catalog-image-protect select-none";
