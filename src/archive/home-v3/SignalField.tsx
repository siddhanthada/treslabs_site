"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Mark } from "@/components/brand/Mark";
import { mulberry32 } from "@/lib/motion";

/*
  A living production signal.

  Every trace is a conversation in production; warm points are the people
  moving through them. A recurring failure appears as the same stall on a
  handful of traces. The system detects it, draws the affected traces together
  (convergence, compression — the mark spinning up), releases them with the
  mark's under-damped spring, and the whole field settles a little more
  coherent than before. Then production carries on.
*/

// Cycle, in seconds.
const C = {
  anomaly: 3.2, // stall begins to form
  scan: 6.4, // detection sweep
  converge: 7.8, // affected traces drawn together
  hold: 9.6, // processing
  release: 10.8, // change applied
  settled: 13.2,
  end: 18,
};

export const PHASES = ["Production", "Detection", "Intelligence", "Improvement"] as const;
export const phaseAt = (c: number) =>
  c < C.scan ? 0 : c < C.converge ? 1 : c < C.release ? 2 : 3;

const TRACES = 150;
const AFFECTED = 13;
const PARTICLES = 70;

type Trace = { y: number; amp: number; f1: number; f2: number; p1: number; p2: number; alpha: number };
type Particle = { tr: number; x: number; v: number };

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function SignalField({ onPhase }: { onPhase?: (p: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const markEl = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { amount: 0.1 });
  const reduce = useReducedMotion();
  const [spinning, setSpinning] = useState(false);
  const phaseRef = useRef(-1);
  const onPhaseRef = useRef(onPhase);
  useEffect(() => {
    onPhaseRef.current = onPhase;
  }, [onPhase]);

  useEffect(() => {
    const cv = canvas.current;
    const host = wrap.current;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const rnd = mulberry32(11);
    let W = 0;
    let H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const traces: Trace[] = Array.from({ length: TRACES }, (_, i) => {
      const u = (i + rnd() * 0.8) / TRACES;
      return {
        y: 0.14 + u * 0.72,
        amp: 6 + rnd() * 16,
        f1: 0.0024 + rnd() * 0.0036,
        f2: 0.0007 + rnd() * 0.0012,
        p1: rnd() * Math.PI * 2,
        p2: rnd() * Math.PI * 2,
        alpha: 0.05 + Math.pow(rnd(), 2) * 0.26,
      };
    });
    const particles: Particle[] = Array.from({ length: PARTICLES }, () => ({
      tr: Math.floor(rnd() * TRACES),
      x: rnd(),
      v: 0.03 + rnd() * 0.05,
    }));

    // Per-cycle anomaly
    let cycle = -1;
    let affected = new Set<number>();
    let xa = 0.72;
    let yc = 0.5;
    const newCycle = (n: number) => {
      const r = mulberry32(100 + n);
      xa = 0.64 + r() * 0.16;
      const set = new Set<number>();
      while (set.size < AFFECTED) set.add(Math.floor(r() * TRACES));
      affected = set;
      yc = [...set].reduce((s, i) => s + traces[i].y, 0) / AFFECTED;
    };

    // Pinch spring (the mark's opening spring: k 165, ζ 0.68)
    let pinch = 0;
    let pinchV = 0;
    // Field coherence: lower = calmer. Settles after each improvement.
    let calm = 1;

    const resize = () => {
      const r = host.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const draw = (time: number, dt: number) => {
      const cyc = Math.floor(time / C.end);
      if (cyc !== cycle) {
        cycle = cyc;
        newCycle(cyc);
      }
      const c = time % C.end;

      // phase envelopes
      const stall = smooth(C.anomaly, C.scan, c) * (1 - smooth(C.release, C.release + 1.2, c));
      const scanX = c >= C.scan && c < C.converge ? (c - C.scan) / (C.converge - C.scan) : -1;
      const focus = smooth(C.scan, C.scan + 0.8, c) * (1 - smooth(C.release + 0.4, C.settled, c));
      const target = c >= C.converge && c < C.release ? 1 : 0;
      // convergence accelerates (cubic) like the blades closing
      const k = 165;
      const z = 0.68;
      const drive = target === 1 ? Math.pow(smooth(C.converge, C.hold, c), 3) : 0;
      pinchV += (-k * (pinch - drive) - 2 * z * Math.sqrt(k) * pinchV) * dt;
      pinch += pinchV * dt;
      const improved = smooth(C.release, C.settled, c) * (1 - smooth(C.end - 2.4, C.end, c)); // ultramarine afterglow
      const settledTarget = c > C.release ? 0.55 : c < C.anomaly ? 0.55 + 0.45 * smooth(0, C.anomaly, c) : 1;
      calm += (settledTarget - calm) * Math.min(1, dt * 0.6);

      const phase = phaseAt(c);
      if (phase !== phaseRef.current) {
        phaseRef.current = phase;
        onPhaseRef.current?.(phase);
        setSpinning(phase === 2);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const XA = xa * W;
      const sigma = W * 0.11;
      const gap = 46 * stall;
      const YC = yc * H;
      const step = 10;
      const shared = (x: number) => 20 * Math.sin(x * 0.0017 + time * 0.22) + 9 * Math.sin(x * 0.0041 - time * 0.31);
      const fadeIn = (x: number) => 0.12 + 0.88 * smooth(W * 0.28, W * 0.62, x);

      const yOf = (i: number, x: number) => {
        const tr = traces[i];
        const base =
          tr.y * H +
          shared(x) * calm +
          tr.amp * calm * (0.6 * Math.sin(x * tr.f1 + time * 0.55 + tr.p1) + Math.sin(x * tr.f2 - time * 0.24 + tr.p2));
        if (!affected.has(i)) return base;
        const w = Math.exp(-(((x - XA) / sigma) ** 2));
        // the stall: a drop where the call went silent
        const dip = stall * 10 * w;
        return base + dip + (YC - base) * w * pinch;
      };

      // unaffected traces
      ctx.lineWidth = 1;
      for (let i = 0; i < TRACES; i++) {
        if (affected.has(i)) continue;
        const a = traces[i].alpha * (1 - 0.45 * focus);
        ctx.beginPath();
        for (let x = 0; x <= W + step; x += step) {
          const y = yOf(i, x);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, `rgba(238,240,250,${a * 0.12})`);
        g.addColorStop(0.62, `rgba(238,240,250,${a})`);
        g.addColorStop(1, `rgba(238,240,250,${a})`);
        ctx.strokeStyle = g;
        ctx.stroke();
      }

      // affected traces: drawn per segment, coloured by what's happening near the anomaly
      ctx.lineWidth = 1.4;
      for (const i of affected) {
        let prev: [number, number] | null = null;
        for (let x = 0; x <= W + step; x += step) {
          const y = yOf(i, x);
          const inGap = gap > 1 && x > XA - gap / 2 && x < XA + gap / 2;
          if (prev && !inGap) {
            const w = Math.exp(-(((x - XA) / (sigma * 1.3)) ** 2));
            // the healed stretch glows wider and brighter, then cools back to the field
            const wu = Math.exp(-(((x - XA) / (sigma * 2.6)) ** 2));
            const base = 0.16 + 0.5 * focus * w + 0.55 * improved * wu;
            // fault (terracotta) only while it's actually failing; ultramarine once improved
            const f = stall * w;
            const u = Math.min(1 - f, improved * wu);
            const r = Math.round(238 * (1 - f - u) + 224 * f + 140 * u);
            const gg = Math.round(240 * (1 - f - u) + 113 * f + 140 * u);
            const b = Math.round(250 * (1 - f - u) + 79 * f + 255 * u);
            ctx.strokeStyle = `rgba(${r},${gg},${b},${Math.min(0.95, base * fadeIn(x))})`;
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          prev = inGap ? null : [x, y];
        }
      }

      // detection sweep
      if (scanX >= 0) {
        const sx = scanX * W;
        const grd = ctx.createLinearGradient(sx - 60, 0, sx, 0);
        grd.addColorStop(0, "rgba(140,140,255,0)");
        grd.addColorStop(1, "rgba(140,140,255,0.10)");
        ctx.fillStyle = grd;
        ctx.fillRect(sx - 60, 0, 60, H);
        ctx.fillStyle = "rgba(140,140,255,0.9)";
        ctx.fillRect(sx, H * 0.08, 1.2, H * 0.84);
      }

      // people moving through production; they wait at the stall
      for (const p of particles) {
        const isA = affected.has(p.tr);
        const wall = XA - gap / 2 - 3;
        let nx = p.x + p.v * dt * (0.8 + 0.4 * (1 - calm));
        if (isA && gap > 4 && p.x * W <= wall && nx * W > wall) nx = wall / W;
        p.x = nx;
        if (p.x > 1.02) {
          p.x = -0.02;
          p.tr = Math.floor(Math.random() * TRACES);
        }
        const x = p.x * W;
        const y = yOf(p.tr, x);
        const a = fadeIn(x) * (isA ? 1 : 0.75);
        ctx.fillStyle = `rgba(245,228,195,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, isA ? 2.1 : 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // the mark sits where the traces converge
      if (markEl.current) {
        markEl.current.style.transform = `translate(${XA - 11}px, ${YC - 12}px)`;
        markEl.current.style.opacity = String(smooth(C.converge - 0.2, C.converge + 0.4, c) * (1 - smooth(C.release + 0.8, C.settled, c)));
      }
    };

    let raf = 0;
    let last = performance.now();
    let clock = 0;
    const running = inView && !reduce;
    if (reduce) {
      // A still, settled frame.
      clock = C.settled + 1.5;
      newCycle(0);
      cycle = 0;
      calm = 0.55;
      draw(clock, 0);
    } else {
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        clock += dt;
        draw(clock, dt);
        raf = requestAnimationFrame(loop);
      };
      if (running) raf = requestAnimationFrame((n) => {
        last = n;
        loop(n);
      });
      else draw(clock, 0);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduce]);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <canvas ref={canvas} className="absolute inset-0" />
      <div ref={markEl} className="absolute left-0 top-0 text-signal-lit" style={{ opacity: 0 }}>
        <Mark spinning={spinning} maxSpeed={13} className="h-[24px] w-auto" title="" />
      </div>
    </div>
  );
}
