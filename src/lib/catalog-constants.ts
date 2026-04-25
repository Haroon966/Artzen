/** Homepage grid order: Wall Art hero tile first, then remaining categories. */
export const HOMEPAGE_COLLECTION_SLUGS = [
  "wall-decoration",
  "islamic-calligraphy",
  "premium-islamic-art-collection",
  "vintage-logo",
] as const;

export const collectionTaglines: Record<string, string> = {
  "islamic-calligraphy": "Ayat, duas & sacred names — crafted for your walls.",
  "premium-islamic-art-collection": "Kaaba, kiswa & statement pieces.",
  "wall-decoration": "Maps, nature & sculptural MDF accents.",
  "vintage-logo": "Classic marks & timeless brand-style art.",
};

/** Marketplace labels for nav/grid (collection `name` stays for SEO on collection pages). */
export const collectionDisplayNames: Record<string, string> = {
  "wall-decoration": "Wall Art",
  "islamic-calligraphy": "Islamic Calligraphy",
  "premium-islamic-art-collection": "Premium Islamic wall art",
  "vintage-logo": "Vintage & logo decor",
};

export function getCollectionDisplayName(slug: string, fallbackName: string): string {
  return collectionDisplayNames[slug] ?? fallbackName;
}
