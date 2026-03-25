"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";

const values = [
  {
    n: "I",
    title: "Craft that lasts",
    body: "Premium MDF, acrylic finish, and hands that care about every edge. Pieces meant to stay on your wall for years — not seasons.",
  },
  {
    n: "II",
    title: "Trust, first",
    body: "Cash on Delivery across Pakistan. You see the work before you pay. No advance — because confidence should feel normal.",
  },
  {
    n: "III",
    title: "Range that grows",
    body: "From Islamic calligraphy to wall art and gifts — we keep adding what Pakistani shoppers actually want.",
  },
];

export function AboutStory() {
  return (
    <div className="bg-cream-deep">
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-14 md:pb-32 md:pt-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 100% 80% at 50% -20%, rgba(201, 168, 76, 0.14), transparent 55%),
              radial-gradient(circle at 100% 60%, rgba(20, 18, 16, 0.04), transparent 45%)
            `,
          }}
          aria-hidden
        />
        <svg
          className="pointer-events-none absolute -right-20 top-1/4 h-[420px] w-[420px] text-[var(--gold)]/15 sm:right-0"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.35" />
          <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="0.25" />
          <circle cx="100" cy="100" r="56" stroke="currentColor" strokeWidth="0.2" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <AnimatedSection as="div" className="max-w-4xl">
            <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--gold)]">
              About Artzen
            </p>
            <h1 className="mt-4 font-[var(--font-cormorant)] text-[clamp(2.75rem,8vw,4.75rem)] font-semibold leading-[1.02] tracking-tight text-[var(--dark)]">
              Your store,
              <br />
              <span className="font-normal italic text-muted">thoughtfully built.</span>
            </h1>
            <p className="mt-8 max-w-xl border-l-2 border-[var(--gold)]/60 pl-6 font-[var(--font-dm-sans)] text-[17px] font-light leading-[1.65] text-muted">
              We started with a simple idea: shopping online in Pakistan should feel{" "}
              <em className="font-medium not-italic text-[var(--dark)]">easy and trustworthy</em> —
              great products, clear pricing, and Cash on Delivery you can rely on.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Pull quote band */}
      <section className="relative border-y border-black/[0.06] bg-coffee-bean-deep py-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <AnimatedSection as="div" delay={0.05}>
            <blockquote className="font-[var(--font-cormorant)] text-[clamp(1.5rem,4vw,2.25rem)] font-normal italic leading-snug text-cream-deep">
              &ldquo;Every piece should quiet the room — and remind you why you chose it.&rdquo;
            </blockquote>
            <p className="mt-6 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
              — The Artzen standard
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story + image */}
      <section className="py-16 sm:py-24 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-16">
          <AnimatedSection
            as="div"
            className="relative lg:col-span-5 lg:col-start-1"
            direction="right"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
              <Image
                src="/images/hero-1.webp"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 42vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-tr from-coffee-bean-deep/20 via-transparent to-transparent"
                aria-hidden
              />
            </div>
            <div
              className="absolute -bottom-4 -right-4 hidden h-28 w-28 rounded-[var(--radius)] border border-[var(--gold)]/30 bg-cream-deep/90 backdrop-blur-sm sm:block lg:-right-6"
              aria-hidden
            />
          </AnimatedSection>

          <div className="lg:col-span-6 lg:col-start-7">
            <AnimatedSection as="div">
              <h2 className="font-[var(--font-cormorant)] text-[clamp(1.75rem,3vw,2.25rem)] font-semibold text-[var(--dark)]">
                Handmade heart,{" "}
                <span className="text-[var(--gold)]">modern home</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection as="div" className="mt-8 space-y-6" delay={0.08}>
              <p className="font-[var(--font-dm-sans)] text-[15px] font-light leading-[1.75] text-muted">
                Artzen grew from wanting a single place to find{" "}
                <strong className="font-medium text-[var(--dark)]">things you actually want</strong> —
                wall art, personalized gifts, decor, and more — with the same care whether it ships to
                Lahore or Karachi.
              </p>
              <p className="font-[var(--font-dm-sans)] text-[15px] font-light leading-[1.75] text-muted">
                Islamic calligraphy and spiritual pieces remain a proud part of our catalogue. You will
                also find decorative wall art, keychains, and other categories as we grow — always with
                quality and packaging we stand behind.
              </p>
              <p className="font-[var(--font-dm-sans)] text-[15px] font-light leading-[1.75] text-muted">
                Materials are chosen to age gracefully: high-grade board, careful edges, finishes that
                catch light without shouting. We&apos;d hang these in our own homes — so we build them
                that way.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-black/[0.06] bg-cream-soft py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AnimatedSection as="div" className="mb-12 max-w-2xl md:mb-16">
            <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
              How we work
            </p>
            <h2 className="mt-2 font-[var(--font-cormorant)] text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[var(--dark)]">
              Three promises
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {values.map((v, i) => (
              <AnimatedSection key={v.n} as="div" delay={0.06 * i} className="group relative">
                <article className="relative h-full rounded-[var(--radius)] border border-black/[0.07] bg-white p-8 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.12)]">
                  <span
                    className="font-[var(--font-cormorant)] text-5xl font-semibold leading-none text-[var(--gold)]/20 transition-colors group-hover:text-[var(--gold)]/35"
                    aria-hidden
                  >
                    {v.n}
                  </span>
                  <h3 className="mt-4 font-[var(--font-cormorant)] text-xl font-semibold text-[var(--dark)]">
                    {v.title}
                  </h3>
                  <p className="mt-3 font-[var(--font-dm-sans)] text-[14px] font-light leading-relaxed text-[var(--muted)]">
                    {v.body}
                  </p>
                  <div className="mt-6 h-px w-10 bg-gradient-to-r from-[var(--gold)] to-transparent" />
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-coffee-bean-deep py-16 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.12)_0%,transparent_65%)]"
          aria-hidden
        />
        <AnimatedSection as="div" className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-[var(--font-cormorant)] text-[clamp(1.75rem,4vw,2.5rem)] font-semibold text-cream-soft">
            Ready to dress a wall?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-cream-deep/75">
            Browse collections or message us — we&apos;re quick on WhatsApp for custom questions and
            orders.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-semibold text-coffee-bean no-underline transition hover:bg-[var(--gold2)] hover:[-translate-y-px]"
            >
              Explore the shop
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-medium text-cream-deep no-underline transition hover:border-white/35 hover:bg-white/5"
            >
              Contact us
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
