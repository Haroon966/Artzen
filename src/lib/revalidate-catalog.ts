import { revalidateTag } from "next/cache";
import { CATALOG_CACHE_TAG } from "@/lib/catalog-server";

export function revalidateCatalogCache() {
  revalidateTag(CATALOG_CACHE_TAG, "max");
}
