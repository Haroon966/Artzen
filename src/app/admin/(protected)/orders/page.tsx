"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

type OrderRow = {
  id: string;
  orderRef?: string;
  status?: string;
  totalFormatted?: string;
  customer?: { name?: string; phone?: string; city?: string };
  createdAt?: { seconds?: number };
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setError("Firebase not configured");
      return;
    }
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setToken(null);
        return;
      }
      setToken(await user.getIdToken(true));
    });
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    let res = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      const auth = getClientAuth();
      const refreshed = auth?.currentUser ? await auth.currentUser.getIdToken(true) : null;
      if (refreshed) {
        setToken(refreshed);
        res = await fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${refreshed}` },
        });
      }
    }
    if (!res.ok) {
      if (res.status === 401) {
        const auth = getClientAuth();
        if (auth) await signOut(auth);
        setError("Session expired. Please log in again.");
        router.replace("/admin/login");
        setLoading(false);
        return;
      }
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { orders?: OrderRow[] };
    setOrders(data.orders ?? []);
    setLoading(false);
  }, [token, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    if (!token) return;
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void load();
  }

  return (
    <section>
      <div>
        <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage-deep)]">
          Fulfillment
        </p>
        <h1 className="font-[var(--font-cormorant)] text-4xl font-semibold sm:text-5xl">Orders</h1>
        <p className="mt-2 font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
          {orders.length} order{orders.length === 1 ? "" : "s"} loaded
        </p>
      </div>
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] md:hidden">
        {loading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--off-white-deep)]" />
            ))}
          </div>
        )}
        {!loading && (
          <ul className="divide-y divide-[var(--border)]">
            {orders.map((o) => (
              <li key={o.id} className="space-y-3 p-4 font-[var(--font-dm-sans)] text-[13px]">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[var(--text-primary)]">{o.orderRef ?? o.id}</p>
                  <span className="text-xs text-[var(--text-muted)]">{o.totalFormatted ?? "—"}</span>
                </div>
                <div className="text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)]">{o.customer?.name ?? "Customer"}</p>
                  <p>{o.customer?.phone ?? "No phone"}</p>
                  <p>{o.customer?.city ?? "No city"}</p>
                </div>
                <select
                  className="w-full rounded-lg border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[13px] text-[var(--text-primary)]"
                  value={o.status ?? "new"}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                >
                  {["new", "processing", "shipped", "cancelled"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
        {orders.length === 0 && !error && !loading && (
          <p className="p-6 text-center text-sm text-[var(--text-muted)]">No orders yet.</p>
        )}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] md:block">
        {loading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--off-white-deep)]" />
            ))}
          </div>
        )}
        {!loading && (
        <table className="w-full min-w-[680px] border-collapse font-[var(--font-dm-sans)] text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--off-white-deep)] text-left">
              <th className="p-3 font-medium text-[var(--text-secondary)]">Ref</th>
              <th className="p-3 font-medium text-[var(--text-secondary)]">Customer</th>
              <th className="p-3 font-medium text-[var(--text-secondary)]">Total</th>
              <th className="p-3 font-medium text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[var(--border)]">
                <td className="p-3 font-medium text-[var(--text-primary)]">{o.orderRef ?? o.id}</td>
                <td className="p-3">
                  <span className="font-medium text-[var(--text-primary)]">{o.customer?.name}</span>
                  <br />
                  <span className="text-[var(--text-muted)]">{o.customer?.phone}</span>
                </td>
                <td className="p-3 font-medium text-[var(--text-primary)]">{o.totalFormatted ?? "—"}</td>
                <td className="p-3">
                  <select
                    className="rounded-lg border border-[var(--border-mid)] bg-[var(--bg)] px-2 py-1.5 text-[13px] text-[var(--text-primary)]"
                    value={o.status ?? "new"}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    {["new", "processing", "shipped", "cancelled"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {orders.length === 0 && !error && !loading && (
          <p className="p-6 text-center text-sm text-[var(--text-muted)]">No orders yet.</p>
        )}
      </div>
    </section>
  );
}
