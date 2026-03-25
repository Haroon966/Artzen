"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "no-auth" | "misconfigured">(
    "loading"
  );

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setState("misconfigured");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState("no-auth");
        router.replace("/admin/login");
        return;
      }
      try {
        const { claims } = await getIdTokenResult(user, true);
        if (claims.admin !== true) {
          setState("no-auth");
          router.replace("/admin/login");
          return;
        }
        setState("ok");
      } catch {
        setState("no-auth");
        router.replace("/admin/login");
      }
    });
    return () => unsub();
  }, [router]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-[var(--font-dm-sans)] text-sm text-[var(--text-muted)]">
        Loading…
      </div>
    );
  }

  if (state === "misconfigured") {
    return (
      <div className="mx-auto max-w-lg p-8 font-[var(--font-dm-sans)] text-sm text-red-800">
        Firebase client is not configured. Set{" "}
        <code className="rounded bg-black/5 px-1">NEXT_PUBLIC_FIREBASE_*</code> in{" "}
        <code className="rounded bg-black/5 px-1">.env.local</code> (see FIREBASE_SETUP.md).
      </div>
    );
  }

  if (state !== "ok") return null;

  return <>{children}</>;
}
