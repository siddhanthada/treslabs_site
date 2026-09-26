"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/*
  The Treslabs mark. Geometry and physics follow the brand-mark artifact
  exactly: three 30-60-90 blades with unequal corner radii, rotated 120°.
  Spinning, the blades converge and the hub closes; slowing, they spread and
  the play triangle opens. Braking always lands on a multiple of 120°.
*/

type Pt = [number, number];
const TRI = { L: 135.1, S: 78, r30: 3.3, r90: 11.7, r60: 7.1 };
const OPEN: Pt = [-35.99, -54.8];
const SHUT: Pt = [-3.9, -13.3];

const f = (n: number) => Math.round(n * 100) / 100;
const clampN = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const nrm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
const crs = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];

function rounded(pts: Pt[], radii: number[]) {
  let d = "";
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const e1 = sub(p0, p1);
    const e2 = sub(p2, p1);
    const v1 = nrm(e1);
    const v2 = nrm(e2);
    const ang = Math.acos(clampN(v1[0] * v2[0] + v1[1] * v2[1], -1, 1));
    const h = Math.tan(ang / 2);
    const t = Math.min(radii[i] / h, Math.min(len(e1), len(e2)) * 0.48);
    const r = t * h;
    const a = add(p1, mul(v1, t));
    const b = add(p1, mul(v2, t));
    d += i === 0 ? `M${f(a[0])} ${f(a[1])}` : `L${f(a[0])} ${f(a[1])}`;
    d += `A${f(r)} ${f(r)} 0 0 ${crs(v1, v2) > 0 ? 0 : 1} ${f(b[0])} ${f(b[1])}`;
  }
  return d + "Z";
}

export const BLADE_PATH = rounded(
  [
    [0, 0],
    [TRI.L, 0],
    [TRI.L, TRI.S],
  ],
  [TRI.r30, TRI.r90, TRI.r60],
);
export const MARK_VIEWBOX = "-100 -100.6 202 217";

const bladeTransform = (deg: number, i: number, s: number) => {
  const x = SHUT[0] + (OPEN[0] - SHUT[0]) * s;
  const y = SHUT[1] + (OPEN[1] - SHUT[1]) * s;
  return `rotate(${f(deg + i * 120)}) translate(${f(x)} ${f(y)})`;
};

/* physics constants (artifact) */
const TAU = Math.PI * 2;
const STEP = TAU / 3;
const RAMP = 0.9;
const TAUS = 0.6;
const MINBRAKE = 1.5;
const DIR = -1; // counter-clockwise, sharp tips lead
const TRAIL = 5;
const quintic = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
const cubic = (x: number) => x * x * (3 - 2 * x);

type Brake = { t: number; T: number; d: number; a: number; b: number; c: number; th0: number };
type Sim = {
  mode: "idle" | "spin" | "brake";
  theta: number;
  omega: number;
  ramp: number;
  s: number;
  sv: number;
  brake: Brake | null;
  raf: number;
  last: number;
};

type MarkProps = {
  /** While true the mark behaves as a processing state. */
  spinning?: boolean;
  /** Top speed in rad/s. The artifact uses 15; small marks read better slower. */
  maxSpeed?: number;
  /** Spin up once on mount and brake to rest. */
  intro?: boolean;
  className?: string;
  title?: string;
  /** Leave a signal-coloured trail while spinning. */
  trail?: boolean;
  /** Square box centred on the rotation point — for placing the mark in the middle of something. */
  centered?: boolean;
};

export function Mark({
  spinning = false,
  maxSpeed = 15,
  intro = false,
  className,
  title = "Treslabs",
  trail = true,
  centered = false,
}: MarkProps) {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const ghosts = useRef<(SVGGElement | null)[]>([]);
  const reduce = useReducedMotion();
  const wmax = useRef(maxSpeed);
  useEffect(() => {
    wmax.current = maxSpeed;
  }, [maxSpeed]);
  const engine = useRef<{ run: () => void; planBrake: () => void } | null>(null);
  const sim = useRef<Sim>({
    mode: "idle",
    theta: 0,
    omega: 0,
    ramp: 0,
    s: 1,
    sv: 0,
    brake: null,
    raf: 0,
    last: 0,
  });

  useEffect(() => {
    const S = sim.current;

    const paint = () => {
      const deg = (S.theta * 180) / Math.PI;
      paths.current.forEach((p, i) => p?.setAttribute("transform", bladeTransform(deg, i, S.s)));
      // Trail: the arc swept in the last frames, in signal. Fades with speed.
      const speed = Math.min(1, Math.abs(S.omega) / wmax.current);
      ghosts.current.forEach((g, j) => {
        if (!g) return;
        const lag = ((S.omega * 0.011 * (j + 1)) * 180) / Math.PI;
        g.setAttribute("opacity", speed < 0.04 ? "0" : f(speed * 0.42 * (1 - j / TRAIL)).toString());
        const kids = g.children;
        for (let i = 0; i < kids.length; i++)
          kids[i].setAttribute("transform", bladeTransform(deg - lag, i, S.s));
      });
    };

    const settle = () => {
      S.theta = Math.round(S.theta / STEP) * STEP;
      S.omega = 0;
      S.brake = null;
      S.mode = "idle";
    };

    const planBrake = () => {
      const w = Math.abs(S.omega);
      if (w < 1e-3) {
        settle();
        return;
      }
      const base = ((S.theta % STEP) + STEP) % STEP;
      let d = DIR > 0 ? STEP - base : base;
      if (d < STEP * 0.12) d += STEP;
      while ((1.75 * d) / w < MINBRAKE) d += STEP;
      let T = clampN((1.75 * d) / w, 0.5, 3.2);
      const c = clampN((w * T) / d, 0.6, 2.85);
      T = (c * d) / w;
      S.brake = { t: 0, T, d, c, a: c - 2, b: 3 - 2 * c, th0: S.theta };
      S.mode = "brake";
    };

    const frame = (now: number) => {
      const dt = Math.min((now - S.last) / 1000, 1 / 30);
      S.last = now;
      const WMAX = wmax.current;
      if (S.mode === "spin") {
        S.ramp = Math.min(1, S.ramp + dt / RAMP);
        S.omega += ((DIR * WMAX * quintic(S.ramp) - S.omega) / TAUS) * dt;
        S.theta += S.omega * dt;
      } else if (S.mode === "brake" && S.brake) {
        const B = S.brake;
        B.t += dt;
        const u = Math.min(1, B.t / B.T);
        const h = ((B.a * u + B.b) * u + B.c) * u;
        const hp = (3 * B.a * u + 2 * B.b) * u + B.c;
        S.theta = B.th0 + DIR * B.d * h;
        S.omega = (DIR * B.d * hp) / B.T;
        if (u >= 1) settle();
      }
      const target = 1 - cubic(clampN(Math.abs(S.omega) / (0.78 * WMAX), 0, 1));
      const k = 165;
      const z = 0.68;
      S.sv += (-k * (S.s - target) - 2 * z * Math.sqrt(k) * S.sv) * dt;
      S.s += S.sv * dt;
      const resting = S.mode === "idle" && Math.abs(S.s - target) < 0.0015 && Math.abs(S.sv) < 0.02;
      if (resting) {
        S.s = target;
        S.sv = 0;
      }
      paint();
      S.raf = resting ? 0 : requestAnimationFrame(frame);
    };

    const run = () => {
      if (S.raf) return;
      S.last = performance.now();
      S.raf = requestAnimationFrame(frame);
    };

    engine.current = { run, planBrake };
    paint();
    return () => {
      cancelAnimationFrame(S.raf);
      S.raf = 0;
    };
  }, []);

  useEffect(() => {
    if (reduce) return;
    const S = sim.current;
    const a = engine.current;
    if (!a) return;
    if (spinning) {
      S.ramp = S.mode === "brake" ? 0.4 : 0;
      S.brake = null;
      S.mode = "spin";
      a.run();
    } else if (S.mode === "spin") {
      a.planBrake();
      a.run();
    }
  }, [spinning, reduce]);

  useEffect(() => {
    if (!intro || reduce) return;
    const S = sim.current;
    const a = engine.current;
    if (!a) return;
    const t0 = window.setTimeout(() => {
      S.ramp = 0;
      S.mode = "spin";
      a.run();
    }, 250);
    const t1 = window.setTimeout(() => {
      if (S.mode === "spin") {
        a.planBrake();
        a.run();
      }
    }, 1250);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [intro, reduce]);

  return (
    <svg
      viewBox={centered ? "-118 -118 236 236" : MARK_VIEWBOX}
      className={className}
      role="img"
      aria-label={title}
      style={{ overflow: "visible", display: "block" }}
    >
      {trail &&
        Array.from({ length: TRAIL }, (_, j) => (
          <g
            key={`g${j}`}
            ref={(el) => {
              ghosts.current[j] = el;
            }}
            opacity={0}
            fill="var(--mark-trail, var(--color-signal))"
          >
            {[0, 1, 2].map((i) => (
              <path key={i} d={BLADE_PATH} transform={bladeTransform(0, i, 1)} />
            ))}
          </g>
        ))}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          ref={(el) => {
            paths.current[i] = el;
          }}
          d={BLADE_PATH}
          fill="currentColor"
          transform={bladeTransform(0, i, 1)}
        />
      ))}
    </svg>
  );
}
