import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
} from "@/lib/site";
import { clipMetaDescription } from "@/lib/seo";
import { Suspense } from "react";
import {
  getServerNavCategoryLinks,
  getServerProducts,
  getServerShopCategoryFilters,
} from "@/lib/catalog-server";
import { ShopShellClient } from "./ShopShellClient";

const shopDescRaw =
  "Browse Artzen — wall art, Islamic calligraphy, gifts, decor, and more. Cash on Delivery across Pakistan.";
const shopDesc = clipMetaDescription(shopDescRaw);
const origin = getSiteOrigin();
const shopOg = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Shop all products",
  description: shopDesc,
  alternates: { canonical: `${origin}/shop` },
  openGraph: {
    title: "Shop all products",
    description: shopDesc,
    url: `${origin}/shop`,
    images: [{ url: shopOg, alt: "Artzen shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop all products",
    description: shopDesc,
    images: [shopOg],
  },
};

export const revalidate = 120;

export default async function ShopPage() {
  const products = await getServerProducts();
  const count = products.length;
  const categoryLinks = await getServerNavCategoryLinks();
  const categoryFilters = await getServerShopCategoryFilters();

  return (
    <div className="min-h-screen bg-cream-deep">
      <Suspense
        fallback={
          <div className="min-h-[50vh] animate-pulse bg-cream-deep px-4 pt-24 sm:px-6" />
        }
      >
        <ShopShellClient
          products={products}
          productCount={count}
          categoryLinks={categoryLinks}
          categoryFilters={categoryFilters}
        />
      </Suspense>
    </div>
  );
}
