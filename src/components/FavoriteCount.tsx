"use client";

import { useFavorites } from "@/context/FavoritesContext";

export function FavoriteCount() {
  const { count } = useFavorites();
  if (count < 1) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c45c6a] px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
