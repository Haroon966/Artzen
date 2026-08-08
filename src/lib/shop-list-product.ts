import type { Product } from "@/lib/data";

/**
 * Shop grid + filters only — omits heavy PDP fields (longDescription, sizeOptions, etc.)
 * to shrink the RSC/client payload on `/shop/`.
 */
export type ShopListProduct = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "price"
  | "originalPrice"
  | "image"
  | "images"
  | "cardImage"
  | "hoverImage"
  | "collectionSlug"
  | "isNew"
  | "shopifyVariantId"
>;

export function toShopListProduct(p: Product): ShopListProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    images: p.images,
    cardImage: p.cardImage,
    hoverImage: p.hoverImage,
    collectionSlug: p.collectionSlug,
    isNew: p.isNew,
    shopifyVariantId: p.shopifyVariantId,
  };
}
