import type { Metadata } from "next";
import { getSiteOrigin, SITE_BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Favorites",
  description: `Your saved products at ${SITE_BRAND} — shop anytime.`,
  alternates: { canonical: `${getSiteOrigin()}/favorites` },
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
