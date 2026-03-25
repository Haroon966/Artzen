/** Trim and clip meta description for ~SER snippet length. */
export function clipMetaDescription(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

/** Title segment only — root `metadata.title.template` adds ` | Artzen`. */
const COLLECTION_TITLE_BY_SLUG: Record<string, (name: string) => string> = {
  "islamic-calligraphy": (name) =>
    `${name} — Islamic Calligraphy Wall Art (Pakistan)`,
  "premium-islamic-art-collection": (name) =>
    `${name} — Premium Islamic Wall Art`,
  "wall-decoration": (name) => `${name} — MDF & Wall Art`,
  "customize-keychain": (name) => `${name} — Personalized Keychains`,
  "vintage-logo": (name) => `${name} — Vintage Logo Wall Art`,
};

export function collectionSeoTitle(slug: string, collectionName: string): string {
  const fn = COLLECTION_TITLE_BY_SLUG[slug];
  return fn ? fn(collectionName) : collectionName;
}
