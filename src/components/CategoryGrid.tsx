"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Collection } from "@/lib/data";
import {
  collectionTaglines,
  getCollectionCoverImage,
  getCollectionDisplayName,
} from "@/lib/data";

const MotionLink = motion(Link);

const layoutBySlug: Record<string, string> = {
  "wall-decoration":
    "min-h-[280px] sm:min-h-[300px] md:col-span-4 md:row-span-2 md:row-start-1 md:col-start-1 md:min-h-[min(420px,52vh)]",
  "islamic-calligraphy":
    "min-h-[200px] md:col-span-2 md:row-start-1 md:col-start-5 md:min-h-[168px]",
  "premium-islamic-art-collection":
    "min-h-[200px] md:col-span-2 md:row-start-2 md:col-start-5 md:min-h-[168px]",
  "vintage-logo": "min-h-[200px] md:col-span-3 md:row-start-3 md:col-start-1",
  "customize-keychain": "min-h-[200px] md:col-span-3 md:row-start-3 md:col-start-4",
};

function taglineFor(collection: Collection): string {
  return (
    collection.description?.trim() ||
    collectionTaglines[collection.slug] ||
    `Explore ${getCollectionDisplayName(collection.slug, collection.name)}.`
  );
}

export function CategoryGrid({
  collections,
  coverBySlug,
}: {
  collections: Collection[];
  /** Server-resolved cover paths keyed by collection slug (avoids passing functions into client components). */
  coverBySlug?: Record<string, string | undefined>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="category-grid-root grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-6 md:grid-rows-3 md:auto-rows-[minmax(140px,1fr)]">
      {collections.map((collection) => {
        const cover =
          coverBySlug?.[collection.slug] ?? getCollectionCoverImage(collection);
        const layout =
          layoutBySlug[collection.slug] ?? "min-h-[220px] md:col-span-2 md:row-auto";
        const title = getCollectionDisplayName(collection.slug, collection.name);

        return (
          <MotionLink
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className={`group relative flex flex-col justify-end overflow-hidden rounded-[var(--radius)] border border-black/[0.06] bg-[#1a1917] shadow-sm transition-shadow hover:shadow-xl ${layout}`}
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {cover ? (
              <Image
                src={cover}
                alt=""
                fill
                className="object-cover transition duration-700 ease-out group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#2a2825] via-[#1a1917] to-[#0f0e0c]"
                aria-hidden
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition duration-500 group-hover:from-black/90"
              aria-hidden
            />
            <div className="relative z-[1] p-6 sm:p-7 md:p-8">
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-[var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
                Shop
              </span>
              <h3 className="mt-3 font-[var(--font-cormorant)] text-[clamp(1.35rem,2.8vw,2rem)] font-semibold leading-tight text-white drop-shadow-md">
                {title}
              </h3>
              <p className="mt-2 max-w-md font-[var(--font-dm-sans)] text-[13px] font-light leading-relaxed text-white/75 line-clamp-2 md:line-clamp-none">
                {taglineFor(collection)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--gold2)] transition group-hover:gap-2.5">
                Browse collection
                <span aria-hidden>→</span>
              </span>
            </div>
          </MotionLink>
        );
      })}
    </div>
  );
}
