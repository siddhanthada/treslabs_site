"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Section } from "@/components/site/Section";
import { Stage } from "@/components/site/Stage";
import { Mark } from "@/components/brand/Mark";
import { ease } from "@/lib/motion";

/*
  "What happens in the two hours after something goes wrong?" — as one chart.
  A cursor sweeps a Tuesday afternoon: v16 rolls out, policy errors cross the
  limit, the rollout pauses itself, v15 takes every call back, customers are
  corrected, and the fix is replayed before it tries again.
*/

const W = 1000;
const H = 250;
const PAD = { l: 44, r: 28, t: 24, b: 36 };
const LIMIT = 5;
const MAX = 20;

// time (minutes after 14:00) → x, with a break between 14:25 and 16:40
const x = (m: number) => {
  const iw = W - PAD.l - PAD.r;
  return m <= 25 ? PAD.l + (m / 25) * iw * 0.8 : PAD.l + iw * 0.86 + ((m - 160) / 10) * iw * 0.14;
};
const y = (v: number) => PAD.t + (1 - v / MAX) * (H - PAD.t - PAD.b);

const EVENTS = [
  { m: 0, t: "14:00", label: "v16 rolls out to 10%", state: "rolling out" },
  { m: 7, t: "14:07", label: "Errors cross 5% · paused itself", state: "paused itself", fault: true },
  { m: 12, t: "14:12", label: "Rolled back to v15", state: "rolled back to v15" },
  { m: 20, t: "14:20", label: "6 customers corrected", state: "customers corrected" },
  { m: 165, t: "16:45", label: "Fix replayed on 1,279 calls", state: "fixed · back in review" },
];

// policy-error rate on v16, and share of calls on v16
const ERR: [number, number][] = [
  [0, 0.4], [2, 1.1], [4, 3.2], [6, 9.8], [7, 14.6], [9, 14.2], [11.6, 13.8], [12, 0], [25, 0],
];
const TRAFFIC: [number, number][] = [[0, 10], [12, 10], [12.01, 0], [25, 0]];
const path = (pts: [number, number][]) => pts.map(([m, v], i) => `${i ? "L" : "M"}${x(m).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

const DURATION = 7; // seconds for the sweep

export function Incident() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduce = useReducedMotion();
  const [sweep, setP] = useState(0); // 0..1 sweep
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const v = Math.min(1, (now - t0) / (DURATION * 1000));
      setP(v);
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, run]);

  const p = reduce ? 1 : sweep;
  const cx = PAD.l + p * (W - PAD.l - PAD.r);
  const passed = EVENTS.filter((e) => x(e.m) <= cx + 0.5);
  const now = passed[passed.length - 1];
  const rolling = !!now && now.m === 0;
  const done = p >= 1;

  return (
    <Section
      id="incidents"
      eyebrow="When AI goes wrong"
      title="Built for the two hours after something goes wrong."
      sub="What matters is how fast you see it, how few callers it reaches, and how cleanly you get back."
    >
      <div ref={ref}>
        <Stage tone="carbon">
          <div className="px-5 py-8 sm:px-10 md:py-11">
            {/* state */}
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-carbon-2 ring-1 ring-carbon-line">
                  <Mark centered spinning={rolling} maxSpeed={11} className="h-6 w-6 text-bone" trail={false} title="Rollout state" />
                </span>
                <div>
                  <div className="t-label text-on-carbon-3">Agent · v16 · Tuesday</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={now?.state ?? "ready"}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: ease.out }}
                      className={`text-[clamp(19px,1.8vw,24px)] tracking-[-0.02em] ${now?.fault ? "text-fault-lit" : "text-bone"}`}
                    >
                      {now?.state ?? "ready to roll out"}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-5 text-[12.15px] text-on-carbon-2">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-lime/35 ring-1 ring-lime/60" />
                  Calls on v16
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-[2px] w-4 rounded-full bg-fault-lit" />
                  Policy errors
                </span>
                {done && !reduce && (
                  <button onClick={() => setRun((r) => r + 1)} className="t-label rounded-[7px] bg-carbon-2 px-2.5 py-1 text-on-carbon-2 ring-1 ring-carbon-line transition-colors hover:text-bone">
                    ↺ Replay
                  </button>
                )}
              </div>
            </div>

            {/* the afternoon */}
            <div className="mt-8 overflow-x-auto">
              <svg viewBox={`0 0 ${W} ${H + 64}`} className="h-auto w-full min-w-[640px]" role="img" aria-label="Policy errors on v16 rise past the 5% limit at 14:07; the rollout pauses, rolls back at 14:12 and errors return to zero.">
                <defs>
                  <clipPath id="sweep">
                    <rect x="0" y="0" width={cx} height={H + 64} />
                  </clipPath>
                </defs>
                {/* grid */}
                {[0, 5, 10, 15, 20].map((v) => (
                  <g key={v}>
                    <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,.06)" />
                    <text x={PAD.l - 10} y={y(v) + 3.5} textAnchor="end" className="fill-[#6f7176] font-mono text-[10.5px]">
                      {v}%
                    </text>
                  </g>
                ))}
                {/* time break */}
                <g className="fill-[#6f7176] font-mono text-[10.5px]">
                  <line x1={x(25) + 18} x2={x(25) + 18} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,.12)" strokeDasharray="2 4" />
                  <text x={x(25) + 18} y={H - PAD.b + 16} textAnchor="middle">
                    ···
                  </text>
                </g>
                {/* limit */}
                <line x1={PAD.l} x2={W - PAD.r} y1={y(LIMIT)} y2={y(LIMIT)} stroke="#e0714f" strokeOpacity=".55" strokeDasharray="5 5" />
                <text x={W - PAD.r} y={y(LIMIT) - 7} textAnchor="end" className="fill-[#e0714f] font-mono text-[10.5px]">
                  auto-pause above {LIMIT}%
                </text>

                <g clipPath="url(#sweep)">
                  {/* calls on v16 */}
                  <path d={`${path(TRAFFIC)} L${x(25)} ${y(0)} L${x(0)} ${y(0)} Z`} fill="rgba(215,243,106,.16)" />
                  <path d={path(TRAFFIC)} fill="none" stroke="rgba(215,243,106,.65)" strokeWidth={1.5} />
                  {/* errors */}
                  <path d={path(ERR)} fill="none" stroke="#e0714f" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
                  {/* replay: back at zero */}
                  <line x1={x(160)} x2={x(170)} y1={y(0)} y2={y(0)} stroke="#d7f36a" strokeWidth={2.2} strokeLinecap="round" />
                </g>

                {/* events */}
                {EVENTS.map((e, n) => {
                  const on = x(e.m) <= cx + 0.5;
                  const ex = x(e.m);
                  const row = n % 2;
                  return (
                    <motion.g key={e.t + e.label} initial={false} animate={{ opacity: on ? 1 : 0.18 }} transition={{ duration: 0.3 }}>
                      <line x1={ex} x2={ex} y1={PAD.t} y2={H - PAD.b + 8 + row * 26} stroke={e.fault ? "#e0714f" : "rgba(255,255,255,.22)"} strokeDasharray="2 3" />
                      <circle cx={ex} cy={H - PAD.b + 8 + row * 26} r={3.5} fill={e.fault ? "#e0714f" : on ? "#d7f36a" : "#3a3c42"} />
                      {e.m > 100 ? (
                        <text x={ex - 10} y={H - PAD.b + 12 + row * 26} textAnchor="end" className="fill-[#f1f0ec] text-[12px]">
                          <tspan className="fill-[#a6a7ab] font-mono text-[10.5px]">{e.t}</tspan>
                          <tspan dx="8">{e.label}</tspan>
                        </text>
                      ) : (
                        <>
                          <text x={ex + 9} y={H - PAD.b + 12 + row * 26} className="fill-[#a6a7ab] font-mono text-[10.5px]">
                            {e.t}
                          </text>
                          <text x={ex + 48} y={H - PAD.b + 12 + row * 26} className={e.fault ? "fill-[#e0714f] text-[12px]" : "fill-[#f1f0ec] text-[12px]"}>
                            {e.label}
                          </text>
                        </>
                      )}
                    </motion.g>
                  );
                })}

                {/* cursor */}
                {!done && <line x1={cx} x2={cx} y1={PAD.t - 8} y2={H - PAD.b} stroke="#f1f0ec" strokeOpacity=".7" strokeWidth={1.2} />}
              </svg>
            </div>

            {/* what it adds up to */}
            <div className="mt-8 grid gap-px overflow-hidden rounded-[16px] bg-carbon-line sm:grid-cols-3">
              {[
                { v: "7 min", k: "to catch it and pause" },
                { v: "5 min", k: "to be back on v15" },
                { v: "6 of 6", k: "affected customers corrected" },
              ].map((s, n) => (
                <motion.div
                  key={s.k}
                  initial={false}
                  animate={{ opacity: done || reduce ? 1 : 0.35 }}
                  transition={{ duration: 0.5, delay: n * 0.12 }}
                  className="bg-carbon-2 px-6 py-5"
                >
                  <div className="text-[clamp(26px,2.6vw,34px)] font-[500] leading-none tracking-[-0.035em] text-bone">{s.v}</div>
                  <div className="mt-2 text-[12.6px] text-on-carbon-2">{s.k}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </Stage>
      </div>
    </Section>
  );
}
