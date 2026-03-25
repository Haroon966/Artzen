import Link from "next/link";
import type { NavLinkItem } from "@/components/Header";

const WA = "https://wa.me/923315856777";

const label =
  "font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage)]";

const linkBase =
  "font-[var(--font-dm-sans)] text-[13px] text-[var(--text-on-dark-link)] no-underline transition-all duration-[250ms] ease hover:text-[var(--text-on-dark)] hover:underline hover:decoration-[var(--accent)] hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

const divider = "border-[var(--border-dark)]";

const pillSurface =
  "rounded-full border border-[var(--border-dark)] bg-[rgba(245,245,240,0.08)] px-3 py-1.5 font-[var(--font-dm-sans)] text-[12px] font-medium tracking-wide text-[var(--text-on-dark)]";

export function Footer({ categoryLinks }: { categoryLinks: NavLinkItem[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[var(--bg-dark)]">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--sage)]/[0.08]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 -translate-x-1/3 translate-y-1/3 bg-[var(--sage)]/[0.06]"
        style={{ borderRadius: "2px" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-[var(--font-cormorant)] text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-wide text-[var(--text-on-dark)] no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              <span
                className="flex h-6 w-6 items-center justify-center text-[var(--accent-hover)]"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2l1.8 5.4H19l-4.3 3.2 1.6 5.4L12 13l-4.3 3 1.6-5.4L5 7.4h5.2z" />
                </svg>
              </span>
              Artzen
            </Link>
            <p className="mt-5 max-w-sm font-[var(--font-dm-sans)] text-[15px] font-normal leading-[1.7] text-[var(--text-on-dark-muted)]">
              Pakistan&apos;s online store for home decor, wall art, gifts, and more.
              Cash on Delivery nationwide — shop with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className={pillSurface}>COD</span>
              <span className={pillSurface}>Nationwide delivery</span>
              <span className={pillSurface}>WhatsApp support</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className={label}>Shop</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/shop" className={linkBase}>
                  All products
                </Link>
              </li>
              {categoryLinks.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkBase}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {categoryLinks.length > 6 && (
                <li>
                  <Link
                    href="/shop"
                    className={`${linkBase} text-[var(--accent-hover)] hover:text-[var(--text-on-dark)]`}
                  >
                    View all categories →
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/shop?sale=1"
                  className={`${linkBase} font-semibold text-[var(--red)] hover:text-[var(--sage-light)]`}
                >
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className={label}>Company</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/about" className={linkBase}>
                  About us
                </Link>
              </li>
              <li>
                <Link href="/blog" className={linkBase}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guide" className={linkBase}>
                  Shopping guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkBase}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/cod" className={linkBase}>
                  Cash on Delivery
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className={label}>Get in touch</h2>
            <p className="mt-5 font-[var(--font-dm-sans)] text-[13px] leading-relaxed text-[var(--text-on-dark-muted)]">
              Questions or order help? Message us on WhatsApp — we reply fast.
            </p>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 font-[var(--font-dm-sans)] text-[13px] font-semibold text-[var(--off-white)] no-underline shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all duration-[250ms] ease hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <svg className="h-5 w-5 shrink-0 text-[var(--off-white)]" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
              WhatsApp us
            </a>
            <p className="mt-4 font-[var(--font-dm-sans)] text-[13px] text-[var(--text-on-dark-muted)]">
              +92 331 5856777
            </p>
          </div>
        </div>

        <div
          className={`mt-14 flex flex-col items-center justify-between gap-6 border-t ${divider} pt-10 sm:flex-row sm:items-center`}
        >
          <p className="text-center font-[var(--font-dm-sans)] text-[13px] text-[var(--text-on-dark-muted)] sm:text-left">
            © {year} Artzen. All rights reserved. Made with care in Pakistan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/shop" className={`${linkBase} text-[12px]`}>
              Shop
            </Link>
            <Link href="/contact" className={`${linkBase} text-[12px]`}>
              Contact
            </Link>
            <Link href="/cart" className={`${linkBase} text-[12px]`}>
              Cart
            </Link>
            <Link href="/favorites" className={`${linkBase} text-[12px]`}>
              Favourites
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
