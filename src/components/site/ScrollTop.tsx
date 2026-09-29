"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ease } from "@/lib/motion";

/*
  Back to top. A rounded square (never a circle) that appears after the first
  screen: glass at rest, solid under the pointer. A thin lime line traces its
  edge as you read, so it doubles as a progress mark. Over the dark close it
  turns dark itself.
*/

const S = 44; // size, px
const R = 12; // corner radius, px

export function ScrollTop() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [dark, setDark] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const on = () => {
      setShow(window.scrollY > window.innerHeight * 0.9);
      // what's behind the button (bottom-right)?
      const y = window.innerHeight - 40;
      setDark(
        [...document.querySelectorAll<HTMLElement>("[data-nav='dark']")].some((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= y && r.bottom >= y;
        }),
      );
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: 0.35, ease: ease.out }}
          whileTap={{ scale: 0.94 }}
          className={`group fixed cursor-pointer bottom-5 right-5 z-40 grid place-items-center rounded-[12px] backdrop-blur-md backdrop-saturate-150 transition-[background-color,color,box-shadow] duration-300 focus-visible:outline-offset-4 md:bottom-7 md:right-7 ${
            dark
              ? "bg-white/[0.06] text-on-carbon/80 ring-1 ring-white/10 hover:bg-lime hover:text-ink hover:shadow-[0_14px_34px_-16px_rgba(0,0,0,.7)] focus-visible:bg-lime focus-visible:text-ink"
              : "bg-paper/40 text-ink/70 ring-1 ring-ink/[0.08] hover:bg-ink hover:text-lime hover:shadow-[0_14px_34px_-16px_rgba(17,18,24,.45)] focus-visible:bg-ink focus-visible:text-lime"
          }`}
          style={{ width: S, height: S }}
        >
          {/* reading progress, traced around the edge */}
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width={S} height={S} aria-hidden>
            <motion.rect
              x={0.75}
              y={0.75}
              width={S - 1.5}
              height={S - 1.5}
              rx={R - 0.75}
              fill="none"
              stroke={dark ? "#d7f36a" : "#56720a"}
              strokeWidth={1.5}
              strokeLinecap="round"
              style={{ pathLength: progress }}
              className="transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
            />
          </svg>
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[2px]"
            aria-hidden
          >
            <path d="M8 13V3.5M3.75 7.5 8 3.25l4.25 4.25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
