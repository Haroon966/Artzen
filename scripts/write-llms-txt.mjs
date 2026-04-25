/**
 * Emits public/llms.txt and public/llms-full.txt for static export hosts.
 * Origin matches src/lib/site.ts (NEXT_PUBLIC_SITE_URL, default artzens.com).
 * FAQ bullets in llms-full mirror src/lib/faq-content.ts — update both if copy changes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const SITE_BRAND = "Artzens";

function getOrigin() {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "https://artzens.com";
}

/** Trailing-slash URLs except home (matches canonicalUrl). */
function absUrl(pathname) {
  const origin = getOrigin();
  if (!pathname || pathname === "/") return `${origin}/`;
  if (pathname.includes("?")) return `${origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return p.endsWith("/") ? `${origin}${p}` : `${origin}${p}/`;
}

// Keep in sync with src/lib/faq-content.ts (homeFaqItems + codFaqItems).
const HOME_FAQ = [
  {
    q: "Do you offer Cash on Delivery across Pakistan?",
    a: `Yes. ${SITE_BRAND} offers Cash on Delivery nationwide so you can pay when your order arrives.`,
  },
  {
    q: `What can I buy at ${SITE_BRAND}?`,
    a: "Shop home decor, wall art, Islamic calligraphy, personalized gifts, and more — all packed with care for delivery across Pakistan.",
  },
  {
    q: "How long does delivery usually take?",
    a: "Delivery typically takes a few business days depending on your city. We share updates once your order ships.",
  },
  {
    q: "How can I get help with my order?",
    a: "Message us on WhatsApp or use the Contact page — we reply as quickly as we can.",
  },
];

const COD_FAQ = [
  {
    q: "Do you offer Cash on Delivery across Pakistan?",
    a: "We offer Cash on Delivery (COD) across Pakistan. Place your order, and pay when your package arrives.",
  },
  {
    q: `How does Cash on Delivery work at ${SITE_BRAND}?`,
    a: "Add items to your cart and proceed to checkout. Enter your name, phone number, and delivery address. We confirm and ship your order, and you pay the delivery person in cash when you receive it.",
  },
  {
    q: "Which areas do you deliver to?",
    a: "We deliver to all major cities in Pakistan. Delivery times may vary by location. You will receive an update once your order is shipped.",
  },
  {
    q: `How do I contact ${SITE_BRAND}?`,
    a: "Questions? Contact us via WhatsApp or the Contact page.",
  },
];

function faqMd(title, items) {
  const lines = [`## ${title}`, ""];
  for (const { q, a } of items) {
    lines.push(`### ${q}`, "", a, "");
  }
  return lines.join("\n");
}

const origin = getOrigin();
const sitemapUrl = `${origin}/sitemap.xml`;

const llmsShort = `# ${SITE_BRAND}

> Pakistan-focused online store: home decor, wall art, Islamic calligraphy, gifts, and more. Cash on Delivery (COD) nationwide.

## Key pages

- [Shop](${absUrl("/shop")}) — product catalog and filters.
- [Shop (on sale)](${absUrl("/shop?sale=1")}) — discounted items.
- [Buying guide](${absUrl("/guide")}) — how to choose and order.
- [Cash on Delivery](${absUrl("/cod")}) — how COD works.
- [About](${absUrl("/about")})
- [Contact](${absUrl("/contact")})

## Policies

- [Shipping policy](${absUrl("/shipping-policy")})
- [Returns policy](${absUrl("/returns-policy")})
- [Privacy policy](${absUrl("/privacy-policy")})
- [Terms](${absUrl("/terms")})

## For crawlers and assistants

- Canonical product URLs follow \`/products/{slug}/\` (see [sitemap](${sitemapUrl}) for every slug).
- Collection hubs: \`/collections/{slug}/\`.
- Cart, checkout, favorites, and profile are user-specific; they are omitted from the sitemap and discouraged for indexing.
- Machine-readable URL list: ${sitemapUrl}
- Robots: ${absUrl("/robots.txt")}
`;

const llmsFull = `${llmsShort}

---

# ${SITE_BRAND} — extended context

${faqMd("Homepage FAQ (customer-facing)", HOME_FAQ)}

${faqMd("Cash on Delivery FAQ", COD_FAQ)}

## Shipping and returns (summary)

- Full policy text: [Shipping](${absUrl("/shipping-policy")}), [Returns](${absUrl("/returns-policy")}).
- Use those pages for definitive terms; this file is a convenience summary for language models.

`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsShort, "utf8");
fs.writeFileSync(path.join(publicDir, "llms-full.txt"), llmsFull, "utf8");

console.log(`Wrote public/llms.txt and public/llms-full.txt (origin ${origin})`);
