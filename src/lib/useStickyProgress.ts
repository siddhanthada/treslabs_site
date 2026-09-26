"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue } from "motion/react";

/**
 * 0..1 progress through a tall section while its sticky child is pinned.
 * Measured live on every scroll frame, so it stays correct when GSAP pin
 * spacers (or anything else) change the layout above it.
 */
export function useStickyProgress(ref: RefObject<HTMLElement | null>) {
  const p = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      p.set(span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [ref, p]);
  return p;
}
