import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo-metadata";
import { SITE_BRAND } from "@/lib/site";
import { AboutStory } from "./AboutStory";

const description = `${SITE_BRAND} is Pakistan's online store for home, gifts, wall art, and more. Our story and how we ship with COD.`;

export const metadata: Metadata = buildStaticPageMetadata({
  title: "About Us",
  description,
  path: "/about",
  imageAlt: `About ${SITE_BRAND}`,
});

export default function AboutPage() {
  return <AboutStory />;
}
