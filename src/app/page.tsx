import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, getDefaultShareImagePath, getSiteOrigin } from "@/lib/site";
import { faqPageJsonLd, homeFaqItems } from "@/lib/faq-content";
import { ProductCard } from "@/components/ProductCard";
import { CategoryGrid } from "@/components/CategoryGrid";
import { WhyArtzen } from "@/components/WhyArtzen";
import { HeroProductFan } from "@/components/HeroProductFan";
import { HomeHeroMobileSlides } from "@/components/HomeHeroMobileSlides";
import { AnimatedSection } from "@/components/AnimatedSection";
import { FaqSection } from "@/components/FaqSection";
import { AnimatedStagger } from "@/components/AnimatedStagger";
import * as q from "@/lib/catalog-queries";
import { getCachedCatalog } from "@/lib/catalog-server";

const homeDescription =
  "Pakistan's favourite online store. Shop home decor, fashion, gifts, wall art and more. Cash on Delivery nationwide.";

const origin = getSiteOrigin();
const defaultOg = absoluteUrl(getDefaultShareImagePath());

export const metadata: Metadata = {
  title: {
    absolute: "Shop Everything Online | Artzen — Pakistan's Favourite Store",
  },
  description: homeDescription,
  alternates: { canonical: origin },
  openGraph: {
    title: "Shop Everything Online | Artzen — Pakistan's Favourite Store",
    description: homeDescription,
    url: origin,
    images: [{ url: defaultOg, alt: "Artzen — online shopping in Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Everything Online | Artzen — Pakistan's Favourite Store",
    description: homeDescription,
    images: [defaultOg],
  },
};

export const revalidate = 120;

export default async function Home() {
  const { products, collections } = await getCachedCatalog();
  const featured = q.getFeaturedProductsFrom(products);
  const heroStripItems = q.getHeroStripProductsFrom(products);
  const homepageCategories = q.getHomepageCollectionsFrom(collections);
  const coverBySlug: Record<string, string | undefined> = {};
  for (const c of homepageCategories) {
    coverBySlug[c.slug] = q.getCollectionCoverImageFrom(products, c);
  }
  const homeFaqLd = faqPageJsonLd(homeFaqItems);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqLd) }}
      />
      <section className="home-hero hero relative flex min-h-[calc(100vh-108px)] flex-col items-center overflow-hidden bg-cream px-4 pt-14 md:min-h-[calc(100vh-108px)] md:items-center md:justify-start md:px-12 md:pt-16">
        <HomeHeroMobileSlides />

        <svg
          className="pointer-events-none absolute left-0 top-0 hidden h-full w-full md:block"
          viewBox="0 0 680 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M 0 0 C 40 120,-30 240, 20 360 C 70 480,-20 600, 30 720 C 80 840, 10 880, 20 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 42 0 C 82 120, 12 240, 62 360 C 112 480, 22 600, 72 720 C 122 840, 52 880, 62 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 85 0 C 125 120, 55 240,105 360 C 155 480, 65 600,115 720 C 165 840, 95 880,105 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 127 0 C 167 120, 97 240,147 360 C 197 480,107 600,157 720 C 207 840,137 880,147 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 170 0 C 210 120,140 240,190 360 C 240 480,150 600,200 720 C 250 840,180 880,190 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 212 0 C 252 120,182 240,232 360 C 282 480,192 600,242 720 C 292 840,222 880,232 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 255 0 C 295 120,225 240,275 360 C 325 480,235 600,285 720 C 335 840,265 880,275 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 297 0 C 337 120,267 240,317 360 C 367 480,277 600,327 720 C 377 840,307 880,317 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 340 0 C 380 120,310 240,360 360 C 410 480,320 600,370 720 C 420 840,350 880,360 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 382 0 C 422 120,352 240,402 360 C 452 480,362 600,412 720 C 462 840,392 880,402 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 425 0 C 465 120,395 240,445 360 C 495 480,405 600,455 720 C 505 840,435 880,445 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 467 0 C 507 120,437 240,487 360 C 537 480,447 600,497 720 C 547 840,477 880,487 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 510 0 C 550 120,480 240,530 360 C 580 480,490 600,540 720 C 590 840,520 880,530 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 552 0 C 592 120,522 240,572 360 C 622 480,532 600,582 720 C 632 840,562 880,572 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 595 0 C 635 120,565 240,615 360 C 665 480,575 600,625 720 C 675 840,605 880,615 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 637 0 C 677 120,607 240,657 360 C 707 480,617 600,667 720 C 717 840,647 880,657 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 680 0 C 720 120,650 240,700 360 C 750 480,660 600,710 720 C 760 840,690 880,700 900" fill="none" stroke="rgba(30, 40, 50, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
        </svg>

        <div className="hero__content relative z-[2] w-full max-w-[720px] animate-[fadeUp_0.7s_ease_both] max-md:max-w-none md:mx-auto md:text-center">
          <p className="hero-badge max-md:inline-flex md:hidden">Cash on delivery · Pakistan</p>
          <h1 className="hero__title font-[var(--font-cormorant)] text-[clamp(2.5rem,6vw,4.875rem)] font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] [-webkit-font-smoothing:antialiased] md:text-[clamp(2.5rem,6vw,4.875rem)]">
            Shop Everything —
            <br />
            <em className="font-normal not-italic text-inherit">
              Fashion, Home, Art, Gifts &amp; More
            </em>
          </h1>
          <p className="hero__subtitle mt-3 max-w-[22rem] font-[var(--font-dm-sans)] font-normal leading-relaxed md:mx-auto md:hidden">
            Pakistan&apos;s online store — pay when your order arrives. Browse wall art, gifts, and more.
          </p>
          <div className="hero__cta mt-6 flex w-full max-w-md flex-col gap-2.5 md:hidden">
            <Link
              href="/shop"
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--off-white)] px-6 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--slate)] no-underline shadow-md transition-opacity active:opacity-90"
            >
              Shop now
            </Link>
            <Link
              href="/shop?sale=1"
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full border-2 border-white/35 bg-transparent px-6 font-[var(--font-dm-sans)] text-[15px] font-semibold text-white no-underline transition-colors active:bg-white/10"
            >
              View sale
            </Link>
          </div>
        </div>

        <div className="card-strip mt-10 hidden md:mt-14 md:block">
          <HeroProductFan items={heroStripItems} />
        </div>

        <div className="home-feature-bar feature-bar relative z-[1] mt-10 grid w-full max-w-[1100px] grid-cols-1 gap-px overflow-hidden rounded-2xl bg-[var(--border-mid)] animate-[fadeUp_1s_0.25s_ease_both] sm:grid-cols-3">
          <div className="feature-item bg-[var(--cream)] px-6 py-7 text-center md:px-8">
            <h3 className="mb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--text-primary)]">
              🚚 Cash on Delivery
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Pay when your order arrives — COD across cities nationwide.
            </p>
          </div>
          <div className="feature-item bg-[var(--cream)] px-6 py-7 text-center md:px-8">
            <h3 className="mb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--text-primary)]">
              📦 Nationwide delivery
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Careful packing so your order reaches you in great shape.
            </p>
          </div>
          <div className="feature-item bg-[var(--cream)] px-6 py-7 text-center md:px-8">
            <h3 className="mb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--text-primary)]">
              💬 WhatsApp support
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Questions and order help — we reply fast on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg)] px-4 py-12 sm:px-6">
        <AnimatedSection as="div" className="mx-auto max-w-6xl">
          <h2 className="font-[var(--font-cormorant)] text-2xl font-semibold text-[var(--text-primary)]">
            Curated picks
          </h2>
          <p className="mt-1 text-[var(--muted)]">
            Handpicked favourites from across our catalogue — wall art, gifts, and more.
          </p>
          <AnimatedStagger
            className="home-featured-stagger mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            childClassName=""
          >
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatedStagger>
          <div className="mt-10 flex justify-center sm:mt-12">
            <Link
              href="/shop"
              className="rounded-full border border-[var(--border-mid)] bg-[var(--off-white)]/90 px-6 py-3 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)] no-underline shadow-[var(--shadow-sm)] backdrop-blur-sm transition hover:border-[var(--border-accent)] hover:bg-[var(--bg-card)]"
            >
              View all products →
            </Link>
          </div>
        </AnimatedSection>
      </section>

      <WhyArtzen />

      <section className="relative overflow-hidden bg-[var(--bg-card)] py-14 sm:py-20 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(125,170,138,0.08) 0%, transparent 45%),
              radial-gradient(circle at 80% 70%, rgba(30,40,50,0.04) 0%, transparent 40%)`,
          }}
          aria-hidden
        />
        <AnimatedSection as="div" className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--gold)]">
                Browse
              </p>
              <h2 className="mt-2 font-[var(--font-cormorant)] text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight text-[var(--text-primary)]">
                Shop by category
              </h2>
              <p className="mt-2 max-w-lg font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-[var(--muted)]">
                Wall art, calligraphy, gifts, and more — find what fits your space and your people.
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 self-start rounded-full border border-[var(--border-mid)] bg-[var(--off-white)]/85 px-5 py-2.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)] no-underline backdrop-blur-sm transition hover:border-[var(--border-accent)] hover:bg-[var(--bg-card)] sm:self-auto"
            >
              View all products →
            </Link>
          </div>
          <div className="mt-10 md:mt-12">
            <CategoryGrid collections={homepageCategories} coverBySlug={coverBySlug} />
          </div>
        </AnimatedSection>
      </section>

      <FaqSection items={homeFaqItems} headingId="home-faq-heading" />

      <section className="border-t border-[var(--border-mid)] bg-[var(--accent-muted)] py-12">
        <AnimatedSection as="div" className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="font-[var(--font-cormorant)] text-2xl font-semibold text-[var(--text-primary)]">
            Ready to shop?
          </h2>
          <p className="mt-2 text-[var(--muted)]">
            Explore the full store or message us on WhatsApp anytime.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-[var(--slate)] px-6 py-3 text-sm font-medium text-[var(--off-white)] no-underline transition hover:bg-[var(--slate-soft)]"
          >
            Browse all products
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
