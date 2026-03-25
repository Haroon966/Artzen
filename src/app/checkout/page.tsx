import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place your order. Cash on Delivery across Pakistan.",
  alternates: { canonical: `${getSiteOrigin()}/checkout` },
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-forest">Checkout</h1>
      <p className="mt-2 text-forest/80">
        Enter your details. Pay when you receive — Cash on Delivery.
      </p>
      <CheckoutForm />
    </div>
  );
}
