import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";

const origin = getSiteOrigin();
const pageUrl = `${origin}/privacy-policy`;
const description = `How ${SITE_BRAND} handles customer data for orders and support.`;
const ogImage = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Privacy Policy | ${SITE_BRAND}`,
    description,
    url: pageUrl,
    images: [{ url: ogImage, alt: `${SITE_BRAND} privacy policy` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${SITE_BRAND}`,
    description,
    images: [ogImage],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">Privacy Policy</h1>
      <p className="mt-4 text-forest/80">
        We only collect information needed to process orders, provide support, and improve shopping
        experience.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-forest/80">
        <li>Order data is used for delivery, verification, and customer communication.</li>
        <li>We do not sell customer personal data.</li>
        <li>WhatsApp and courier communications are used only for order service and updates.</li>
        <li>You can request deletion of local order-history data stored on your device browser.</li>
      </ul>
    </div>
  );
}
