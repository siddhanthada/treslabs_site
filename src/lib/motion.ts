/**
 * Motion language, derived from the Treslabs mark.
 *
 * The mark spins up against drag (a slow start), converges while working,
 * brakes on a velocity-matched curve, and always settles in the same pose
 * with a slightly under-damped spring. Everything else on the site borrows
 * those same behaviours so the whole system moves with one physics.
 */

/** Opening spring from the mark: k 165, ζ 0.68 → c = 2ζ√k ≈ 17.5 */
export const spring = {
  settle: { type: "spring", stiffness: 165, damping: 17.5, mass: 1 },
  firm: { type: "spring", stiffness: 280, damping: 32, mass: 1 },
} as const;

/** Cubic-bezier curves (Motion format). */
export const ease = {
  /** Default arrival: fast start, long exact settle. */
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Symmetric move between two states. */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** Brake: velocity-matched deceleration onto a fixed resting point. */
  brake: [0.12, 0.9, 0.18, 1] as [number, number, number, number],
  /** Spin-up: torque eases in against drag. */
  start: [0.7, 0, 0.84, 0] as [number, number, number, number],
};

/** Equivalent GSAP eases. */
export const gsapEase = {
  out: "power3.out",
  inOut: "power2.inOut",
  brake: "expo.out",
  start: "power3.in",
} as const;

export const dur = {
  fast: 0.24,
  base: 0.6,
  slow: 1.1,
} as const;

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Cubic smoothstep, as used for the mark's hub closing. */
export const smoothstep = (x: number) => x * x * (3 - 2 * x);

/** Deterministic PRNG so generated data is identical on server and client. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export const fmtInt = (n: number) => n.toLocaleString("en-GB");

/** Snap points for a scrubbed GSAP timeline: every label plus the end. */
export function labelSnaps(labels: Record<string, number>, duration: number) {
  const pts = [...Object.values(labels).map((t) => t / duration), 1].sort((a, b) => a - b);
  return (v: number) => pts.reduce((best, p) => (Math.abs(p - v) < Math.abs(best - v) ? p : best), pts[0]);
}
