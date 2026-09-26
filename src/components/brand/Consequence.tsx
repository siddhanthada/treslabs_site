"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ease } from "@/lib/motion";

/**
 * The expression-mode signature: when the system's work becomes something in
 * the world, a dawn line runs ahead and daylight follows it. Used wherever a
 * call has a consequence — never for system states.
 */
export function Consequence({
  show,
  children,
  className = "",
  delay = 0,
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`relative overflow-hidden bg-daylight text-ink ${className}`}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: ease.brake, delay }}
        >
          <div className="absolute inset-x-0 top-0 h-[2.7px]" style={{ background: "var(--dawn)" }} />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
