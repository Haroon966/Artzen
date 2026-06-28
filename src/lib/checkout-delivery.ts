import { getSiteOrigin, SITE_BRAND } from "@/lib/site";

export type CustomerFormData = {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
};

export const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  name: "",
  phone: "",
  city: "",
  address: "",
  notes: "",
};

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
] as const;

const DELIVERY_ESTIMATES: Record<string, string> = {
  karachi: "Rs. 250-350",
  lahore: "Rs. 250-350",
  islamabad: "Rs. 300-400",
  rawalpindi: "Rs. 300-400",
  faisalabad: "Rs. 300-420",
  multan: "Rs. 320-450",
  peshawar: "Rs. 350-500",
  quetta: "Rs. 400-600",
  hyderabad: "Rs. 280-380",
  sialkot: "Rs. 300-420",
};

export type OrderCartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

export function generateOrderRef(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AZ-${y}${m}${day}-${rand}`;
}

export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function deliveryEstimateForCity(city: string): string {
  if (!city.trim()) return "Usually Rs. 250-450 for major cities";
  const normalized = city.trim().toLowerCase();
  return DELIVERY_ESTIMATES[normalized] ?? "Usually Rs. 300-550 (final courier rate varies)";
}

export function cityEstimateLabel(city: string): string {
  const key = city.trim().toLowerCase();
  if (!key) return "Rs. 250-450 (major cities)";
  return DELIVERY_ESTIMATES[key] ?? "Rs. 300-550 (depends on courier zone)";
}

export function validateCheckoutFields(data: CustomerFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  if (name.length < 2) {
    errors.name = "Enter your full name (at least 2 characters).";
  }
  const phoneDigits = digitsOnly(data.phone);
  if (phoneDigits.length < 10) {
    errors.phone =
      "Enter a valid mobile number (at least 10 digits). Use the same number you use on WhatsApp if possible.";
  } else if (phoneDigits.length > 15) {
    errors.phone =
      "That number looks too long. Use 10–15 digits (country code without extra prefixes).";
  }
  const city = data.city.trim();
  if (city.length < 2) {
    errors.city = "Enter your city.";
  }
  const address = data.address.trim();
  if (address.length < 10) {
    errors.address =
      "Enter your full delivery address (area, street, house — at least 10 characters).";
  }
  return errors;
}

export function isDeliveryEmpty(data: CustomerFormData): boolean {
  return (
    !data.name.trim() &&
    !data.phone.trim() &&
    !data.city.trim() &&
    !data.address.trim() &&
    !data.notes.trim()
  );
}

export function focusFirstInvalidField(errors: Record<string, string>): void {
  const order = ["name", "phone", "city", "address"] as const;
  queueMicrotask(() => {
    for (const id of order) {
      if (!errors[id]) continue;
      const el = document.getElementById(id);
      if (el) {
        el.focus();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      break;
    }
  });
}

export function buildFullOrderWhatsAppMessage(options: {
  formData: CustomerFormData;
  items: OrderCartItem[];
  totalPrice: number;
  orderRef?: string;
}): string {
  const { formData, items, totalPrice, orderRef } = options;
  const origin = getSiteOrigin();
  const lines: string[] = [];

  lines.push(orderRef ? `${SITE_BRAND} order ${orderRef}` : `${SITE_BRAND} order`);
  lines.push("");
  lines.push(`Name: ${formData.name}`);
  lines.push(`Phone: ${formData.phone}`);
  lines.push(`City: ${formData.city}`);
  lines.push(`Address: ${formData.address}`);
  if (formData.notes.trim()) lines.push(`Notes: ${formData.notes.trim()}`);
  lines.push("", "Items:");

  items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(
      `   Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(lineTotal)}`
    );
    lines.push(`   ${origin}/products/${item.slug}`);
    if (index < items.length - 1) lines.push("");
  });

  lines.push("", `Total: ${formatPrice(totalPrice)}`);
  return lines.join("\n");
}

export function buildOrderSummaryFromItems(
  items: { name: string; quantity: number; price: number }[]
): string {
  return items
    .map((i) => `${i.name} × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`)
    .join("\n");
}
