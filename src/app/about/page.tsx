import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site";
import { AboutStory } from "./AboutStory";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Artzen is Pakistan's online store for home, gifts, wall art, and more. Our story and how we ship with COD.",
  alternates: { canonical: `${getSiteOrigin()}/about` },
};

export default function AboutPage() {
  return <AboutStory />;
}
