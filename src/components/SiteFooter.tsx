import { getServerNavCategoryLinks } from "@/lib/catalog-server";
import { Footer } from "@/components/Footer";

export async function SiteFooter() {
  const categoryLinks = await getServerNavCategoryLinks();
  return <Footer categoryLinks={categoryLinks} />;
}
