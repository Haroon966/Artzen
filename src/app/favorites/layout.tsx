import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo-metadata";
import { SITE_BRAND } from "@/lib/site";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Favorites",
  description: `Your saved products at ${SITE_BRAND} — shop anytime.`,
  path: "/favorites",
  robots: { index: false, follow: true },
});

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
