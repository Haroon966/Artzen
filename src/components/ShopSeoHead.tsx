"use client";

import { useEffect } from "react";
import { shopUrlShouldNoindex } from "@/lib/seo-metadata";
import { canonicalUrl } from "@/lib/site";

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Static export serves one HTML shell for `/shop/` query variants.
 * This keeps filter/sort/search URLs on `noindex,follow` + shop canonical in the live document.
 */
export function ShopSeoHead() {
  useEffect(() => {
    function sync() {
      const params = Object.fromEntries(new URLSearchParams(window.location.search));
      if (!shopUrlShouldNoindex(params)) return;
      upsertMeta("robots", "noindex, follow");
      upsertCanonical(canonicalUrl("/shop"));
    }
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return null;
}
