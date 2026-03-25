import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site";
import { FaqSection } from "@/components/FaqSection";
import { codFaqItems, faqPageJsonLd } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Cash on Delivery",
  description:
    "Pay when you receive. Artzen offers Cash on Delivery across Pakistan. No advance payment required.",
  alternates: { canonical: `${getSiteOrigin()}/cod` },
};

export default function CODPage() {
  const faqLd = faqPageJsonLd(codFaqItems);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <h1 className="font-serif text-3xl font-bold text-forest">
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
