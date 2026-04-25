"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { CatalogImageWatermark } from "@/components/CatalogImageWatermark";
import {
  catalogImageProtectClassName,
  preventImageContextMenu,
  preventImageDragStart,
  productImageInteractionProps,
} from "@/lib/image-protection";

export function ProductImageGallery({
  images,
  productName,
  saleBadge,
}: {
  images: string[];
  productName: string;
  /** e.g. "25% Off" when on sale */
  saleBadge?: string | null;
}) {
  const placeholderSrc = "/images/products/placeholder.svg";
  const list = images.length > 0 ? images : [placeholderSrc];
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const src = list[active] ?? list[0];
  const activeSrc = failed[src] ? placeholderSrc : src;

  const markFailed = useCallback((img: string) => {
    setFailed((prev) => (prev[img] ? prev : { ...prev, [img]: true }));
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => {
        const n = list.length;
        return (i + dir + n) % n;
      });
    },
    [list.length]
  );

  return (
    <div className="pdp-gallery-root flex flex-col gap-3.5">
      <div
        className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]"
      >
        <div
          className={`relative h-full w-full ${catalogImageProtectClassName}`}
        >
          <Image
            src={activeSrc}
            alt={productName}
            fill
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) min(100vw, 1400px), min(50vw, 1400px)"
            priority
            onError={() => markFailed(src)}
            {...productImageInteractionProps}
          />
          <CatalogImageWatermark variant="pdp" />
          <div
            className="absolute inset-0 z-[2] cursor-default"
            aria-hidden
            onContextMenu={preventImageContextMenu}
            onDragStart={preventImageDragStart}
          />
        </div>
        {saleBadge ? (
          <span
            className="pointer-events-none absolute left-3.5 top-3.5 z-[3] rounded-[var(--radius-pill)] bg-[var(--red)] px-3 py-1 font-[var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.04em] text-white"
          >
            {saleBadge}
          </span>
        ) : null}

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-[4] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 md:hidden"
              aria-label="Previous image"
            >
              <span className="text-lg leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-[4] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 md:hidden"
              aria-label="Next image"
            >
              <span className="text-lg leading-none">›</span>
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div
          className={`flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:grid md:snap-none md:grid-cols-4 md:overflow-x-visible md:pb-0 md:[scrollbar-width:auto] ${catalogImageProtectClassName}`}
        >
          {list.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square h-[4.25rem] w-[4.25rem] shrink-0 snap-start overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-card)] ring-2 transition-[ring-color] sm:h-20 sm:w-20 md:h-auto md:w-full md:min-w-0 ${
                i === active
                  ? "ring-[var(--sage)]"
                  : "ring-transparent hover:ring-[var(--sage-light)]"
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
            >
              {/** Keep thumbnail visible even if source image 404s in dev. */}
              <Image
                src={failed[img] ? placeholderSrc : img}
                alt=""
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 80px, 120px"
                onError={() => markFailed(img)}
                {...productImageInteractionProps}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
