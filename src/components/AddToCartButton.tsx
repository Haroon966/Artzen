"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/analytics";
import type { Product } from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" />
    </svg>
  );
}

export function AddToCartButton({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payload = {
    id: product.id,
    slug: product.slug,
    name: productDisplayName(product),
    price: product.price,
    image: product.image,
  };

  const handleAddToCart = useCallback(() => {
    addItem(payload, 1);
    trackAddToCart({
      item_id: payload.id,
      item_name: payload.name,
      price: payload.price,
      quantity: 1,
    });
    setJustAdded(true);
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = setTimeout(() => setJustAdded(false), 2000);
  }, [addItem, payload]);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <motion.button
        type="button"
        onClick={handleAddToCart}
        className={`inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-semibold shadow-[var(--shadow-md)] transition-colors sm:min-w-[200px] ${
          justAdded
            ? "bg-[var(--sage)] text-[var(--off-white)]"
            : "bg-[var(--gold)] text-[var(--dark)] hover:bg-[var(--gold2)]"
        }`}
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <CartIcon className="h-4 w-4" />
        {justAdded ? "Added" : "Add to cart"}
      </motion.button>
      <p className="font-[var(--font-dm-sans)] text-[12px] leading-relaxed text-[var(--muted)]">
        Cash on delivery nationwide — pay when your order arrives.
      </p>
    </div>
  );
}
