import type { Metadata } from "next";
import Link from "next/link";
import { getSiteOrigin, SITE_BRAND } from "@/lib/site";

const origin = getSiteOrigin();

export const metadata: Metadata = {
  title: "Page Not Found",
  description: `The page you are looking for could not be found on ${SITE_BRAND}.`,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: `${origin}/404` },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="font-[var(--font-dm-sans)] text-xs font-medium uppercase tracking-[0.18em] text-[var(--gold)]">
        404 error
      </p>
      <h1 className="mt-3 font-[var(--font-cormorant)] text-4xl font-semibold text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
        This URL does not exist anymore or may have been typed incorrectly.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--slate)] px-6 py-2.5 text-sm font-medium text-[var(--off-white)] no-underline transition hover:bg-[var(--slate-soft)]"
        >
          Go to homepage
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-[var(--border-mid)] bg-[var(--off-white)] px-6 py-2.5 text-sm font-medium text-[var(--text-primary)] no-underline transition hover:border-[var(--border-accent)]"
        >
          Browse products
        </Link>
      </div>
    </section>
  );
}
