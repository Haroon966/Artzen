import Link from "next/link";

const cards = [
  {
    href: "/admin/orders",
    title: "Orders",
    desc: "Track order flow and update shipping status.",
  },
  {
    href: "/admin/products",
    title: "Products",
    desc: "Manage product details, pricing, and image assets.",
  },
  {
    href: "/admin/collections",
    title: "Collections",
    desc: "Curate categories and keep storefront sections organized.",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <section>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage-deep)]">
          Control Center
        </p>
        <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-semibold leading-tight sm:text-5xl">
          Admin dashboard
        </h1>
        <p className="mt-3 max-w-2xl font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
          Review and manage catalog operations from one place. Choose a section below to continue.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 font-[var(--font-dm-sans)] no-underline shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Open</div>
            <h2 className="mt-2 font-[var(--font-cormorant)] text-2xl text-[var(--text-primary)]">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{card.desc}</p>
            <span className="mt-4 inline-flex text-sm font-medium text-[var(--sage-deep)] transition group-hover:text-[var(--accent-deep)]">
              Go to {card.title} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
