"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface FavoritesContextValue {
  ids: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = "artzen-favorites";

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Start empty so SSR + first client paint match; hydrate from localStorage after mount.
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(loadIds());
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      saveIds(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => ids.includes(productId),
    [ids]
  );

  const value = useMemo(
    () => ({
      ids,
      toggleFavorite,
      isFavorite,
      count: ids.length,
    }),
    [ids, toggleFavorite, isFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
