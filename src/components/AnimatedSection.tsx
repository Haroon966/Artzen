"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRevealWhenVisible } from "@/lib/use-reveal-when-visible";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

const hiddenTransformClass: Record<Direction, string> = {
  up: "translate-y-6",
  down: "-translate-y-6",
  left: "translate-x-6",
  right: "-translate-x-6",
  none: "",
};

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  as?: "div" | "section";
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [disableForMobile, setDisableForMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const sync = () => setDisableForMobile(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  const skipAnimation = reduceMotion || disableForMobile;
  const { ref, visible } = useRevealWhenVisible(240);
  const Tag = as;

  const motionClasses = skipAnimation
    ? ""
    : `transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${hiddenTransformClass[direction]} ${
        visible ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0"
      }`;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
      className={`${className} ${motionClasses}`.trim()}
      style={skipAnimation ? undefined : { transitionDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}
