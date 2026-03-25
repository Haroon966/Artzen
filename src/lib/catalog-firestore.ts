import type { Collection, Product } from "@/lib/data";
import { getAdminDb } from "@/lib/firebase/admin";

function productFromFirestore(id: string, data: Record<string, unknown>): Product | null {
  if (typeof data.slug !== "string" || typeof data.name !== "string") return null;
  const price = typeof data.price === "number" ? data.price : Number(data.price);
  if (!Number.isFinite(price)) return null;
  const p: Product = {
    id: typeof data.id === "string" ? data.id : id,
    slug: data.slug,
    name: data.name,
    description: typeof data.description === "string" ? data.description : "",
    longDescription:
      typeof data.longDescription === "string" ? data.longDescription : "",
    price,
    image: typeof data.image === "string" ? data.image : "",
    collectionSlug:
      typeof data.collectionSlug === "string" ? data.collectionSlug : "",
  };
  if (typeof data.originalPrice === "number") p.originalPrice = data.originalPrice;
  if (Array.isArray(data.images)) {
    p.images = data.images.filter((x): x is string => typeof x === "string");
  }
  if (typeof data.cardImage === "string") p.cardImage = data.cardImage;
  if (typeof data.hoverImage === "string") p.hoverImage = data.hoverImage;
  if (typeof data.material === "string") p.material = data.material;
  if (typeof data.dimensions === "string") p.dimensions = data.dimensions;
  if (data.isNew === true) p.isNew = true;
  return p;
}

function collectionFromFirestore(
  docId: string,
  data: Record<string, unknown>
): Collection | null {
  const slug = typeof data.slug === "string" ? data.slug : docId;
  const name = typeof data.name === "string" ? data.name : slug;
  const description = typeof data.description === "string" ? data.description : "";
  const productIds = Array.isArray(data.productIds)
    ? data.productIds.filter((x): x is string => typeof x === "string")
    : [];
  const c: Collection = { slug, name, description, productIds };
  if (typeof data.image === "string") c.image = data.image;
  return c;
}

/**
 * Loads published catalog from Firestore. Returns null if Admin is unavailable or query fails.
 */
export async function fetchPublishedCatalogFromFirestore(): Promise<{
  products: Product[];
  collections: Collection[];
} | null> {
  const db = getAdminDb();
  if (!db) return null;

  try {
    const [colSnap, prodSnap] = await Promise.all([
      db.collection("collections").where("published", "==", true).get(),
      db.collection("products").where("published", "==", true).get(),
    ]);

    const collections: Collection[] = [];
    for (const doc of colSnap.docs) {
      const c = collectionFromFirestore(doc.id, doc.data() as Record<string, unknown>);
      if (c) collections.push(c);
    }

    const products: Product[] = [];
    for (const doc of prodSnap.docs) {
      const p = productFromFirestore(doc.id, doc.data() as Record<string, unknown>);
      if (p) products.push(p);
    }

    return { products, collections };
  } catch {
    return null;
  }
}
