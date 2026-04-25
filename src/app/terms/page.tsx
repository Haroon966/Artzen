import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";

const origin = getSiteOrigin();
const pageUrl = `${origin}/terms`;
const description = `Terms and conditions for shopping on ${SITE_BRAND}.`;
const ogImage = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Terms & Conditions | ${SITE_BRAND}`,
    description,
    url: pageUrl,
    images: [{ url: ogImage, alt: `${SITE_BRAND} terms and conditions` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms & Conditions | ${SITE_BRAND}`,
    description,
    images: [ogImage],
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-4 text-forest/80">
        By placing an order, you agree to verification, dispatch, and payment terms listed on the
        website.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-forest/80">
        <li>Orders are subject to availability and verification before dispatch.</li>
        <li>Product colors and finish can vary slightly due to photography and screens.</li>
        <li>Delivery timelines are estimates and can vary by city/courier conditions.</li>
        <li>Misuse, fraudulent orders, or abusive behavior may result in cancellation.</li>
      </ul>
    </div>
  );
}
