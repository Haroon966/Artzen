import Link from "next/link";
import { SITE_BRAND } from "@/lib/site";

const link =
  "font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--text-primary)] no-underline underline-offset-4 transition hover:underline hover:decoration-[var(--sage)]";

export function HomeTrustStrip() {
  return (
    <section
      aria-label="Store policies and about"
      className="border-b border-[var(--border-mid)] bg-[var(--cream-soft)] px-4 py-3.5 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center sm:justify-between sm:text-left">
        <p className="m-0 w-full font-[var(--font-dm-sans)] text-[12.5px] leading-snug text-[var(--muted)] sm:w-auto">
          Shop with confidence — learn who we are and how we handle your data.
        </p>
        <nav
          aria-label="Trust and legal"
          className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:w-auto sm:justify-end"
        >
          <Link href="/about" className={link}>
            About {SITE_BRAND}
          </Link>
          <span className="text-[var(--border-mid)]" aria-hidden>
            ·
          </span>
          <Link href="/privacy-policy" className={link}>
            Privacy policy
          </Link>
          <span className="text-[var(--border-mid)]" aria-hidden>
            ·
          </span>
          <Link href="/terms" className={link}>
            Terms &amp; conditions
          </Link>
        </nav>
      </div>
    </section>
  );
}
