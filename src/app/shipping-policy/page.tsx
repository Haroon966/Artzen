import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";

const origin = getSiteOrigin();
const pageUrl = `${origin}/shipping-policy`;
const description = `Shipping timelines, delivery coverage, and Cash on Delivery details for ${SITE_BRAND}.`;
const ogImage = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Shipping Policy",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Shipping Policy | ${SITE_BRAND}`,
    description,
    url: pageUrl,
    images: [{ url: ogImage, alt: `${SITE_BRAND} shipping policy` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Shipping Policy | ${SITE_BRAND}`,
    description,
    images: [ogImage],
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">Shipping Policy</h1>
      <p className="mt-4 text-forest/80">
        We ship nationwide across Pakistan. Orders are confirmed before dispatch and packed with
        care.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-forest/80">
        <li>Dispatch window: usually 1-2 business days after confirmation.</li>
        <li>Delivery window: usually 2-6 business days depending on city.</li>
        <li>Remote areas can take longer based on courier coverage.</li>
        <li>Cash on Delivery is available in most serviceable cities.</li>
      </ul>
    </div>
  );
}
