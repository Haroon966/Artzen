"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export function CartCount() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || totalItems <= 0) return null;
  return (
    <span className="cart-count-badge flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[10px] font-bold text-[var(--dark)]">
      {totalItems}
    </span>
  );
}
