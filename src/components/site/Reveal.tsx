"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "@/lib/motion";

/** Arrive once, from slightly below, and settle. Used sparingly. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "p" | "h2" | "h3" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: ease.out, delay }}
    >
      {children}
    </M>
  );
}
