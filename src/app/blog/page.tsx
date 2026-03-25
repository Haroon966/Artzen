import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
} from "@/lib/site";
import { clipMetaDescription } from "@/lib/seo";
import { BlogIndex } from "./BlogIndex";

const origin = getSiteOrigin();
const blogDesc = clipMetaDescription(
  "Guides from Artzen — wall art care, home ideas, and shopping with Cash on Delivery in Pakistan.",
);
const blogOg = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Blog",
  description: blogDesc,
  alternates: { canonical: `${origin}/blog` },
  openGraph: {
    title: "Blog",
    description: blogDesc,
    url: `${origin}/blog`,
    images: [{ url: blogOg, alt: "Artzen blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: blogDesc,
    images: [blogOg],
  },
};

export default function BlogPage() {
  return <BlogIndex />;
}
