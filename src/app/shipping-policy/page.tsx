import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo-metadata";
import { SITE_BRAND } from "@/lib/site";

const description = `Shipping timelines, delivery coverage, and Cash on Delivery details for ${SITE_BRAND}.`;

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Shipping Policy",
  description,
  path: "/shipping-policy",
  imageAlt: `${SITE_BRAND} shipping policy`,
});

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
