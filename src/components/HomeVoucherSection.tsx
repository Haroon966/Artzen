import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";

export function HomeVoucherSection() {
  return (
    <section className="border-b border-[var(--border-mid)] bg-[var(--bg)] px-4 py-10 sm:px-6 sm:py-12">
      <AnimatedSection as="div" className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-mid)] bg-gradient-to-br from-[var(--sage-muted)]/80 via-[var(--cream)] to-[var(--gold)]/12 p-6 shadow-[var(--shadow-sm)] sm:p-8 md:p-10">
          <div
            className="pointer-events-none absolute -right-12 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[var(--sage)]/10 blur-2xl"
            aria-hidden
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
            <div>
              <p className="font-[var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sage-deep)]">
                Limited-time reward
              </p>
              <h2 className="mt-2 font-[var(--font-cormorant)] text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight text-[var(--text-primary)]">
                Free Rs.&nbsp;2,000 voucher on orders over Rs.&nbsp;7,000
              </h2>
              <p className="mt-3 max-w-xl font-[var(--font-dm-sans)] text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Stock up on Islamic wall art, MDF decor, or gifts in one checkout — hit the threshold
                and we&apos;ll credit a <strong className="font-medium text-[var(--text-primary)]">Rs.&nbsp;2,000 voucher</strong>{" "}
                toward your eligible purchase. Same trusted Cash on Delivery across Pakistan.
              </p>
              <ul className="mt-4 space-y-1.5 font-[var(--font-dm-sans)] text-[13px] text-[var(--muted)]">
                <li>· Applies when your order total is Rs.&nbsp;7,000 or more (before voucher)</li>
                <li>· Voucher terms may be confirmed at checkout or via WhatsApp support</li>
              </ul>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row md:flex-col md:items-stretch">
              <Link
                href="/shop"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--slate)] px-8 py-3 text-center font-[var(--font-dm-sans)] text-[14px] font-semibold text-[var(--off-white)] no-underline shadow-md transition hover:bg-[var(--slate-soft)]"
              >
                Build a Rs.&nbsp;7,000+ order
              </Link>
              <Link
                href="/shop?sale=1"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[var(--border-accent)] bg-[var(--off-white)]/90 px-8 py-3 text-center font-[var(--font-dm-sans)] text-[14px] font-medium text-[var(--text-primary)] no-underline backdrop-blur-sm transition hover:border-[var(--sage)] hover:bg-[var(--bg-card)]"
              >
                Shop sale picks first
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
