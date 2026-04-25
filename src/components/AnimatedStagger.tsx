"use client";

import type React from "react";
import { Children, isValidElement } from "react";
import { useRevealWhenVisible } from "@/lib/use-reveal-when-visible";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const staggerDuration = 0.06;

export function AnimatedStagger({
  children,
  className = "",
  staggerDelay = staggerDuration,
  childClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  childClassName?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const { ref, visible } = useRevealWhenVisible(400);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const items = Children.toArray(children);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement | null>}
      className={`${className} transition-opacity duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        visible ? "opacity-100" : "opacity-0"
      }`.trim()}
    >
      {items.map((child, i) => (
        <div
          key={isValidElement(child) ? child.key ?? i : i}
          className={`${childClassName} transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`.trim()}
          style={{ transitionDelay: `${i * staggerDelay}s` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
