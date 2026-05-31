"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getLiveCatalogJsonUrl } from "@/lib/catalog-live-url";
import { parseCatalogJsonPayload, type CatalogPayload } from "@/lib/parse-catalog-json";

type Status = "idle" | "loading" | "ok" | "error";

type CatalogLiveValue = {
  catalog: CatalogPayload | null;
  status: Status;
  error: string | null;
  refresh: () => void;
};

const CatalogLiveContext = createContext<CatalogLiveValue | null>(null);

export function CatalogLiveProvider({ children }: { children: React.ReactNode }) {
  const url = useMemo(() => getLiveCatalogJsonUrl(), []);
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [status, setStatus] = useState<Status>(url ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [fetchGen, setFetchGen] = useState(0);

  const refresh = useCallback(() => {
    setFetchGen((g) => g + 1);
  }, []);

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      setCatalog(null);
      setError(null);
      return;
    }

    const ac = new AbortController();
    setStatus("loading");
    setError(null);

    (async () => {
      try {
        const res = await fetch(url, {
          signal: ac.signal,
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Catalog HTTP ${res.status}: ${t.slice(0, 200)}`);
        }
        const json: unknown = await res.json();
        const parsed = parseCatalogJsonPayload(json);
        if (ac.signal.aborted) return;
        setCatalog(parsed);
        setStatus("ok");
      } catch (e) {
        if (ac.signal.aborted) return;
        const msg = e instanceof Error ? e.message : "Catalog fetch failed.";
        setError(msg);
        setStatus("error");
        setCatalog(null);
      }
    })();

    return () => ac.abort();
  }, [url, fetchGen]);

  const value = useMemo<CatalogLiveValue>(
    () => ({
      catalog,
      status,
      error,
      refresh,
    }),
    [catalog, status, error, refresh]
  );

  return (
    <CatalogLiveContext.Provider value={value}>{children}</CatalogLiveContext.Provider>
  );
}

/** Live catalog from DB JSON when `NEXT_PUBLIC_CATALOG_JSON_URL` is set; otherwise idle with null catalog. */
export function useCatalogLive(): CatalogLiveValue {
  const ctx = useContext(CatalogLiveContext);
  if (!ctx) {
    return {
      catalog: null,
      status: "idle",
      error: null,
      refresh: () => {},
    };
  }
  return ctx;
}
