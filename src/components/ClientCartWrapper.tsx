"use client";

import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MobileNavProvider } from "@/context/MobileNavContext";

export function ClientCartWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <FavoritesProvider>
        <MobileNavProvider>{children}</MobileNavProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}
