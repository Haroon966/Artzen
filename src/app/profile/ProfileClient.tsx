"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  listOrdersFromHistory,
  type StoredOrderHistoryRecord,
} from "@/lib/order-history-db";

type LoadState = "loading" | "ready";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl space-y-6" aria-busy="true" aria-label="Loading order history">
      <div className="animate-pulse rounded-[var(--radius)] border border-black/[0.08] bg-white/90 p-6 shadow-[var(--shadow-card)]">
        <div className="h-4 w-40 rounded bg-[var(--dark)]/10" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="h-10 rounded bg-[var(--dark)]/8" />
          <div className="h-10 rounded bg-[var(--dark)]/8" />
          <div className="h-10 rounded bg-[var(--dark)]/8 sm:col-span-2" />
        </div>
      </div>
      <div className="animate-pulse rounded-[var(--radius)] border border-black/[0.08] bg-white/90 p-6 shadow-[var(--shadow-card)]">
        <div className="h-4 w-32 rounded bg-[var(--dark)]/10" />
        <div className="mt-4 space-y-3">
          <div className="h-28 rounded-lg bg-[var(--dark)]/6" />
          <div className="h-28 rounded-lg bg-[var(--dark)]/6" />
        </div>
      </div>
    </div>
  );
}

export function ProfileClient() {
  const [orders, setOrders] = useState<StoredOrderHistoryRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    const load = () => {
      void listOrdersFromHistory().then((records) => {
        if (!active) return;
        setOrders(records);
        setState("ready");
      });
    };

    load();

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const lastDetails = useMemo(() => orders[0]?.customer ?? null, [orders]);

  const cardSurface =
    "rounded-[var(--radius)] border border-black/[0.08] bg-white/90 shadow-[var(--shadow-card)]";

  if (state === "loading") {
    return <ProfileSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl">
        <div
          className={`${cardSurface} px-8 py-14 text-center`}
          role="status"
          aria-live="polite"
        >
          <p className="font-[var(--font-cormorant)] text-xl text-[var(--dark)]">
            No orders saved here yet
          </p>
          <p className="mx-auto mt-2 max-w-sm font-[var(--font-dm-sans)] text-[14px] leading-relaxed text-[var(--muted)]">
            After you complete checkout on this browser, your order reference, items, and delivery
            details will show up here automatically.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-[var(--dark)] px-8 py-3 font-[var(--font-dm-sans)] text-[14px] font-medium text-white no-underline transition hover:bg-coffee-hover"
            >
              Browse shop
            </Link>
            <Link
              href="/checkout"
              className="inline-flex rounded-full border border-[var(--border-mid)] bg-white/80 px-8 py-3 font-[var(--font-dm-sans)] text-[14px] font-medium text-[var(--dark)] no-underline transition hover:bg-[var(--bg-card)]"
            >
              Go to checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <section className={cardSurface} aria-labelledby="profile-last-details-heading">
        <div className="border-b border-black/[0.06] px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="profile-last-details-heading"
            className="font-[var(--font-cormorant)] text-xl font-semibold text-[var(--dark)] sm:text-2xl"
          >
            Last used delivery details
          </h2>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] text-[var(--muted)]">
            From your most recent order on this device.
          </p>
        </div>
        {lastDetails ? (
          <dl className="grid gap-4 px-5 py-5 font-[var(--font-dm-sans)] text-[14px] text-[var(--dark)] sm:grid-cols-2 sm:px-6 sm:py-6">
            <div className="space-y-1">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Full name
              </dt>
              <dd className="leading-snug">{lastDetails.name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Phone
              </dt>
              <dd className="leading-snug">{lastDetails.phone}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                City
              </dt>
              <dd className="leading-snug">{lastDetails.city}</dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Address
              </dt>
              <dd className="whitespace-pre-wrap leading-relaxed">{lastDetails.address}</dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Notes
              </dt>
              <dd className="leading-relaxed text-[var(--dark)]/90">
                {lastDetails.notes.trim() || "—"}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section aria-labelledby="profile-orders-heading">
        <div className="mb-6">
          <h2
            id="profile-orders-heading"
            className="font-[var(--font-cormorant)] text-xl font-semibold text-[var(--dark)] sm:text-2xl"
          >
            Order history
          </h2>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] text-[var(--muted)]">
            {orders.length} {orders.length === 1 ? "order" : "orders"} stored locally — newest first.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {orders.map((order, index) => {
            const orderLabel = `Order ${index + 1} of ${orders.length}`;
            const headingId = `order-${order.orderRef.replace(/[^a-zA-Z0-9_-]/g, "")}-heading`;
            return (
              <article
                key={order.orderRef}
                className={`${cardSurface} overflow-hidden`}
                aria-labelledby={headingId}
              >
                <div className="flex flex-col gap-3 border-b border-black/[0.06] bg-[var(--bg-card)]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p
                      id={headingId}
                      className="font-[var(--font-dm-sans)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--gold)]"
                    >
                      {orderLabel}
                    </p>
                    <p className="mt-1 font-mono text-[16px] font-semibold tracking-wide text-[var(--dark)]">
                      {order.orderRef}
                    </p>
                  </div>
                  <time
                    dateTime={order.createdAt}
                    className="font-[var(--font-dm-sans)] text-[13px] text-[var(--muted)]"
                  >
                    {formatDateTime(order.createdAt)}
                  </time>
                </div>

                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <h3 className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                    Items
                  </h3>
                  <ul className="mt-3 space-y-2.5 font-[var(--font-dm-sans)] text-[14px]">
                    {order.items.map((item) => (
                      <li
                        key={`${order.orderRef}-${item.id}-${item.slug}-${item.quantity}`}
                        className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1 border-b border-black/[0.04] pb-2 last:border-0 last:pb-0"
                      >
                        <span className="min-w-0 text-[var(--dark)]">
                          <Link
                            href={`/products/${encodeURIComponent(item.slug)}`}
                            className="font-medium text-[var(--dark)] underline decoration-[var(--border-mid)] underline-offset-2 transition hover:decoration-[var(--gold)]"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[var(--muted)]"> × {item.quantity}</span>
                        </span>
                        <span className="tabular-nums text-[var(--dark)]">
                          {formatPrice(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--bg)]/90 px-4 py-3">
                    <span className="font-[var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                      Order total
                    </span>
                    <span className="font-[var(--font-dm-sans)] text-[17px] font-semibold tabular-nums text-[var(--dark)]">
                      {order.totalFormatted || formatPrice(order.totalNumeric)}
                    </span>
                  </div>

                  <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white/80 px-4 py-4">
                    <h3 className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                      Delivery &amp; contact (this order)
                    </h3>
                    <p className="mt-2 font-[var(--font-dm-sans)] text-[14px] leading-relaxed text-[var(--dark)]">
                      <span className="font-medium">{order.customer.name}</span>
                      <span className="text-[var(--muted)]"> · </span>
                      {order.customer.phone}
                      <span className="text-[var(--muted)]"> · </span>
                      {order.customer.city}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap font-[var(--font-dm-sans)] text-[14px] leading-relaxed text-[var(--dark)]/90">
                      {order.customer.address}
                    </p>
                    <p className="mt-2 font-[var(--font-dm-sans)] text-[13px] text-[var(--muted)]">
                      Notes: {order.customer.notes.trim() || "—"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <p className="font-[var(--font-dm-sans)] text-[12px] leading-relaxed text-[var(--muted)]">
        Clearing site data or using another browser will hide this history. It is not synced to a
        server.
      </p>
    </div>
  );
}
