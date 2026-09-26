"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, useTransform, motion, type MotionValue } from "motion/react";
import { BLADE_PATH } from "./Mark";

/*
  The mark's physics, extended beyond the mark. Three blades at architectural
  scale: converged and turned while `p` is 0, released and settled — each on
  an exact 120° step — at 1. Brake easing, so they arrive rather than drift.
  Geometry, not a logo: always cropped, never shown whole at rest.
*/

const OPEN: [number, number] = [-35.99, -54.8];
const SHUT: [number, number] = [-3.9, -13.3];
const brake = (v: number) => 1 - Math.pow(1 - v, 3);

export function BladeField({
  p,
  spread = 2.6,
  turn = 70,
  className = "",
  fill = "currentColor",
}: {
  /** 0 = converged, 1 = released. */
  p: MotionValue<number>;
  /** How far past the mark's open pose the blades travel. */
  spread?: number;
  /** Degrees of rotation shed while releasing. */
  turn?: number;
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="-200 -200 400 400" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {[0, 1, 2].map((i) => (
        <Blade key={i} i={i} p={p} spread={spread} turn={turn} fill={fill} />
      ))}
    </svg>
  );
}

function Blade({ i, p, spread, turn, fill }: { i: number; p: MotionValue<number>; spread: number; turn: number; fill: string }) {
  const transform = useTransform(p, (raw) => {
    const v = brake(Math.min(1, Math.max(0, raw)));
    const s = v * spread;
    const x = SHUT[0] + (OPEN[0] - SHUT[0]) * s;
    const y = SHUT[1] + (OPEN[1] - SHUT[1]) * s;
    return `rotate(${i * 120 + (1 - v) * turn}) translate(${x} ${y})`;
  });
  return <motion.path d={BLADE_PATH} fill={fill} transform={transform} />;
}

/** 0 when the element's top reaches the bottom of the viewport, 1 when it reaches the top. */
export function useArrival(ref: React.RefObject<HTMLElement | null>) {
  const p = useMotionValue(0);
  const reduce = useReducedMotion();
  const raf = useRef(0);
  useEffect(() => {
    if (reduce) {
      p.set(1);
      return;
    }
    const read = () => {
      raf.current = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      p.set(Math.min(1, Math.max(0, 1 - r.top / window.innerHeight)));
    };
    const on = () => {
      if (!raf.current) raf.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [ref, p, reduce]);
  return p;
}
