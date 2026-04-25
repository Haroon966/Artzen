"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/images/hero-1.webp", alt: "Artzens — home decor and gifts" },
  { src: "/images/hero-2.webp", alt: "Wall art and curated products" },
  { src: "/images/hero-3.webp", alt: "Shop online with cash on delivery" },
] as const;

/**
 * Native horizontal scroll + scroll-snap (Mobile Skill — swipe-native, no heavy carousel libs).
 */
export function HomeHeroMobileSlides() {
  const [showAllSlides, setShowAllSlides] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShowAllSlides(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  const visibleSlides = showAllSlides ? SLIDES : [SLIDES[0]];

  return (
    <div className="hero__image-wrap absolute inset-0 z-0 md:hidden">
      <div
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured visuals"
      >
        {visibleSlides.map((slide, i) => (
          <div
            key={slide.src}
            className="relative h-full min-w-full shrink-0 snap-center snap-always"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
