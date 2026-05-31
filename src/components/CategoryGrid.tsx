"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Collection } from "@/lib/data";
import { productCatalogImageUrlIsPng } from "@/lib/catalog-queries";
import { collectionTaglines, getCollectionDisplayName } from "@/lib/data";
import { CatalogImageWatermark } from "@/components/CatalogImageWatermark";
import {
  catalogImageProtectClassName,
  productImageInteractionProps,
} from "@/lib/image-protection";

const MotionLink = motion(Link);
const SLIDE_INTERVAL_MS = 3000;

function CategoryCardSlides({ slides }: { slides: string[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length, reduceMotion]);

  const displayIndex = reduceMotion ? 0 : active;

  if (slides.length === 0) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#3d3a36] via-[#2a2825] to-[#1a1917]"
        aria-hidden
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 transition duration-700 ease-out will-change-transform group-hover:scale-[1.05]">
        {slides.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: idx === displayIndex ? 1 : 0,
              zIndex: idx === displayIndex ? 1 : 0,
            }}
            aria-hidden={idx !== displayIndex}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 200px"
              {...productImageInteractionProps}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[5]">
        <CatalogImageWatermark variant="category" />
      </div>
    </div>
  );
}

function taglineFor(collection: Collection): string {
  return (
    collection.description?.trim() ||
    collectionTaglines[collection.slug] ||
    `Explore ${getCollectionDisplayName(collection.slug, collection.name)}.`
  );
}

export function CategoryGrid({
  collections,
  slidesBySlug,
}: {
  collections: Collection[];
  /** Server-built image URLs per collection slug (rotates every few seconds). */
  slidesBySlug: Record<string, string[]>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ul className="category-grid-root grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(144px,1fr))] sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(152px,1fr))] md:gap-3.5">
      {collections.map((collection) => {
        const slides = (slidesBySlug[collection.slug]?.filter(Boolean) ?? []).filter(
          (u) => !productCatalogImageUrlIsPng(u)
        );
        const title = getCollectionDisplayName(collection.slug, collection.name);

        return (
          <li key={collection.slug} className="min-w-0">
            <MotionLink
              href={`/collections/${collection.slug}`}
              className={`group relative flex aspect-[5/7] w-full flex-col overflow-hidden rounded-lg border border-black/[0.08] bg-[#1a1917] text-left shadow-sm transition-[border-color,box-shadow,transform] hover:border-[var(--border-accent)] hover:shadow-md ${catalogImageProtectClassName}`}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.998 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <CategoryCardSlides slides={slides} />
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/45 via-[42%] to-transparent"
                aria-hidden
              />
              <div className="relative z-[2] mt-auto flex w-full flex-col justify-end p-2.5 pt-14 sm:p-3 sm:pt-16">
                <h3 className="font-[var(--font-cormorant)] text-[clamp(0.95rem,2.8vw,1.2rem)] font-semibold leading-[1.12] tracking-tight text-white drop-shadow-md [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                  {title}
                </h3>
                <p className="mt-1 line-clamp-2 font-[var(--font-dm-sans)] text-[10px] font-normal leading-snug text-white/80 sm:text-[11px]">
                  {taglineFor(collection)}
                </p>
              </div>
            </MotionLink>
          </li>
        );
      })}
    </ul>
  );
}
