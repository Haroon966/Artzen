"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const { claims } = await getIdTokenResult(user, true);
      if (claims.admin === true) {
        router.replace("/admin/dashboard");
      }
    });
    return () => unsub();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const auth = getClientAuth();
    if (!auth) {
      setError("Firebase client not configured.");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = auth.currentUser;
      if (user) {
        const { claims } = await getIdTokenResult(user, true);
        if (claims.admin !== true) {
          setError(
            'Signed in, but this account does not have the admin custom claim yet. In a terminal from the project folder run: npm run admin:set-claim -- your@email.com (or your Auth UID). Uses the same service account as .env.local. Then click “Refresh token” below or sign out and sign in again.'
          );
          return;
        }
      }
      router.replace("/admin/dashboard");
    } catch {
      setError(
        "Sign-in failed. Check credentials and admin custom claim (npm run admin:set-claim)."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-md)] sm:p-8">
      <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage-deep)]">
        Secure area
      </p>
      <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-semibold sm:text-5xl">Admin sign in</h1>
      <p className="mt-3 font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
        Use Firebase Auth credentials. If claims are missing, run{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">npm run admin:set-claim -- your@email.com</code>
        .
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="adm-email" className="block text-sm font-medium text-[var(--text-primary)]">
            Email
          </label>
          <input
            id="adm-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
            required
          />
        </div>
        <div>
          <label htmlFor="adm-pass" className="block text-sm font-medium text-[var(--text-primary)]">
            Password
          </label>
          <input
            id="adm-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
            required
          />
        </div>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-[var(--slate)] py-3 text-sm font-medium text-[var(--off-white)] transition hover:bg-[var(--slate-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center font-[var(--font-dm-sans)] text-xs text-[var(--text-muted)]">
        <button
          type="button"
          className="text-[var(--sage-deep)] underline-offset-2 transition hover:text-[var(--accent-deep)] hover:underline"
          onClick={async () => {
            const auth = getClientAuth();
            const user = auth?.currentUser;
            if (!auth || !user) return;
            setError(null);
            const { claims } = await getIdTokenResult(user, true);
            if (claims.admin === true) {
              router.replace("/admin/dashboard");
            } else {
              setError(
                'Token refreshed, but admin claim is still missing. Run: npm run admin:set-claim -- your@email.com (Firebase Console → Authentication lists UID if you prefer that).'
              );
            }
          }}
        >
          Refresh token
        </button>
        {" · "}
        <button
          type="button"
          className="text-[var(--sage-deep)] underline-offset-2 transition hover:text-[var(--accent-deep)] hover:underline"
          onClick={async () => {
            const auth = getClientAuth();
            if (auth) await signOut(auth);
          }}
        >
          Sign out
        </button>
        {" · "}
        <Link
          href="/"
          className="text-[var(--sage-deep)] underline-offset-2 transition hover:text-[var(--accent-deep)] hover:underline"
        >
          Home
        </Link>
      </p>
    </div>
  );
}
