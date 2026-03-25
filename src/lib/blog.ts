/** Blog / journal — static articles for Artzen */

export type BlogSection = { heading: string; paragraphs: string[] };

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  readTime: string;
  category: string;
  sections: BlogSection[];
}

export const blogArticles: Record<string, BlogArticle> = {
  "prayer-corner-decor-ideas": {
    slug: "prayer-corner-decor-ideas",
    title: "Styling a prayer corner that feels calm",
    description:
      "Light, height, and pairing pieces — simple ideas for a dedicated space without clutter.",
    date: "2026-03-02",
    dateLabel: "Mar 2, 2026",
    readTime: "4 min",
    category: "Home",
    sections: [
      {
        heading: "Start with the wall",
        paragraphs: [
          "Choose one wall you face daily — not necessarily the largest. A single strong piece of calligraphy (Bismillah, Ayatul Kursi, or a small Allah–Muhammad set) anchors the corner without competing with your musalla.",
          "Hang the main piece at eye level when standing; secondary accents can sit slightly lower if you use a low shelf for perfume or miswak.",
        ],
      },
      {
        heading: "Light changes everything",
        paragraphs: [
          "Warm, indirect light flatters MDF depth and keeps glare off acrylic finishes. A small directional lamp from the side reads more peaceful than overhead spots.",
          "If natural light hits the wall in the morning, consider UV-aware placement for very sun-heavy windows — our finishes are durable, but any art lasts longer out of harsh direct sun all day.",
        ],
      },
      {
        heading: "Less, but meaningful",
        paragraphs: [
          "One primary artwork plus a thin shelf or small frame often feels more intentional than a full gallery. Let the words breathe — the goal is focus, not display density.",
          "Browse our Islamic calligraphy collection for pieces sized for corners and narrower walls.",
        ],
      },
    ],
  },
  "caring-for-mdf-wall-art": {
    slug: "caring-for-mdf-wall-art",
    title: "Caring for MDF Islamic wall art",
    description:
      "Dusting, humidity, and hanging tips so your pieces stay sharp for years.",
    date: "2026-02-18",
    dateLabel: "Feb 18, 2026",
    readTime: "3 min",
    category: "Care",
    sections: [
      {
        heading: "Everyday dust",
        paragraphs: [
          "Use a soft, dry microfiber cloth. Avoid sprays on the face of the piece unless the product page specifically allows it — moisture along edges is what you want to minimise.",
          "Light pressure is enough; MDF calligraphy often has fine edges that look best when you clean along the grain of the design, not in tight circles.",
        ],
      },
      {
        heading: "Humidity and walls",
        paragraphs: [
          "Bathrooms and open kitchens can swing in humidity. If you love art in those zones, ensure ventilation and solid wall anchors. For very damp rooms, a drier wall in the home may be kinder long-term.",
        ],
      },
      {
        heading: "Hanging with confidence",
        paragraphs: [
          "Use anchors matched to your wall type (brick, concrete, or drywall). Heavier sets deserve two fixings when possible — it keeps the piece level and stress even across the back.",
        ],
      },
    ],
  },
  "ordering-with-cod-pakistan": {
    slug: "ordering-with-cod-pakistan",
    title: "Ordering with COD across Pakistan",
    description:
      "What to expect when you choose cash on delivery — from cart to doorstep.",
    date: "2026-02-05",
    dateLabel: "Feb 5, 2026",
    readTime: "3 min",
    category: "Service",
    sections: [
      {
        heading: "No advance payment",
        paragraphs: [
          "At Artzen you complete checkout with your details; payment happens when the courier hands you the parcel. That keeps the process straightforward — especially for first-time buyers of larger wall pieces.",
        ],
      },
      {
        heading: "Packaging and delivery",
        paragraphs: [
          "Pieces are packed to survive road transit between cities. If something arrives damaged, reach out quickly with photos — we’re here to make it right.",
          "Delivery timelines vary by city; WhatsApp is the fastest channel for a status check or address clarification.",
        ],
      },
      {
        heading: "Before you order",
        paragraphs: [
          "Double-check dimensions against your wall. When in doubt, measure twice — Islamic art often becomes the focal point of a room, so sizing upfront saves swaps later.",
        ],
      },
    ],
  },
};

export function getBlogSlugs(): string[] {
  return Object.keys(blogArticles);
}

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles[slug];
}

/** Listing entries: internal slug OR external href (e.g. legacy guide) */
export const blogListing: Array<{
  title: string;
  excerpt: string;
  dateLabel: string;
  readTime: string;
  category: string;
  featured?: boolean;
  slug?: string;
  href?: string;
}> = [
  {
    title: "Buying guide: Islamic wall art",
    excerpt:
      "How to choose pieces for your space — MDF vs other materials, sizing, and where to hang.",
    dateLabel: "Jan 2026",
    readTime: "6 min",
    category: "Guide",
    featured: true,
    href: "/guide",
  },
  {
    title: "Styling a prayer corner that feels calm",
    excerpt: "Wall choice, light, and editing down so the space feels focused.",
    dateLabel: "Mar 2, 2026",
    readTime: "4 min",
    category: "Home",
    slug: "prayer-corner-decor-ideas",
  },
  {
    title: "Caring for MDF Islamic wall art",
    excerpt: "Dusting, humidity, and hanging — keep edges and finish looking sharp.",
    dateLabel: "Feb 18, 2026",
    readTime: "3 min",
    category: "Care",
    slug: "caring-for-mdf-wall-art",
  },
  {
    title: "Ordering with COD across Pakistan",
    excerpt: "What cash on delivery looks like from cart to courier.",
    dateLabel: "Feb 5, 2026",
    readTime: "3 min",
    category: "Service",
    slug: "ordering-with-cod-pakistan",
  },
];
