import type { Collection, Product } from "@/lib/data";

export type CatalogPayload = {
  collections: Collection[];
  products: Product[];
};

export function parseCatalogJsonPayload(data: unknown): CatalogPayload {
  if (!data || typeof data !== "object") {
    throw new Error("Catalog response is not an object.");
  }
  const o = data as Record<string, unknown>;
  const collections = o.collections;
  const products = o.products;
  if (!Array.isArray(collections) || !Array.isArray(products)) {
    throw new Error("Catalog must include collections[] and products[] arrays.");
  }
  return {
    collections: collections as Collection[],
    products: products as Product[],
  };
}
