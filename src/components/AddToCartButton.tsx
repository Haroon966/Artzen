"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";
import {
  buildProductOrderWhatsAppMessage,
  getSiteOrigin,
  whatsAppOrderLink,
} from "@/lib/site";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function AddToCartButton({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion();
  const productUrl = `${getSiteOrigin()}/products/${product.slug}`;
  const orderHref = whatsAppOrderLink(
    buildProductOrderWhatsAppMessage({
      productName: productDisplayName(product),
      productUrl,
      price: product.price,
      quantity: 1,
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <motion.a
        href={orderHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--slate)] px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-semibold text-[var(--off-white)] no-underline shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--slate-soft)] sm:min-w-[200px]"
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <PhoneIcon className="h-4 w-4" />
        Call to Order
      </motion.a>
      <p className="font-[var(--font-dm-sans)] text-[12px] leading-relaxed text-[var(--muted)]">
        Cash on delivery nationwide — pay when your order arrives.
      </p>
    </div>
  );
}
