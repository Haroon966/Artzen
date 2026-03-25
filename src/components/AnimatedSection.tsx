"use client";

import { motion, useReducedMotion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
};

export function AnimatedSection({
  children,
  className,
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
  const reduceMotion = useReducedMotion();
  const offset = directionOffset[direction];

  const initial = reduceMotion
    ? { opacity: 1 }
    : { opacity: 0, x: offset.x, y: offset.y };

  const whileInView = reduceMotion
    ? undefined
    : {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.45,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
      };

  const viewport = reduceMotion ? undefined : { once: true, amount: 0.2 };

  const Component = motion[as];

  return (
    <Component
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      className={className}
    >
      {children}
    </Component>
  );
}
