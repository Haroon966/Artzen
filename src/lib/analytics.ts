import type { CartItem } from "@/context/CartContext";

/** GA4 measurement ID (`G-…`). */
export function getGaMeasurementId(): string | null {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtagEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

function gaItemsFromCart(items: CartItem[]) {
  return items.map((i, index) => ({
    item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
    index,
  }));
}

export function trackAddToCart(item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}) {
  gtagEvent("add_to_cart", {
    currency: "PKR",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
}

export function trackViewItemList(
  listId: string,
  items: Array<{ item_id: string; item_name: string; price: number }>
) {
  gtagEvent("view_item_list", {
    item_list_id: listId,
    item_list_name: listId,
    items: items.map((item, index) => ({ ...item, index })),
  });
}

export function trackSelectItem(item: {
  item_id: string;
  item_name: string;
  price: number;
  index?: number;
}) {
  gtagEvent("select_item", {
    items: [item],
  });
}

export function trackViewItem(item: {
  item_id: string;
  item_name: string;
  price: number;
}) {
  gtagEvent("view_item", {
    currency: "PKR",
    value: item.price,
    items: [item],
  });
}

export function trackViewCart(items: CartItem[], totalPrice: number) {
  gtagEvent("view_cart", {
    currency: "PKR",
    value: totalPrice,
    items: gaItemsFromCart(items),
  });
}

export function trackUpdateCartQuantity(item: CartItem) {
  gtagEvent("update_cart_quantity", {
    currency: "PKR",
    value: item.price * item.quantity,
    items: [gaItemsFromCart([item])[0]],
  });
}

export function trackRemoveFromCart(item: CartItem) {
  gtagEvent("remove_from_cart", {
    currency: "PKR",
    value: item.price * item.quantity,
    items: [gaItemsFromCart([item])[0]],
  });
}

export function trackBeginCheckout(items: CartItem[], totalPrice: number) {
  gtagEvent("begin_checkout", {
    currency: "PKR",
    value: totalPrice,
    items: gaItemsFromCart(items),
  });
}

export function trackPurchase(
  transactionId: string,
  items: CartItem[],
  totalPrice: number
) {
  gtagEvent("purchase", {
    transaction_id: transactionId,
    currency: "PKR",
    value: totalPrice,
    items: gaItemsFromCart(items),
  });
}

export function trackCheckoutFormStarted() {
  gtagEvent("checkout_form_started");
}

export function trackCheckoutValidationError(field: string, message: string) {
  gtagEvent("checkout_validation_error", { field, message });
}

export function trackCheckoutSubmitAttempt(items: CartItem[], totalPrice: number) {
  gtagEvent("checkout_submit_attempt", {
    currency: "PKR",
    value: totalPrice,
    items: gaItemsFromCart(items),
  });
}

export function trackCheckoutSubmitFailed(
  reason: "validation" | "empty_cart" | "network" | "formspree"
) {
  gtagEvent("checkout_submit_failed", { reason });
}

export function trackWhatsAppOpenAttempt(source: "success" | "fallback" | "reopen") {
  gtagEvent("whatsapp_open_attempt", { source });
}

export function trackWhatsAppFallbackClicked() {
  gtagEvent("whatsapp_fallback_clicked");
}

export function trackShopFilterApply(activeFilters: number, resultCount: number) {
  gtagEvent("shop_filter_apply", {
    active_filters: activeFilters,
    result_count: resultCount,
  });
}

export function trackShopFilterReset() {
  gtagEvent("shop_filter_reset");
}

export function trackShopSortChange(sortBy: string, resultCount: number) {
  gtagEvent("shop_sort_change", {
    sort_by: sortBy,
    result_count: resultCount,
  });
}
