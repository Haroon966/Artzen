"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

export function AdminHeaderAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setUser(null);
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  async function logout() {
    const auth = getClientAuth();
    if (!auth || busy) return;
    setBusy(true);
    try {
      await signOut(auth);
      router.push("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const linkClass =
    "rounded-full border border-[var(--border-dark)] px-3 py-1.5 font-[var(--font-dm-sans)] text-[13px] text-[var(--off-white)]/85 no-underline transition hover:border-[var(--border-accent)] hover:text-[var(--off-white)]";

  if (!ready) {
    return (
      <span className="font-[var(--font-dm-sans)] text-[13px] text-[var(--text-muted)] opacity-50">
        …
      </span>
    );
  }

  if (user) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void logout()}
        className={`${linkClass} cursor-pointer bg-transparent disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {busy ? "Signing out…" : "Log out"}
      </button>
    );
  }

  return (
    <Link href="/admin/login" className={linkClass}>
      Login
    </Link>
  );
}
