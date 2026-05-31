/** Public catalog JSON endpoint (same host as the shop is fine). Used by client-side live catalog. */
export function getLiveCatalogJsonUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_CATALOG_JSON_URL?.trim();
  return u || undefined;
}

export function isLiveCatalogEnabled(): boolean {
  return Boolean(getLiveCatalogJsonUrl());
}
