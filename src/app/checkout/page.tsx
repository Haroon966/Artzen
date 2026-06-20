import type { Metadata } from "next";
import Link from "next/link";
import { buildStaticPageMetadata } from "@/lib/seo-metadata";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Checkout",
  description: "Place your order. Cash on Delivery across Pakistan.",
  path: "/checkout",
  robots: { index: false, follow: true },
});

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-forest sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-2 text-forest/80">
        Enter your details, then confirm your order on WhatsApp. Pay when you receive —
        Cash on Delivery.{" "}
        <Link
          href="/cod"
          className="font-medium text-forest underline decoration-forest/30 underline-offset-2 hover:text-forest/90"
        >
          How COD works
        </Link>
      </p>
      <CheckoutForm />
    </div>
  );
}
