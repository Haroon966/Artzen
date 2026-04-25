"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";

function verticallyOverlapsExpandedViewport(el: Element, overscanPx: number): boolean {
  const r = el.getBoundingClientRect();
  const h =
    typeof window !== "undefined" ? window.visualViewport?.height ?? window.innerHeight : 0;
  return r.bottom > -overscanPx && r.top < h + overscanPx && r.width > 0 && r.height > 0;
}

/**
 * Reveal when the element intersects the viewport (with vertical overscan) or is
 * already near the viewport on first layout — no framer-motion dependency.
 */
export function useRevealWhenVisible(overscanPx = 320): {
  ref: RefObject<Element | null>;
  visible: boolean;
} {
  const ref = useRef<Element | null>(null);
  const [visibleAtMount, setVisibleAtMount] = useState(false);
  const [visibleIo, setVisibleIo] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (verticallyOverlapsExpandedViewport(el, overscanPx)) {
      queueMicrotask(() => setVisibleAtMount(true));
    }
  }, [overscanPx]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || visibleAtMount) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisibleIo(true);
      },
      { root: null, rootMargin: `${overscanPx}px 0px ${overscanPx}px 0px`, threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [overscanPx, visibleAtMount]);

  return { ref, visible: visibleAtMount || visibleIo };
}
