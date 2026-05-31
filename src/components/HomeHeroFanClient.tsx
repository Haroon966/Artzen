"use client";

import { useMemo } from "react";
import type { HeroStripItem } from "@/lib/data";
import * as q from "@/lib/catalog-queries";
import { useCatalogLive } from "@/context/CatalogLiveContext";
import { HeroProductFan } from "@/components/HeroProductFan";

export function HomeHeroFanClient({ heroStripItems }: { heroStripItems: HeroStripItem[] }) {
  const { catalog } = useCatalogLive();
  const items = useMemo(() => {
    if (!catalog) return heroStripItems;
    return q.getHeroStripProductsFrom(catalog.products);
  }, [catalog, heroStripItems]);

  return (
    <div className="card-strip mt-10 hidden md:mt-14 md:block">
      <HeroProductFan items={items} />
    </div>
  );
}
