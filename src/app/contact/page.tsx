import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo-metadata";
import { SITE_BRAND } from "@/lib/site";

const description = `Get in touch with ${SITE_BRAND} for support and custom requests. Reach us on WhatsApp from anywhere in Pakistan.`;

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Contact",
  description,
  path: "/contact",
  imageAlt: `Contact ${SITE_BRAND}`,
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">
        Contact Us
      </h1>
      <p className="mt-4 text-forest/80">
        We would love to hear from you. For questions or custom requests, reach
        out on WhatsApp or email. To place an order, add items to your cart and
        proceed to checkout.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-forest">
            WhatsApp
          </h2>
          <a
            href="https://wa.me/923315856777"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-medium text-gold hover:underline"
          >
            +92 331 5856777
          </a>
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-forest">
            Location
          </h2>
          <p className="mt-2 text-forest/80">Pakistan</p>
        </div>
      </div>
    </div>
  );
}
