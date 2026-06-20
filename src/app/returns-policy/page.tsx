import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo-metadata";
import { SITE_BRAND } from "@/lib/site";

const description = `Returns and issue-resolution policy for ${SITE_BRAND} orders in Pakistan.`;

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Returns Policy",
  description,
  path: "/returns-policy",
  imageAlt: `${SITE_BRAND} returns policy`,
});

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">Returns Policy</h1>
      <p className="mt-4 text-forest/80">
        If something arrives damaged or incorrect, contact us quickly and we will help resolve it.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-forest/80">
        <li>Report damage or wrong-item issues within 48 hours of delivery.</li>
        <li>Share order reference and product photos on WhatsApp for fast support.</li>
        <li>Approved return/replacement requests are coordinated through courier pickup guidance.</li>
        <li>Custom or personalized items may not be eligible for change-of-mind returns.</li>
      </ul>
    </div>
  );
}
