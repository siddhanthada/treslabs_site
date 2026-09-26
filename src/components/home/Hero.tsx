"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { contact } from "@/content/scenario";
import { Button } from "@/components/site/Button";
import { Mark } from "@/components/brand/Mark";
import { Eyebrow } from "@/components/brand/Frame";
import { Pixel, PEOPLE } from "@/components/brand/Pixel";
import { ease } from "@/lib/motion";

/* The map is drawn on a 760 × 600 plan; HTML frames and SVG paths share it. */
const W = 760;
const H = 600;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

type Pt = [number, number];
const SYSTEMS = [
  { k: "Customer record", v: "Caller verified", y: 60, at: 4.2 },
  { k: "Orders", v: "#44812 · Arlo lamp", y: 170, at: 5.2 },
  { k: "Warehouse", v: "Out for delivery", y: 280, at: 6.4 },
  { k: "SMS", v: "Alert · 2 stops away", y: 390, at: 9.4 },
];
const SYS_X = 560;
const SYS_W = 200;
const SYS_H = 66;
const CORE = { x: 300, y: 225, s: 150 };
const LOOP = 14;

const pathTo = (y: number): Pt[] => [
  [CORE.x + CORE.s, 300],
  [505, 300],
  [505, y + SYS_H / 2],
  [SYS_X, y + SYS_H / 2],
];
const VOICE: Pt[] = [
  [236, 300],
  [CORE.x, 300],
];
const TO_EVAL: Pt[] = [
  [375, CORE.y],
  [375, 150],
];
const TO_OUT: Pt[] = [
  [375, CORE.y + CORE.s],
  [375, 470],
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();
  const [t, setT] = useState(reduce ? LOOP - 1.5 : 0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const s = (performance.now() - start) / 1000;
      setT(s % LOOP);
      setLoop(Math.floor(s / LOOP));
    }, 80);
    return () => {
      window.clearInterval(id);
    };
  }, [inView, reduce]);

  const live = (a: number) => t >= a && t < LOOP - 0.5;
  const speaking = (t > 0.4 && t < 3.2) || (t > 8 && t < 9.2);
  const thinking = t > 2.6 && t < 4.2;

  return (
    <section ref={ref} id="top" className="flex min-h-[calc(100svh/0.9)] items-center pt-[var(--nav-h)]">
      <div className="wrap grid w-full items-center gap-12 py-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Eyebrow>Voice agents for customer operations</Eyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.05 }}
            className="mt-7 text-[clamp(46px,5.3vw,80px)] font-[560] leading-[0.98] tracking-[-0.045em]"
          >
            Voice agents that get better in production.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.12 }}
            className="mt-6 max-w-[28rem] text-[18px] leading-[1.5] text-ink-2"
          >
            Treslabs answers your calls, checks every conversation, and fixes what goes wrong — with
            your team approving every change.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.18 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button href={contact.demo} variant="lime" arrow>
              Book a demo
            </Button>
            <Button href={contact.sendCall} variant="line">
              Send us a call
            </Button>
          </motion.div>
        </div>

        <div className="lg:col-span-7">
          <div
            className="relative w-full"
            style={{ aspectRatio: `${W} / ${H}` }}
            role="img"
            aria-label="A caller's request flows through Treslabs into your systems, and comes back as a delivered order and an evaluated call."
          >
            {/* connectors */}
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <Wire pts={VOICE} on={live(1.2)} warm />
              {SYSTEMS.map((s) => (
                <Wire key={s.k} pts={pathTo(s.y)} on={live(s.at)} />
              ))}
              <Wire pts={TO_EVAL} on={live(11.8)} />
              <Wire pts={TO_OUT} on={live(10.8)} />

              {live(1.2) && <Pulse key={`v1-${loop}`} pts={VOICE} warm />}
              {live(8.9) && <Pulse key={`v2-${loop}`} pts={VOICE} warm />}
              {SYSTEMS.map((s) => live(s.at) && <Pulse key={`${s.k}-${loop}`} pts={pathTo(s.y)} />)}
              {live(10.8) && <Pulse key={`out-${loop}`} pts={TO_OUT} />}
              {live(11.8) && <Pulse key={`eval-${loop}`} pts={TO_EVAL} />}
            </svg>

            {/* the caller, as the system sees them — no container */}
            <div className="absolute" style={{ left: 0, top: pct(96, H), width: pct(236, W), height: pct(390, H) }}>
              <Pixel
                src={PEOPLE.hero.src}
                focus={PEOPLE.hero.focus}
                cols={42}
                className="absolute inset-x-0 top-0 bottom-[78px] overflow-hidden rounded-[16px]"
                alt="An illustrative caller on the phone, rendered in pixels"
              />
              <div className="absolute inset-x-0 bottom-0">
                <Voice active={speaking} />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={t < 8 ? "a" : "b"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="speech-caller mt-2 text-[17px] leading-tight text-ink"
                  >
                    {t < 8 ? "“My lamp was meant to come Monday.”" : "“Oh — brilliant. Thank you.”"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* treslabs: a frame with a drawn shadow plane behind it */}
            <div
              className="absolute rounded-[14px] border border-dashed border-line-2"
              style={{ left: pct(CORE.x + 9, W), top: pct(CORE.y + 9, H), width: pct(CORE.s, W), height: pct(CORE.s, H) }}
              aria-hidden
            />
            <Box x={CORE.x} y={CORE.y} w={CORE.s} h={CORE.s} label="treslabs · v15" solid glow={thinking}>
              <div className="absolute inset-0 grid place-items-center">
                <Mark centered spinning={thinking} maxSpeed={11} className="h-[46%] w-[46%] text-ink" trail={false} title="" />
              </div>
              <div className="t-label absolute inset-x-0 bottom-2.5 text-center text-ink-3">
                {thinking ? "working…" : t > 4.2 && t < 12.5 ? "acting" : "listening"}
              </div>
            </Box>

            {/* the systems it acts in */}
            {SYSTEMS.map((s) => {
              const on = live(s.at + 0.6);
              return (
                <Box key={s.k} x={SYS_X} y={s.y} w={SYS_W} h={SYS_H}>
                  <span
                    className={`absolute -left-[4px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-[3px] transition-colors duration-300 ${
                      on ? "bg-lime-deep" : "bg-line-2"
                    }`}
                  />
                  <div className="flex h-full flex-col justify-center px-4">
                    <div className="text-[13.5px] font-[540]">{s.k}</div>
                    <motion.div
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 3 }}
                      transition={{ duration: 0.4 }}
                      className="t-label mt-1 truncate text-ink-2"
                    >
                      {s.v}
                    </motion.div>
                  </div>
                </Box>
              );
            })}

            {/* evaluation */}
            <Box x={270} y={40} w={210} h={110} label="evaluation">
              <div className="flex h-full flex-col justify-center px-4 pt-5">
                <div className="flex gap-1.5">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span
                      key={i}
                      className={`h-[16px] flex-1 rounded-[4px] border transition-colors duration-300 ${
                        live(12.4 + i * 0.12) ? "border-lime-deep/50 bg-lime" : "border-line-2"
                      }`}
                    />
                  ))}
                </div>
                <div className="t-label mt-2.5 text-ink-2">
                  {live(12.4) ? "6 of 6 checks · resolved" : "waiting…"}
                </div>
              </div>
            </Box>

            {/* the outcome */}
            <Box x={250} y={470} w={250} h={110} label="outcome">
              <div className="flex h-full items-center gap-4 px-4 pt-4">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] transition-colors duration-500 ${
                    live(11.2) ? "bg-lime text-ink" : "bg-sink text-ink-3"
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                    <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <motion.div initial={false} animate={{ opacity: live(11.5) ? 1 : 0.35 }} transition={{ duration: 0.5 }}>
                  <div className="text-[14.5px] font-[540]">{live(11.5) ? "Delivered" : "Waiting on outcome"}</div>
                  <div className="t-label mt-1 text-ink-2">Thu 14:52 · no second call</div>
                </motion.div>
              </div>
            </Box>
          </div>
        </div>
      </div>
    </section>
  );
}

function Box({
  x,
  y,
  w,
  h,
  label,
  solid,
  glow,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  solid?: boolean;
  glow?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute rounded-[14px] border transition-shadow duration-500 ${solid ? "border-line-2 bg-paper shadow-[0_10px_30px_-18px_rgba(17,18,24,.35)]" : "border-line bg-paper"} ${glow ? "!shadow-[0_0_0_6px_rgba(215,243,106,.55),0_10px_30px_-18px_rgba(17,18,24,.35)]" : ""}`}
      style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H) }}
    >
      {label && <span className="t-label absolute left-3.5 top-3 text-ink-3">{label}</span>}
      {children}
    </div>
  );
}

function Wire({ pts, on, warm }: { pts: Pt[]; on: boolean; warm?: boolean }) {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <path
      d={d}
      fill="none"
      stroke={on ? (warm ? "#56720a" : "#111218") : "#cdcdc5"}
      strokeWidth={1}
      strokeDasharray="4 5"
      className="wire-flow"
      style={{ transition: "stroke 400ms" }}
    />
  );
}

/** A small square travelling along a wire: a request going out. */
function Pulse({ pts, warm }: { pts: Pt[]; warm?: boolean }) {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const times = [0, ...lens.map((_, i) => lens.slice(0, i + 1).reduce((a, b) => a + b, 0) / total)];
  return (
    <motion.rect
      width={7}
      height={7}
      rx={2}
      fill={warm ? "#56720a" : "#111218"}
      initial={{ x: pts[0][0] - 3.5, y: pts[0][1] - 3.5, opacity: 1 }}
      animate={{
        x: pts.map((p) => p[0] - 3.5),
        y: pts.map((p) => p[1] - 3.5),
        opacity: pts.map((_, i) => (i === pts.length - 1 ? 0 : 1)),
      }}
      transition={{ duration: 0.3 + total / 420, times, ease: "linear" }}
    />
  );
}

function Voice({ active }: { active: boolean }) {
  return (
    <div className="flex h-4 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-lime-deep"
          animate={active ? { height: ["25%", `${35 + ((i * 41) % 65)}%`, "25%"] } : { height: "15%" }}
          transition={active ? { duration: 0.8 + (i % 5) * 0.14, repeat: Infinity, delay: i * 0.03 } : { duration: 0.4 }}
        />
      ))}
    </div>
  );
}
