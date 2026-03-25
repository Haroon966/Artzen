"use client";

import { motion, useReducedMotion } from "framer-motion";

const pillars = [
  {
    n: "01",
    title: "Cash on Delivery",
    body: "Pay only when your piece arrives. No advance, no surprises — just trust, the Pakistani way.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 18.75v-9.75m0 9.75c0 .621.504 1.125 1.125 1.125h10.5c.621 0 1.125-.504 1.125-1.125m-12 0h.008v.008h-.008v-.008zm0-3h.008v.008h-.008v-.008zm0-3h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Nationwide delivery",
    body: "Lahore to Karachi and beyond — cushioned packaging so every edge arrives gallery-perfect.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.108-.752M9 6.75h.008v.008H9V6.75zm-3 3h.008v.008H6V9.75zm-3 3h.008v.008H3v-.008zm0-3h.008v.008H3V9.75zm0-3h.008v.008H3V6.75zm12 3h.008v.008H15V9.75zm-3 3h.008v.008H12v-.008zm0-3h.008v.008H12V9.75zm0-3h.008v.008H12V6.75zm3 3h.008v.008H15V9.75zm0 3h.008v.008H15v-.008z"
        />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Quality you feel",
    body: "We curate and check what we sell — from wall art to gifts — so you get pieces worth keeping.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
];

export function WhyArtzen() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-coffee-bean-deep py-16 sm:py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.12)_0%,transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-xl md:mb-16">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45 }}
            className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]"
          >
            The Artzen difference
          </motion.p>
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 font-[var(--font-cormorant)] text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.12] tracking-tight text-cream-soft"
          >
            Why homes across Pakistan{" "}
            <span className="text-[var(--gold)]">choose Artzen</span>
          </motion.h2>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-4 max-w-md font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-cream-deep/80"
          >
            Honest service, nationwide COD, and products we&apos;re proud to put our name on.
          </motion.p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {pillars.map((p, i) => (
            <motion.article
              key={p.n}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group relative flex flex-col rounded-[var(--radius)] border border-white/[0.08] bg-white/[0.03] p-7 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-[2px] transition-colors hover:border-[var(--gold)]/25 hover:bg-white/[0.05]"
            >
              <span
                className="pointer-events-none absolute right-5 top-5 font-[var(--font-cormorant)] text-[4.5rem] font-semibold leading-none text-white/[0.04] transition-colors group-hover:text-[var(--gold)]/[0.07]"
                aria-hidden
              >
                {p.n}
              </span>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold2)]">
                {p.icon}
              </div>
              <h3 className="font-[var(--font-cormorant)] text-xl font-semibold text-cream-soft">{p.title}</h3>
              <p className="mt-2 flex-1 font-[var(--font-dm-sans)] text-[14px] font-light leading-relaxed text-cream-deep/75">
                {p.body}
              </p>
              <div className="mt-6 h-px w-12 bg-gradient-to-r from-[var(--gold)] to-transparent opacity-60" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
