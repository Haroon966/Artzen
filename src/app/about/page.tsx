import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";
import { AboutStory } from "./AboutStory";

const origin = getSiteOrigin();
const description = `${SITE_BRAND} is Pakistan's online store for home, gifts, wall art, and more. Our story and how we ship with COD.`;
const pageUrl = `${origin}/about`;
const ogImage = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "About Us",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `About Us | ${SITE_BRAND}`,
    description,
    url: pageUrl,
    images: [{ url: ogImage, alt: `About ${SITE_BRAND}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_BRAND}`,
    description,
    images: [ogImage],
  },
};

export default function AboutPage() {
  return <AboutStory />;
}
