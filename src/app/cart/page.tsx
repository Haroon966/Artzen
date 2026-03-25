import type { Metadata } from "next";
import Link from "next/link";
import { getSiteOrigin } from "@/lib/site";
import { CartContent } from "./CartContent";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your cart at Artzen. Review items and checkout with Cash on Delivery.",
  alternates: { canonical: `${getSiteOrigin()}/cart` },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-cream-deep">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 0% -10%, rgba(201, 168, 76, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(15, 15, 15, 0.06), transparent)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[var(--gold)] via-[var(--gold)]/40 to-transparent sm:w-1"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <nav
          className="mb-8 flex items-center gap-2 font-[var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-[var(--dark)]/70 no-underline transition hover:text-[var(--dark)]"
          >
            Home
          </Link>
          <span className="text-[var(--gold)]" aria-hidden>
            /
          </span>
          <span className="text-[var(--dark)]">Cart</span>
        </nav>

        <header className="mb-10 max-w-2xl lg:mb-14">
          <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
            Shopping bag
          </p>
          <h1 className="mt-2 font-[var(--font-cormorant)] text-[clamp(2.25rem,5.5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-[var(--dark)]">
            Your cart
          </h1>
          <p className="mt-3 max-w-md font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-[var(--muted)]">
            Review your order — pay only on delivery, anywhere in Pakistan.
          </p>
        </header>

        <CartContent />
      </div>
    </div>
  );
}
