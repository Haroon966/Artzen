/** Customer-facing brand (matches logo and Artzens.com). */
export const SITE_BRAND = "Artzens";

/** Canonical site origin for product URLs in orders (no trailing slash). */
export function getSiteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "https://artzens.com";
}

/** Absolute URL for a site path (path must start with `/`). */
export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

/** Canonical absolute URL using trailing-slash route style (except home). */
export function canonicalUrl(path: string): string {
  const origin = getSiteOrigin();
  if (!path || path === "/") return `${origin}/`;
  if (path.includes("?")) return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.endsWith("/") ? `${origin}${p}` : `${origin}${p}/`;
}

/** Homepage hero carousel image (committed raster under public/). */
export function getHeroImagePath(): string {
  return "/images/hero-1.webp";
}

/** @deprecated Use getOgShareImagePath() for social previews; hero carousel uses getHeroImagePath(). */
export function getDefaultShareImagePath(): string {
  return getHeroImagePath();
}

/** Branded Open Graph / WhatsApp share banner (1200×630 JPG). */
export function getOgShareImagePath(): string {
  return "/images/og-banner.jpg";
}

export const OG_SHARE_IMAGE_WIDTH = 1200;
export const OG_SHARE_IMAGE_HEIGHT = 630;

/** Default OG/Twitter image metadata for static pages and layout fallbacks. */
export function getOgShareImageMetadata(alt?: string) {
  return {
    url: absoluteUrl(getOgShareImagePath()),
    width: OG_SHARE_IMAGE_WIDTH,
    height: OG_SHARE_IMAGE_HEIGHT,
    alt: alt ?? `${SITE_BRAND} — online shopping in Pakistan`,
    type: "image/jpeg" as const,
  };
}

/** Google Search Console HTML tag verification (optional). */
export function getGoogleSiteVerification(): string | undefined {
  const v = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return v || undefined;
}

/** Optional sameAs URLs for Organization schema (comma-separated in env). */
export function getSameAsUrls(): string[] {
  const raw = process.env.NEXT_PUBLIC_SAME_AS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** WhatsApp business number for wa.me links (digits only, country code included). */
export function getWhatsAppPhoneDigits(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "") || "";
  return raw || "923315856777";
}

/** E.164 phone for schema contactPoint from WhatsApp digits. */
export function getContactPhoneE164(): string {
  const d = getWhatsAppPhoneDigits();
  return d ? `+${d}` : "+923315856777";
}

/**
 * Build a wa.me link with pre-filled text. Very long messages are truncated so
 * the URL stays within typical limits and WhatsApp opens reliably.
 */
export function whatsAppOrderLink(message: string): string {
  const phone = getWhatsAppPhoneDigits();
  const prefix = `https://wa.me/${phone}?text=`;
  const maxTotalLen = 7900;
  const tail = "\n…(truncated — include your order ref if anything is missing.)";
  let m = message.trim() || "Hi";

  for (let i = 0; i < 40; i++) {
    const encoded = encodeURIComponent(m);
    if (prefix.length + encoded.length <= maxTotalLen) {
      return `${prefix}${encoded}`;
    }
    m = m.slice(0, Math.max(50, Math.floor(m.length * 0.75))).trimEnd() + tail;
  }
  return `${prefix}${encodeURIComponent(`Hi ${SITE_BRAND} — I'd like to place an order.`)}`;
}

/** Pre-filled WhatsApp message for a single product order inquiry. */
export function buildProductOrderWhatsAppMessage(options: {
  productName: string;
  productUrl?: string;
  price?: number;
  quantity?: number;
  size?: string;
  material?: string;
  finish?: string;
}): string {
  const lines = [`Hi ${SITE_BRAND} — I'd like to order:`];
  lines.push(options.productName);
  if (options.size) lines.push(`Size: ${options.size}`);
  if (options.material) lines.push(`Material: ${options.material}`);
  if (options.finish) lines.push(`Finish: ${options.finish}`);
  if (options.quantity != null && options.quantity > 1) {
    lines.push(`Qty: ${options.quantity}`);
  }
  if (options.price != null) {
    lines.push(`Price: Rs. ${options.price.toLocaleString("en-PK")}`);
  }
  if (options.productUrl) lines.push(options.productUrl);
  return lines.join("\n");
}

function formatPricePkr(price: number): string {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

/** Pre-filled WhatsApp message for a multi-item cart order. */
export function buildCartWhatsAppMessage(
  items: Array<{ slug: string; name: string; price: number; quantity: number }>,
  totalPrice: number,
  city?: string,
  deliveryEstimate?: string
): string {
  const origin = getSiteOrigin();
  const lines = [`Hi ${SITE_BRAND} — I'd like to order:`, "", "Items:"];

  items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(
      `   Qty: ${item.quantity} × ${formatPricePkr(item.price)} = ${formatPricePkr(lineTotal)}`
    );
    lines.push(`   ${origin}/products/${item.slug}`);
    if (index < items.length - 1) lines.push("");
  });

  lines.push("", `Total: ${formatPricePkr(totalPrice)}`);
  if (city?.trim()) {
    lines.push(`City: ${city.trim()}`);
  }
  if (deliveryEstimate?.trim()) {
    lines.push(`Estimated delivery: ${deliveryEstimate.trim()}`);
  }
  return lines.join("\n");
}
