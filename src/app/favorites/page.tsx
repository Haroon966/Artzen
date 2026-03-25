import { getServerProducts } from "@/lib/catalog-server";
import { FavoritesClient } from "./FavoritesClient";

export const revalidate = 120;

export default async function FavoritesPage() {
  const catalogProducts = await getServerProducts();
  return <FavoritesClient catalogProducts={catalogProducts} />;
}
