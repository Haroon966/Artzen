import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";

const origin = getSiteOrigin();
const description = `Get in touch with ${SITE_BRAND} for orders, support, and custom requests. Reach us on WhatsApp from anywhere in Pakistan.`;
const pageUrl = `${origin}/contact`;
const ogImage = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Contact | ${SITE_BRAND}`,
    description,
    url: pageUrl,
    images: [{ url: ogImage, alt: `Contact ${SITE_BRAND}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact | ${SITE_BRAND}`,
    description,
    images: [ogImage],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">
        Contact Us
      </h1>
      <p className="mt-4 text-forest/80">
        We would love to hear from you. For orders, questions, or custom
        requests, reach out on WhatsApp or email.
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
