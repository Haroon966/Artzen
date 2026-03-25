"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { blogListing } from "@/lib/blog";

export function BlogIndex() {
  const reduceMotion = useReducedMotion();
  const featured = blogListing.find((e) => e.featured);
  const rest = blogListing.filter((e) => !e.featured);

  const cardVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: { delay: 0.06 * i, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
        }),
      };

  const postHref = (e: (typeof blogListing)[0]) =>
    e.href ?? (e.slug ? `/blog/${e.slug}` : "#");

  return (
    <div className="bg-cream-deep">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-[var(--border)] px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 md:pb-28 md:pt-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 90% 70% at 10% 0%, rgba(125, 170, 138, 0.12), transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(30, 40, 50, 0.05), transparent 40%)
            `,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--gold)]"
          >
            Blog
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.05 }}
            className="mt-3 max-w-3xl font-[var(--font-cormorant)] text-[clamp(2.5rem,7vw,4.25rem)] font-semibold leading-[1.02] tracking-tight text-[var(--text-primary)]"
          >
            Notes on{" "}
            <span className="font-normal italic text-muted">home, faith &amp; craft</span>
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.12 }}
            className="mt-6 max-w-xl font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-muted"
          >
            Practical guides and quiet thoughts from Artzen — wall art, MDF care, and how we ship across
            Pakistan.
          </motion.p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        {featured && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mb-12 md:mb-16"
          >
            <Link
              href={postHref(featured)}
              className="group relative block overflow-hidden rounded-[var(--radius)] border border-[var(--border-dark)] bg-[var(--slate)] no-underline shadow-[var(--shadow-lg)] transition hover:border-[var(--border-accent)]"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage: `linear-gradient(rgba(125,170,138,0.35) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(125,170,138,0.35) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
                aria-hidden
              />
              <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center md:gap-12 md:p-12 lg:p-14">
                <div>
                  <span className="inline-block rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-3 py-1 font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-wider text-[var(--sage-light)]">
                    Featured · {featured.category}
                  </span>
                  <h2 className="mt-5 font-[var(--font-cormorant)] text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight text-[var(--text-on-dark)] transition group-hover:text-[var(--sage-light)]">
                    {featured.title}
                  </h2>
                  <p className="mt-4 font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-[var(--text-on-dark-muted)]">
                    {featured.excerpt}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 font-[var(--font-dm-sans)] text-[13px] font-semibold text-[var(--sage)] transition group-hover:gap-3">
                    Read guide
                    <span aria-hidden>→</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border-dark)] pt-6 font-[var(--font-dm-sans)] text-[12px] text-[var(--text-on-dark-muted)] md:border-t-0 md:border-l md:border-[var(--border-dark)] md:pl-10 md:pt-0">
                  <span>{featured.dateLabel}</span>
                  <span className="text-[var(--sage)]/50">·</span>
                  <span>{featured.readTime} read</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <p className="mb-6 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
          More articles
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {rest.map((post, i) => (
            <motion.div
              key={post.slug ?? post.href}
              custom={i}
              variants={cardVariants}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.15 }}
            >
              <Link
                href={postHref(post)}
                className="group flex h-full flex-col rounded-[var(--radius)] border border-[var(--border-mid)] bg-[var(--bg-card)] p-7 shadow-[var(--shadow-card)] no-underline transition hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-hover)]"
              >
                <span className="font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  {post.category}
                </span>
                <h3 className="mt-3 flex-1 font-[var(--font-cormorant)] text-xl font-semibold leading-snug text-[var(--text-primary)] transition group-hover:text-[var(--accent)] sm:text-[1.35rem]">
                  {post.title}
                </h3>
                <p className="mt-3 font-[var(--font-dm-sans)] text-[13px] font-light leading-relaxed text-[var(--muted)] line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5 font-[var(--font-dm-sans)] text-[11px] text-[var(--muted)]">
                  <span>{post.dateLabel}</span>
                  <span className="font-medium text-[var(--text-primary)] transition group-hover:text-[var(--accent)]">
                    Read →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-14 text-center sm:px-6">
        <p className="font-[var(--font-cormorant)] text-xl text-[var(--text-primary)] sm:text-2xl">
          Ready to find your piece?
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--slate)] px-7 py-3 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--off-white)] no-underline transition hover:bg-[var(--slate-soft)] hover:[-translate-y-px]"
        >
          Browse the shop
          <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
