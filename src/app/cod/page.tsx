import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";
import { FaqSection } from "@/components/FaqSection";
import { codFaqItems, faqPageJsonLd } from "@/lib/faq-content";

const origin = getSiteOrigin();
const description = `Pay when you receive. ${SITE_BRAND} offers Cash on Delivery across Pakistan. No advance payment required.`;
const pageUrl = `${origin}/cod`;
const ogImage = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Cash on Delivery",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Cash on Delivery | ${SITE_BRAND}`,
    description,
    url: pageUrl,
    images: [{ url: ogImage, alt: `Cash on Delivery across Pakistan at ${SITE_BRAND}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Cash on Delivery | ${SITE_BRAND}`,
    description,
    images: [ogImage],
  },
};

export default function CODPage() {
  const faqLd = faqPageJsonLd(codFaqItems);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">
        Cash on Delivery
      </h1>
      <p className="mt-4 text-lg text-forest/80">
        We offer Cash on Delivery (COD) across Pakistan. Place your order, and
        pay when your package arrives.
      </p>
      <div className="mt-8 space-y-6 text-forest/80">
        <div>
          <h2 className="font-serif text-xl font-semibold text-forest">
            How it works
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Add items to your cart and proceed to checkout.</li>
            <li>Enter your name, phone number, and delivery address.</li>
            <li>We will confirm your order and ship it.</li>
            <li>Pay the delivery person in cash when you receive your order.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-forest">
            Delivery areas
          </h2>
          <p className="mt-2">
            We deliver to all major cities in Pakistan. Delivery times may vary
            by location. You will receive an update once your order is shipped.
          </p>
        </div>
      </div>

      <FaqSection
        className="mt-12 border-t border-[var(--nav-border)] pt-10"
        headingId="cod-faq-heading"
        items={codFaqItems}
        subtitle="Everything you need to know about paying on delivery."
        variant="inline"
      />
    </div>
  );
}
