/** Canonical site origin for product URLs in orders (no trailing slash). */
export function getSiteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "https://artzen.pk";
}

/** Absolute URL for a site path (path must start with `/`). */
export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

/** Default Open Graph / schema image (committed raster under public/). */
export function getDefaultShareImagePath(): string {
  return "/images/hero-1.webp";
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
  return `${prefix}${encodeURIComponent("Hi Artzen — I'd like to place an order.")}`;
}
