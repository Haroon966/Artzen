"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/CartContext";

const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function QtyStepper({
  name,
  quantity,
  onChange,
}: {
  name: string;
  quantity: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-black/[0.1] bg-cream-soft p-0.5 shadow-inner">
      <button
        type="button"
        aria-label={`Decrease quantity of ${name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full font-[var(--font-dm-sans)] text-lg leading-none text-[var(--dark)] transition hover:bg-white hover:shadow-sm disabled:opacity-35"
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </button>
      <span
        className="min-w-[2rem] text-center font-[var(--font-dm-sans)] text-[13px] font-medium tabular-nums text-[var(--dark)]"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full font-[var(--font-dm-sans)] text-lg leading-none text-[var(--dark)] transition hover:bg-white hover:shadow-sm"
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

export function CartContent() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const reduceMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-[var(--radius)] border border-black/[0.06] bg-coffee-bean-deep px-8 py-14 text-center shadow-[0_32px_64px_-24px_rgba(0,0,0,0.35)] sm:px-14 sm:py-20"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--gold)]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-1/2 h-32 w-64 -translate-x-1/2 bg-[var(--gold)]/5 blur-2xl"
          aria-hidden
        />
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold2)]"
          aria-hidden
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <p className="font-[var(--font-cormorant)] text-2xl font-semibold text-cream-soft sm:text-3xl">
          Nothing here yet
        </p>
        <p className="mx-auto mt-3 max-w-sm font-[var(--font-dm-sans)] text-[14px] font-light leading-relaxed text-cream-deep/75">
          Browse wall art, gifts, and more — your next favourite find is a tap away.
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-[var(--gold)] px-8 py-3.5 font-[var(--font-dm-sans)] text-[14px] font-medium text-coffee-bean no-underline shadow-lg shadow-[var(--gold)]/20 transition hover:bg-[var(--gold2)] hover:[-translate-y-px]"
        >
          Discover the shop
          <span className="text-lg leading-none" aria-hidden>
            →
          </span>
        </Link>
        <p className="mt-8 font-[var(--font-dm-sans)] text-[11px] uppercase tracking-[0.2em] text-cream-deep/60">
          Cash on delivery · Nationwide
        </p>
      </motion.div>
    );
  }

  const listVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.07, delayChildren: 0.05 },
        },
      };

  const itemVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
        },
      };

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-10 xl:grid-cols-[1fr_380px] xl:gap-12">
      <motion.ul
        className="space-y-4 lg:space-y-5"
        variants={reduceMotion ? undefined : listVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? false : "visible"}
      >
        {items.map((item) => (
          <motion.li key={item.id} variants={reduceMotion ? undefined : itemVariants}>
            <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-black/[0.07] bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] sm:flex-row sm:items-stretch">
              <div
                className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-[var(--gold)] to-[var(--gold)]/40 sm:block"
                aria-hidden
              />
              <Link
                href={`/products/${item.slug}`}
                className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-cream-deep sm:aspect-auto sm:w-36 sm:max-w-[9rem] md:w-40"
              >
                <Image
                  src={item.image || PLACEHOLDER_IMAGE}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width:640px) 100vw, 160px"
                  unoptimized
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-5 py-5 sm:px-6 sm:py-5">
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-[var(--font-cormorant)] text-[1.25rem] font-semibold leading-snug text-[var(--dark)] no-underline transition hover:text-[var(--gold)] md:text-xl line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] font-light text-[var(--muted)]">
                    {formatPrice(item.price)} each
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <QtyStepper
                    name={item.name}
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(item.id, q)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="font-[var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)] underline decoration-black/20 underline-offset-4 transition hover:text-[#8b2525] hover:decoration-[#8b2525]/40"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4 sm:w-[7.5rem] sm:shrink-0 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-4 sm:py-5">
                <span className="font-[var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] sm:order-2 sm:mt-1">
                  Line total
                </span>
                <p className="font-[var(--font-cormorant)] text-xl font-semibold text-[var(--dark)] sm:order-1 sm:text-2xl">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </article>
          </motion.li>
        ))}
      </motion.ul>

      <aside className="mt-10 lg:sticky lg:top-28 lg:mt-0">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.15 }}
          className="relative overflow-hidden rounded-[var(--radius)] border border-white/10 bg-coffee-bean-deep p-8 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.4)]"
        >
          <div
            className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-[var(--gold)]/8 blur-2xl"
            aria-hidden
          />
          <p className="font-[var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--gold)]">
            Order summary
          </p>
          <div className="mt-6 space-y-3 border-b border-white/10 pb-6 font-[var(--font-dm-sans)] text-[14px]">
            <div className="flex justify-between text-cream-deep/70">
              <span>Items ({totalItems})</span>
              <span className="tabular-nums text-cream-deep">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-cream-deep/65">
              <span>Delivery</span>
              <span className="text-[var(--gold2)]">At COD</span>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between gap-4">
            <span className="font-[var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-wider text-cream-deep/65">
              Estimated total
            </span>
            <p className="text-right font-[var(--font-cormorant)] text-3xl font-semibold text-cream-soft">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] py-3.5 font-[var(--font-dm-sans)] text-[14px] font-semibold text-coffee-bean no-underline transition hover:bg-[var(--gold2)] hover:shadow-lg hover:shadow-[var(--gold)]/15"
          >
            Proceed to checkout
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/shop"
            className="mt-3 block w-full rounded-full border border-white/15 py-3 text-center font-[var(--font-dm-sans)] text-[13px] font-medium text-cream-deep/80 no-underline transition hover:border-white/25 hover:bg-white/5 hover:text-cream-soft"
          >
            Continue shopping
          </Link>
          <p className="mt-6 text-center font-[var(--font-dm-sans)] text-[12px] font-light leading-relaxed text-cream-deep/70">
            Pay when your order arrives — no advance required.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
