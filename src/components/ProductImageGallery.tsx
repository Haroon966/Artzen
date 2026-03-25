"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

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
  const list = images.length > 0 ? images : ["/images/products/placeholder.svg"];
  const [active, setActive] = useState(0);
  const src = list[active] ?? list[0];

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
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={productName}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
        </div>
        {saleBadge ? (
          <span
            className="pointer-events-none absolute left-3.5 top-3.5 rounded-[var(--radius-pill)] bg-[var(--red)] px-3 py-1 font-[var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.04em] text-white"
          >
            {saleBadge}
          </span>
        ) : null}

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 md:hidden"
              aria-label="Previous image"
            >
              <span className="text-lg leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 md:hidden"
              aria-label="Next image"
            >
              <span className="text-lg leading-none">›</span>
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {list.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-card)] ring-2 transition-[ring-color] ${
                i === active
                  ? "ring-[var(--sage)]"
                  : "ring-transparent hover:ring-[var(--sage-light)]"
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 22vw, 120px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
