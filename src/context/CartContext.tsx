"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { buildShopifyCartPermalink } from "@/lib/shopify/checkout-redirect";
import { isShopifyConfigured } from "@/lib/shopify/config";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  /** Shopify variant GID or numeric id — required for checkout redirect. */
  merchandiseId?: string;
  lineId?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
  hasProductSlug: (slug: string) => boolean;
  /** Shopify cart permalink when items have variant ids. */
  checkoutUrl: string | null;
  /** True when NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is set. */
  shopifyEnabled: boolean;
  cartBusy: boolean;
  cartError: string | null;
  /** Build Shopify cart/checkout redirect URL from local cart lines. */
  prepareCheckout: () => Promise<string | null>;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "artzen-cart";

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const shopifyEnabled = isShopifyConfigured();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadLocalCart());
  }, []);

  const checkoutUrl = useMemo(() => {
    if (!shopifyEnabled || items.length === 0) return null;
    return buildShopifyCartPermalink(items);
  }, [shopifyEnabled, items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setCartError(null);
      if (shopifyEnabled && !item.merchandiseId) {
        setCartError(
          "This product is missing a Shopify variant id. Import products to Shopify (`npm run catalog:to-shopify`) then sync (`npm run catalog:from-shopify`)."
        );
      }
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + quantity, merchandiseId: item.merchandiseId ?? i.merchandiseId }
              : i
          );
        } else {
          next = [...prev, { ...item, quantity }];
        }
        saveLocalCart(next);
        return next;
      });
    },
    [shopifyEnabled]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveLocalCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((i) => i.id !== id);
        saveLocalCart(next);
        return next;
      }
      const next = prev.map((i) => (i.id === id ? { ...i, quantity } : i));
      saveLocalCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveLocalCart([]);
    setCartError(null);
  }, []);

  const prepareCheckout = useCallback(async () => {
    if (!shopifyEnabled) {
      setCartError(
        "Shopify checkout is not configured. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN (e.g. store.artzens.com)."
      );
      return null;
    }
    const url = buildShopifyCartPermalink(items);
    if (!url) {
      setCartError(
        "Cart items need Shopify variant ids. Run catalog:to-shopify then catalog:from-shopify."
      );
      return null;
    }
    setCartError(null);
    return url;
  }, [shopifyEnabled, items]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const hasProductSlug = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      totalItems,
      totalPrice,
      clearCart,
      hasProductSlug,
      checkoutUrl,
      shopifyEnabled,
      cartBusy: false,
      cartError,
      prepareCheckout,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      totalItems,
      totalPrice,
      clearCart,
      hasProductSlug,
      checkoutUrl,
      shopifyEnabled,
      cartError,
      prepareCheckout,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
