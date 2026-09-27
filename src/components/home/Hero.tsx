"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { contact } from "@/content/scenario";
import { Button } from "@/components/site/Button";
import { Mark } from "@/components/brand/Mark";
import { Phone } from "@/components/brand/Phone";
import { Eyebrow } from "@/components/brand/Frame";
import { Pixel, PEOPLE } from "@/components/brand/Pixel";
import { ease } from "@/lib/motion";

/*
  Hero: people first. A row of callers, the middle one live. Its voice runs
  down a dotted line out of the hero and into the call flow below, which
  plays the same call on the same clock.
*/

const LOOP = 16;
/** The call ends here: the live photo resolves into pixels — the call as Treslabs keeps it. */
const ENDS = 12.4;

/** The live call's conversation, on the loop clock. */
const LINES = [
  { at: 0.4, who: "caller", text: "My lamp was meant to come Monday." },
  { at: 2, who: "agent", text: "It’s out for delivery — with you by six today." },
  { at: 8.8, who: "caller", text: "Oh — brilliant. Thank you." },
] as const;

/** Calls already handled — kept as Treslabs sees them. Illustrative people, fictional calls. */
const SIDE = [
  { who: PEOPLE.mira, zoom: 1.5, cols: 24, h: 0.66, tag: "Refund → Sam", dur: "3:02", show: "xl" },
  { who: PEOPLE.suit, zoom: 1.7, cols: 28, h: 0.82, tag: "Order resolved", dur: "1:48", show: "md" },
  { who: PEOPLE.rose, zoom: 1.2, cols: 28, h: 0.82, tag: "Rebooked · Mon", dur: "2:10", show: "md" },
  { who: PEOPLE.desk, zoom: 1.5, cols: 24, h: 0.66, tag: "Handed to Jess", dur: "0:52", show: "xl" },
] as const;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
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
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const live = (a: number) => t >= a && t < LOOP - 0.5;
  const speaking = (t > 0.4 && t < 3.2) || (t > 8.8 && t < 10);
  const ended = t >= ENDS;
  const caller = [...LINES].reverse().find((l) => l.who === "caller" && t >= l.at && !ended);
  const agent = LINES.find((l) => l.who === "agent" && t >= l.at && !ended);

  return (
    <div ref={ref}>
      <section id="top" className="flex min-h-svh flex-col overflow-x-clip pt-[var(--nav-h)]">
        <div className="wrap w-full pt-[clamp(28px,5svh,64px)] text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Eyebrow>Voice agents for customer operations</Eyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.05 }}
            className="mx-auto mt-5 max-w-[17ch] text-[clamp(41.4px,4.77vw,72px)] font-[560] leading-[0.98] tracking-[-0.045em]"
          >
            Voice agents <SpokenWave /> that get better in production.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.12 }}
            className="mx-auto mt-5 max-w-[34rem] text-[16.2px] leading-[1.5] text-ink-2"
          >
            Treslabs answers your calls, checks every conversation, and fixes what goes wrong — with
            your team approving every change.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.18 }}
            className="mt-7 flex flex-wrap justify-center gap-3"
          >
            <Button href={contact.demo} variant="lime" arrow>
              Book a demo
            </Button>
            <Button href={contact.sendCall} variant="line">
              Send us a call
            </Button>
          </motion.div>
        </div>

        {/* the callers */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: ease.out, delay: 0.25 }}
          className="wrap mt-[clamp(28px,4.5svh,52px)] w-full"
        >
          <div
            className="flex items-center justify-center gap-3"
            style={{ height: "clamp(240px, calc(100svh - 530px), 380px)" }}
          >
            {SIDE.slice(0, 2).map((s) => (
              <SideTile key={s.tag} {...s} />
            ))}
            <div className="relative z-10 h-full w-full max-w-[340px] shrink-0 md:w-[27%]">
              {/* live: a real person on a real call; when it ends it becomes pixels — the call as data */}
              <div className="absolute inset-0 overflow-hidden rounded-[14.4px] bg-sink ring-1 ring-ink/10">
                <Image
                  src={`${PEOPLE.hero.src}?w=900&q=80&auto=format`}
                  alt="An illustrative caller on the phone"
                  fill
                  priority
                  sizes="(min-width: 768px) 340px, 90vw"
                  className="object-cover"
                  style={{ objectPosition: `${PEOPLE.hero.focus.x * 100}% ${PEOPLE.hero.focus.y * 100}%` }}
                />
                <AnimatePresence>
                  {ended && (
                    <motion.div
                      key={`px-${loop}`}
                      className="absolute inset-0"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Pixel src={PEOPLE.hero.src} focus={PEOPLE.hero.focus} cols={44} build={1.1} scan={false} className="absolute inset-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* call bar */}
              <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                <span
                  className={`flex items-center gap-1.5 rounded-[7.2px] px-2.5 py-1 text-[11.25px] font-[520] transition-colors duration-300 ${
                    ended ? "bg-ink text-on-carbon" : "bg-lime text-ink"
                  }`}
                >
                  <Phone className="h-3 w-3" />
                  {ended ? `Ended · ${fmt(ENDS)}` : `Live · ${fmt(t)}`}
                </span>
                <span className="flex items-center gap-1.5 rounded-[7.2px] bg-paper/95 px-2.5 py-1 text-[11.25px] font-[500] text-ink">
                  {ended ? (
                    <>
                      <span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] bg-lime">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      Evaluated · 6/6
                    </>
                  ) : (
                    <>
                      <Mark centered className="h-3 w-3 text-ink" trail={false} title="" />
                      Answered by Treslabs
                    </>
                  )}
                </span>
              </div>
              <AnimatePresence>
                {!ended && (
                  <motion.div exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-3 flex justify-center">
                    <div className="rounded-[8px] bg-paper/95 px-2.5 py-1.5">
                      <Voice active={speaking} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* the conversation floats off the photo, so the face stays clear */}
              <AnimatePresence mode="wait">
                {caller && (
                  <Bubble key={`${caller.at}-${loop}`} className="left-3 top-[30%] md:left-[-14%] max-w-[240px] bg-paper text-ink">
                    <span className="speech-caller text-[15.3px] leading-tight">“{caller.text}”</span>
                  </Bubble>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {agent && (
                  <Bubble key={`agent-${loop}`} className="right-3 top-[52%] md:right-[-16%] max-w-[250px] bg-ink text-on-carbon">
                    <span className="flex items-start gap-2 text-[12.6px] leading-snug">
                      <Mark centered className="mt-[2px] h-3.5 w-3.5 shrink-0 text-lime" trail={false} title="" />
                      {agent.text}
                    </span>
                  </Bubble>
                )}
              </AnimatePresence>
            </div>
            {SIDE.slice(2).map((s) => (
              <SideTile key={s.tag} {...s} />
            ))}
          </div>
        </motion.div>

        {/* the signal leaves the hero */}
        <Drop className="min-h-12 flex-1" on={t > 0.4} pulses={[1.2, 8.9]} t={t} loop={loop} dur={1.1} />
      </section>

      <Flow t={t} loop={loop} live={live} />
    </div>
  );
}

/** A small voice waveform set inline in the headline. Sized in em so it scales with the type. */
const WAVE = [0.18, 0.3, 0.5, 0.34, 0.66, 0.9, 0.56, 0.78, 0.42, 1, 0.62, 0.84, 0.46, 0.7, 0.36, 0.52, 0.26, 0.16];

function SpokenWave() {
  const reduce = useReducedMotion();
  return (
    <span className="mx-[0.04em] inline-flex h-[0.6em] items-center gap-[0.045em] align-middle" aria-hidden>
      {WAVE.map((h, i) => (
        <motion.span
          key={i}
          className="w-[0.05em] rounded-full bg-[#9bbd28]"
          style={{ height: `${h * 100}%` }}
          animate={reduce ? undefined : { scaleY: [1, 0.45 + ((i * 37) % 50) / 100, 1] }}
          transition={{ duration: 1.1 + (i % 4) * 0.18, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
        />
      ))}
    </span>
  );
}

function Bubble({ className, children }: { className: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, ease: ease.out }}
      className={`absolute w-max rounded-[10px] px-3.5 py-2.5 text-left shadow-[0_12px_32px_-14px_rgba(17,18,24,.45)] ring-1 ring-ink/5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** A finished call: kept as pixels, with its outcome. */
function SideTile({
  who,
  zoom,
  cols,
  h,
  tag,
  dur,
  show,
}: {
  who: { src: string; focus: { x: number; y: number } };
  zoom: number;
  cols: number;
  h: number;
  tag: string;
  dur: string;
  show: "md" | "xl";
}) {
  return (
    <div
      className={`relative hidden shrink-0 ${show === "md" ? "w-[17%] md:block" : "w-[14%] xl:block"}`}
      style={{ height: `${h * 100}%` }}
    >
      <Pixel
        src={who.src}
        focus={who.focus}
        zoom={zoom}
        cols={cols}
        animate={false}
        scan={false}
        className="absolute inset-0 overflow-hidden rounded-[12.6px]"
      />
      <div className="absolute inset-x-2 bottom-2 rounded-[7.2px] bg-paper/95 px-2 py-1.5">
        <div className="flex items-center gap-1.5 truncate text-[11.25px] font-[520] text-ink">
          <Phone className="h-3 w-3 shrink-0 text-lime-deep" />
          {tag}
        </div>
        <div className="t-label mt-0.5 truncate text-ink-3">{dur} · 6/6 checks</div>
      </div>
    </div>
  );
}


/** A vertical dotted wire, centred, with voice pulses dropping down it. */
function Drop({
  className = "",
  on,
  pulses,
  t,
  loop,
  dur,
}: {
  className?: string;
  on: boolean;
  pulses: number[];
  t: number;
  loop: number;
  dur: number;
}) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <svg className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 overflow-visible">
        <line
          x1="4"
          x2="4"
          y1="0"
          y2="100%"
          stroke={on ? "#56720a" : "#cdcdc5"}
          strokeWidth={1}
          strokeDasharray="4 5"
          className="wire-flow"
          style={{ transition: "stroke 400ms" }}
        />
      </svg>
      {pulses.map(
        (p) =>
          t >= p &&
          t < p + dur + 0.1 && (
            <motion.span
              key={`${p}-${loop}`}
              className="absolute left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-[2px] bg-lime-deep"
              initial={{ top: "0%", opacity: 1 }}
              animate={{ top: "100%" }}
              transition={{ duration: dur, ease: "linear" }}
            />
          ),
      )}
    </div>
  );
}

/* ── The call flow, laid out horizontally on a 1100 × 300 plan ── */

const W = 1100;
const H = 300;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
type Pt = [number, number];

const CORE = { x: 480, y: 90, s: 140 };
const MID = CORE.y + CORE.s / 2;
const SYSTEMS = [
  { k: "Customer record", v: "Caller verified", y: 18, at: 4.2 },
  { k: "Orders", v: "#44812 · Arlo lamp", y: 88, at: 5.2 },
  { k: "Warehouse", v: "Out for delivery", y: 158, at: 6.4 },
  { k: "SMS", v: "Alert · 2 stops away", y: 228, at: 9.4 },
];
const SYS = { x: 20, w: 230, h: 60 };
const OUT = { x: 670, y: MID - 55, w: 190, h: 110 };
const EVAL = { x: 890, y: MID - 55, w: 190, h: 110 };

const ENTRY: Pt[] = [
  [W / 2, 0],
  [W / 2, CORE.y],
];
const toSystem = (y: number): Pt[] => [
  [CORE.x, MID],
  [380, MID],
  [380, y + SYS.h / 2],
  [SYS.x + SYS.w, y + SYS.h / 2],
];
const TO_OUT: Pt[] = [
  [CORE.x + CORE.s, MID],
  [OUT.x, MID],
];
const TO_EVAL: Pt[] = [
  [OUT.x + OUT.w, MID],
  [EVAL.x, MID],
];

function Flow({ t, loop, live }: { t: number; loop: number; live: (a: number) => boolean }) {
  const thinking = t > 2.4 && t < 4.2;
  return (
    <section aria-label="How one call flows through Treslabs" className="pb-[clamp(32px,5vw,72px)]">
      <div className="wrap">
        {/* desktop: the full horizontal map */}
        <div
          className="relative mx-auto hidden w-full max-w-[1100px] md:block"
          style={{ aspectRatio: `${W} / ${H}` }}
          role="img"
          aria-label="The caller's voice reaches Treslabs, which checks your systems, resolves the call, and scores it."
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <Wire pts={ENTRY} on={t > 0.4} warm />
            {SYSTEMS.map((s) => (
              <Wire key={s.k} pts={toSystem(s.y)} on={live(s.at)} />
            ))}
            <Wire pts={TO_OUT} on={live(10.8)} />
            <Wire pts={TO_EVAL} on={live(11.8)} />

            {live(2.3) && t < 3 && <Pulse key={`e1-${loop}`} pts={ENTRY} warm />}
            {live(10.0) && t < 10.8 && <Pulse key={`e2-${loop}`} pts={ENTRY} warm />}
            {SYSTEMS.map((s) => live(s.at) && t < s.at + 1.5 && <Pulse key={`${s.k}-${loop}`} pts={toSystem(s.y)} />)}
            {live(10.8) && t < 11.6 && <Pulse key={`o-${loop}`} pts={TO_OUT} />}
            {live(11.8) && t < 12.6 && <Pulse key={`v-${loop}`} pts={TO_EVAL} />}
          </svg>

          {SYSTEMS.map((s) => {
            const on = live(s.at + 0.5);
            return (
              <Box key={s.k} x={SYS.x} y={s.y} w={SYS.w} h={SYS.h}>
                <span
                  className={`absolute -right-[3.6px] top-1/2 h-[7.2px] w-[7.2px] -translate-y-1/2 rounded-[2.7px] transition-colors duration-300 ${
                    on ? "bg-lime-deep" : "bg-line-2"
                  }`}
                />
                <div className="flex h-full flex-col justify-center px-4">
                  <div className="text-[12.15px] font-[540]">{s.k}</div>
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

          <Box x={CORE.x} y={CORE.y} w={CORE.s} h={CORE.s} label="treslabs · v15" solid glow={thinking}>
            <div className="absolute inset-0 grid place-items-center">
              <Mark centered spinning={thinking} maxSpeed={11} className="h-[44%] w-[44%] text-ink" trail={false} title="" />
            </div>
            <div className="t-label absolute inset-x-0 bottom-2.5 text-center text-ink-3">
              {thinking ? "working…" : t > 4.2 && t < 12.5 ? "acting" : "listening"}
            </div>
          </Box>

          <Box x={OUT.x} y={OUT.y} w={OUT.w} h={OUT.h} label="outcome">
            <div className="flex h-full items-center gap-3.5 px-4 pt-4">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] transition-colors duration-500 ${
                  live(11.2) ? "bg-lime text-ink" : "bg-sink text-ink-3"
                }`}
              >
                <Check />
              </span>
              <motion.div initial={false} animate={{ opacity: live(11.2) ? 1 : 0.35 }} transition={{ duration: 0.5 }}>
                <div className="text-[13.05px] font-[540]">{live(11.2) ? "Delivered" : "Waiting…"}</div>
                <div className="t-label mt-1 text-ink-2">Thu 14:52 · no callback</div>
              </motion.div>
            </div>
          </Box>

          <Box x={EVAL.x} y={EVAL.y} w={EVAL.w} h={EVAL.h} label="evaluation">
            <div className="flex h-full flex-col justify-center px-4 pt-5">
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[14.4px] flex-1 rounded-[3.6px] border transition-colors duration-300 ${
                      live(12.2 + i * 0.12) ? "border-lime-deep/50 bg-lime" : "border-line-2"
                    }`}
                  />
                ))}
              </div>
              <div className="t-label mt-2.5 text-ink-2">{live(12.2) ? "6 of 6 checks" : "waiting…"}</div>
            </div>
          </Box>
        </div>

        {/* mobile: the same steps, stacked */}
        <ol className="mx-auto grid max-w-sm gap-2 md:hidden">
          {[
            { k: "Treslabs", v: t > 4.2 && t < 12.5 ? "acting" : "listening", on: t > 2.4 },
            ...SYSTEMS.map((s) => ({ k: s.k, v: s.v, on: live(s.at + 0.5) })),
            { k: "Outcome", v: "Delivered · no callback", on: live(11.2) },
            { k: "Evaluation", v: "6 of 6 checks", on: live(12.2) },
          ].map((s) => (
            <li key={s.k} className="flex items-center justify-between rounded-[12.6px] border border-line bg-paper px-4 py-3">
              <span className="flex items-center gap-2.5 text-[13.05px] font-[540]">
                <span className={`h-[7.2px] w-[7.2px] rounded-[2.7px] transition-colors ${s.on ? "bg-lime-deep" : "bg-line-2"}`} />
                {s.k}
              </span>
              <span className={`t-label text-ink-2 transition-opacity ${s.on ? "opacity-100" : "opacity-30"}`}>{s.v}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const fmt = (s: number) => `00:${String(Math.floor(s)).padStart(2, "0")}`;

function Check({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
      className={`absolute rounded-[12.6px] border transition-shadow duration-500 ${solid ? "border-line-2 bg-paper shadow-[0_10px_30px_-16.2px_rgba(17,18,24,.35)]" : "border-line bg-paper"} ${glow ? "!shadow-[0_0_0_6px_rgba(215,243,106,.55),0_10px_30px_-16.2px_rgba(17,18,24,.35)]" : ""}`}
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
      vectorEffect="non-scaling-stroke"
      className="wire-flow"
      style={{ transition: "stroke 400ms" }}
    />
  );
}

/** A small square travelling along a wire. */
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
    <div className="flex h-3.5 items-center gap-[2.7px]" aria-hidden>
      {Array.from({ length: 22 }, (_, i) => (
        <motion.span
          key={i}
          className="w-[1.8px] bg-lime-deep"
          animate={active ? { height: ["25%", `${35 + ((i * 41) % 65)}%`, "25%"] } : { height: "15%" }}
          transition={active ? { duration: 0.8 + (i % 5) * 0.14, repeat: Infinity, delay: i * 0.03 } : { duration: 0.4 }}
        />
      ))}
    </div>
  );
}
