"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";
import { getSiteOrigin } from "@/lib/site";

const WA = "923315856777";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const reduceMotion = useReducedMotion();

  const handleAdd = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: productDisplayName(product),
      price: product.price,
      image: product.image,
    });
  };

  const productUrl = `${getSiteOrigin()}/products/${product.slug}`;
  const waText = encodeURIComponent(
    `Hi Artzen — I'm interested in: ${productDisplayName(product)}\n${productUrl}`
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <motion.button
          type="button"
          onClick={handleAdd}
          className="inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full bg-[var(--slate)] px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-semibold text-[var(--off-white)] shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--slate-soft)] sm:min-w-[200px]"
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          Add to cart
          <span className="text-lg leading-none opacity-90" aria-hidden>
            +
          </span>
        </motion.button>
        <Link
          href="/cart"
          className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-full border-2 border-[var(--border-mid)] bg-[var(--off-white)] px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-medium text-[var(--text-primary)] no-underline transition hover:border-[var(--border-accent)] hover:bg-[var(--bg-card)] sm:min-w-[160px]"
        >
          View cart
        </Link>
      </div>
      <a
        href={`https://wa.me/${WA}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 py-3 font-[var(--font-dm-sans)] text-[13px] font-medium text-[#1a5c2e] no-underline transition hover:bg-[#25D366]/15"
      >
        <span className="text-[#25D366]" aria-hidden>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
        Ask on WhatsApp
      </a>
      <p className="font-[var(--font-dm-sans)] text-[12px] leading-relaxed text-[var(--muted)]">
        Cash on delivery nationwide — pay when your order arrives.
      </p>
    </div>
  );
}
