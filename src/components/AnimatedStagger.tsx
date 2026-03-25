"use client";

import { motion, useReducedMotion } from "framer-motion";

const staggerDuration = 0.06;

export function AnimatedStagger({
  children,
  className,
  staggerDelay = staggerDuration,
  childClassName,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  childClassName?: string;
}) {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.05,
          },
        },
      };

  const item = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
        },
      };

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item} className={childClassName}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
