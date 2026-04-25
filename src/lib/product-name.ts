/**
 * Strip trailing image-dimension tokens copied from filenames (e.g. "Bear 24x13.5" → "Bear").
 * Does not remove product titles that happen to contain "x" in words.
 */
export function stripTrailingImageDimensions(raw: string): string {
  let s = raw.trim();
  if (!s) return s;
  const sizeRe =
    /\s*(?:[-–—]\s*)?\d+(?:\.\d+)?\s*[x×X*]\s*\d+(?:\.\d+)?\s*$/;
  let prev = "";
  while (s !== prev && sizeRe.test(s)) {
    prev = s;
    s = s.replace(sizeRe, "").trim();
    s = s.replace(/\s*[-–—]\s*$/u, "").trim();
  }
  return s;
}

export function productDisplayName(product: { name: string }): string {
  const cleaned = stripTrailingImageDimensions(product.name);
  return cleaned || product.name.trim();
}

/** SEO title helper: appends disambiguators to reduce duplicate PDP titles. */
export function productSeoTitle(product: {
  name: string;
  dimensions?: string;
  collectionSlug?: string;
}): string {
  const base = productDisplayName(product);
  const bits: string[] = [];
  if (product.dimensions?.trim()) bits.push(product.dimensions.trim());
  if (product.collectionSlug?.trim()) {
    bits.push(product.collectionSlug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()));
  }
  return bits.length > 0 ? `${base} - ${bits.join(" | ")}` : base;
}
