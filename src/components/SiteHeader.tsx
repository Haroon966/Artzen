import { getServerNavCategoryLinks } from "@/lib/catalog-server";
import { Header } from "@/components/Header";

export async function SiteHeader() {
  const categoryLinks = await getServerNavCategoryLinks();
  return <Header categoryLinks={categoryLinks} />;
}
