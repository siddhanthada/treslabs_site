"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { contact } from "@/content/scenario";
import { Button } from "@/components/site/Button";
import { Mark } from "@/components/brand/Mark";
import { Phone } from "@/components/brand/Phone";
import { Pixel, PEOPLE } from "@/components/brand/Pixel";
import { ease } from "@/lib/motion";

/*
  Hero: calls keep coming. A conveyor of callers — waiting on the left, live
  in the middle, finished on the right. The live call is a real photo and a
  real conversation; its voice drops into the call flow below, which plays
  the same call on the same clock. When the call ends it resolves into pixels
  (the call as Treslabs keeps it) and everything moves one step right.

  Illustrative people (Unsplash), fictional calls for Harrow & Finch.
*/

type Person = { src: string; focus: { x: number; y: number } };
type Scene = {
  who: Person;
  /** How far to crop in on the face and phone. */
  zoom: number;
  lines: [caller: string, agent: string, reply: string];
  systems: [string, string][];
  outcome: [string, string];
  tag: string;
  dur: string;
};

const SCENES: Scene[] = [
  {
    who: PEOPLE.hero,
    zoom: 1.3,
    lines: ["My lamp was meant to come Monday.", "It’s out for delivery — with you by six today.", "Oh — brilliant. Thank you."],
    systems: [
      ["Customer record", "Caller verified"],
      ["Orders", "#44812 · Arlo lamp"],
      ["Warehouse", "Out for delivery"],
      ["SMS", "Alert · 2 stops away"],
    ],
    outcome: ["Resolved", "Arrives today · no callback"],
    tag: "Order resolved",
    dur: "1:48",
  },
  {
    who: PEOPLE.lena,
    zoom: 1.15,
    lines: ["I won’t be home on Friday for the delivery.", "No problem — Monday, 8 to 12 is free. Shall I book it?", "Monday’s perfect."],
    systems: [
      ["Customer record", "Caller verified"],
      ["Orders", "#45102 · Hale sideboard"],
      ["Bookings", "Mon 8–12 free"],
      ["Email", "Confirmation sent"],
    ],
    outcome: ["Rebooked", "Mon 8–12 · confirmed"],
    tag: "Rebooked · Mon",
    dur: "2:10",
  },
  {
    who: PEOPLE.maya,
    zoom: 1.35,
    lines: ["The lamp base arrived cracked.", "Sorry about that — I’ve sent an £84 refund to Sam to approve.", "Great, thanks."],
    systems: [
      ["Customer record", "Caller verified"],
      ["Orders", "#44907 · Tove base · £84"],
      ["Refund policy", "Over £50 → a person"],
      ["Returns team", "Sent to Sam · photos"],
    ],
    outcome: ["Handed to Sam", "Refund approved · 4 min"],
    tag: "Refund → Sam",
    dur: "3:02",
  },
  {
    who: PEOPLE.leo,
    zoom: 1,
    lines: ["I’ve moved — can you update my address?", "Done. Both open orders now go to 14 Park Road.", "Perfect, thank you."],
    systems: [
      ["Customer record", "Caller verified"],
      ["Address check", "Postcode valid"],
      ["Orders", "2 open orders updated"],
      ["Email", "Confirmation sent"],
    ],
    outcome: ["Address updated", "2 orders rerouted"],
    tag: "Address updated",
    dur: "1:21",
  },
  {
    who: PEOPLE.daniel,
    zoom: 1.3,
    lines: ["Can I speak to a person, please?", "Of course — putting you through to Jess, with the details.", "Thank you."],
    systems: [
      ["Customer record", "Caller verified"],
      ["Policy", "Asked for a person"],
      ["Queue", "Jess · under 1 min"],
      ["Handover", "Summary attached"],
    ],
    outcome: ["Handed to Jess", "No repeat questions"],
    tag: "Handed to Jess",
    dur: "0:52",
  },
];

/** One call, in seconds. Every scene runs on the same clock. */
const T = {
  caller: 0.9, // after the conveyor has moved the caller into place
  drop: [1.0, 5.2], // the caller's voice leaves the hero
  entry: [1.7, 5.9], // …and reaches Treslabs
  think: [1.7, 2.2],
  systems: [2.2, 2.5, 2.8, 4.2], // the last one is the follow-up action
  agent: 3.0,
  reply: 5.2,
  outcome: 6.2,
  evaluate: 6.8,
  ends: 7.9, // the call resolves into pixels (1s)…
  loop: 9.1, // …then straight on to the next caller
};
const MOVE = 0.7; // seconds for the conveyor to step
const DROP_DUR = 0.7;

/**
 * Five slots, left → right: next-but-one, next, live, just finished, finished.
 * Positions are % of the row; o = visible at this breakpoint.
 */
type Geo = { l: number; w: number; h: number; o: number };
const GEO: Record<"sm" | "md" | "xl", Geo[]> = {
  xl: [
    { l: 3.1, w: 14, h: 0.66, o: 1 },
    { l: 18.3, w: 17, h: 0.82, o: 1 },
    { l: 36.5, w: 27, h: 1, o: 1 },
    { l: 64.7, w: 17, h: 0.82, o: 1 },
    { l: 82.9, w: 14, h: 0.66, o: 1 },
  ],
  md: [
    { l: 10.5, w: 22, h: 0.82, o: 0 },
    { l: 10.5, w: 22, h: 0.82, o: 1 },
    { l: 34, w: 32, h: 1, o: 1 },
    { l: 67.5, w: 22, h: 0.82, o: 1 },
    { l: 67.5, w: 22, h: 0.82, o: 0 },
  ],
  sm: [
    { l: 0, w: 100, h: 1, o: 0 },
    { l: 0, w: 100, h: 1, o: 0 },
    { l: 0, w: 100, h: 1, o: 1 },
    { l: 0, w: 100, h: 1, o: 0 },
    { l: 0, w: 100, h: 1, o: 0 },
  ],
};
const geoStyle = (g: Geo) => ({ left: `${g.l}%`, width: `${g.w}%`, height: `${g.h * 100}%`, top: `${((1 - g.h) / 2) * 100}%`, opacity: g.o });

const subscribe = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
function useBreakpoint(): "sm" | "md" | "xl" {
  return useSyncExternalStore(
    subscribe,
    () => (window.innerWidth >= 1280 ? "xl" : window.innerWidth >= 768 ? "md" : "sm"),
    () => "xl",
  );
}

const pixelUrl = (src: string) => `${src}?w=640&q=75&auto=format`;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const reduce = useReducedMotion();
  const [t, setT] = useState(reduce ? T.evaluate + 1 : 0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    // resume from where it paused, so a scene never restarts mid-way
    const start = performance.now() - (loop * T.loop + t) * 1000;
    const id = window.setInterval(() => {
      const s = (performance.now() - start) / 1000;
      setT(s % T.loop);
      setLoop(Math.floor(s / T.loop));
    }, 60);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  // warm the cache so every caller's pixels are ready when their call ends
  useEffect(() => {
    SCENES.forEach(({ who }) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = pixelUrl(who.src);
    });
  }, []);

  const bp = useBreakpoint();
  const n = SCENES.length;
  const sceneOf = (k: number) => SCENES[((k % n) + n) % n];
  const scene = sceneOf(loop);
  const ended = t >= T.ends;
  const speaking = (t > T.caller && t < 2.1) || (t > T.agent && t < 4.1) || (t > T.reply && t < 6);
  const caller = !ended && t >= T.caller ? (t >= T.reply ? scene.lines[2] : scene.lines[0]) : null;
  const agent = !ended && t >= T.agent ? scene.lines[1] : null;

  return (
    <div ref={ref}>
      <section id="top" className="flex min-h-svh flex-col overflow-x-clip pt-[var(--nav-h)]">
        <div className="wrap w-full pt-[clamp(28px,5svh,64px)] text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2.5 text-[12.15px] font-[480] text-ink-2">
              <span className="live-dot !h-1.5 !w-1.5" />
              Private beta · now onboarding design partners
            </span>
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
            <Button href="#partners" variant="lime" arrow>
              Become a partner
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
          <div className="relative" style={{ height: "clamp(240px, calc(100svh - 530px), 380px)" }}>
            <AnimatePresence initial={false}>
              {[2, 1, 0, -1, -2].map((d, p) => {
                const k = loop + d;
                const mode = d > 0 ? "queue" : d === 0 ? "live" : "done";
                return (
                  <motion.div
                    key={k}
                    className={`absolute ${mode === "live" ? "z-10" : ""}`}
                    initial={{ ...geoStyle(GEO[bp][0]), opacity: 0 }}
                    animate={geoStyle(GEO[bp][p])}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    transition={{ duration: reduce ? 0 : MOVE, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Tile
                      scene={sceneOf(k)}
                      mode={mode}
                      startsDone={k < 0}
                      ended={mode === "live" && ended}
                      t={t}
                      loop={loop}
                      speaking={speaking}
                      caller={mode === "live" ? caller : null}
                      agent={mode === "live" ? agent : null}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* the signal leaves the hero */}
        <Drop className="min-h-12 flex-1" on={t > T.caller && !ended} pulses={T.drop} t={t} loop={loop} dur={DROP_DUR} />
      </section>

      <Flow t={t} loop={loop} scene={scene} />
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

/**
 * One caller on the conveyor. Waiting: their photo. Live: the call itself.
 * Finished: the pixels Treslabs keeps, with the outcome. The pixel layer
 * mounts when the call ends and stays with the tile, so nothing re-renders.
 */
function Tile({
  scene,
  mode,
  startsDone,
  ended,
  t,
  loop,
  speaking,
  caller,
  agent,
}: {
  scene: Scene;
  mode: "queue" | "live" | "done";
  startsDone: boolean;
  ended: boolean;
  t: number;
  loop: number;
  speaking: boolean;
  caller: string | null;
  agent: string | null;
}) {
  const { who, zoom } = scene;
  const [instant] = useState(startsDone);
  const pixels = mode === "done" || ended;
  const origin = `${who.focus.x * 100}% ${who.focus.y * 100}%`;
  return (
    <>
      <div className={`absolute inset-0 overflow-hidden rounded-[14.4px] bg-sink ${mode === "live" ? "ring-1 ring-ink/10" : ""}`}>
        <Image
          src={`${who.src}?w=900&q=80&auto=format`}
          alt={mode === "live" ? "An illustrative caller on the phone" : ""}
          fill
          priority={mode === "live"}
          sizes="(min-width: 1280px) 330px, (min-width: 768px) 32vw, 90vw"
          className={`object-cover transition-opacity duration-500 ${mode === "done" ? "opacity-0" : ""}`}
          style={{ objectPosition: origin, transformOrigin: origin, transform: `scale(${zoom})` }}
        />
        {pixels && (
          <Pixel src={who.src} focus={who.focus} zoom={zoom} cols={40} build={1} animate={!instant} scan={false} className="absolute inset-0" />
        )}
      </div>

      {mode === "queue" && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-[7.2px] bg-paper/95 px-2 py-1 text-[11.25px] font-[500] text-ink">
          <span className="relative flex h-[6px] w-[6px]">
            <span className="absolute inset-0 animate-ping rounded-full bg-lime-deep/60" />
            <span className="relative h-[6px] w-[6px] rounded-full bg-lime-deep" />
          </span>
          Incoming
        </div>
      )}

      <AnimatePresence>
        {mode === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute inset-x-2 bottom-2 rounded-[7.2px] bg-paper/95 px-2 py-1.5"
          >
            <div className="flex items-center gap-1.5 truncate text-[11.25px] font-[520] text-ink">
              <Phone className="h-3 w-3 shrink-0 text-lime-deep" />
              {scene.tag}
            </div>
            <div className="t-label mt-0.5 truncate text-ink-3">{scene.dur} · 6/6 checks</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === "live" && (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* call bar */}
            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-[7.2px] px-2.5 py-1 text-[11.25px] font-[520] transition-colors duration-300 ${
                  ended ? "bg-ink text-on-carbon" : "bg-lime text-ink"
                }`}
              >
                <Phone className="h-3 w-3" />
                {ended ? `Ended · ${scene.dur}` : `Live · ${fmt(t)}`}
              </span>
              <span className="flex items-center gap-1.5 truncate rounded-[7.2px] bg-paper/95 px-2.5 py-1 text-[11.25px] font-[500] text-ink">
                {ended ? (
                  <>
                    <span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] bg-lime">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    Evaluated · 6/6
                  </>
                ) : (
                  <>
                    <Mark centered className="h-3 w-3 shrink-0 text-ink" trail={false} title="" />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* the conversation floats off the photo, so the face stays clear */}
      <AnimatePresence mode="wait">
        {caller && (
          <Bubble key={`${caller}-${loop}`} className="left-3 top-[30%] md:left-[-14%] max-w-[240px] bg-paper text-ink">
            <span className="speech-caller text-[15.3px] leading-tight">“{caller}”</span>
          </Bubble>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agent && (
          <Bubble key={`agent-${loop}`} className="right-3 top-[52%] md:right-[-16%] max-w-[250px] bg-ink text-on-carbon">
            <span className="flex items-start gap-2 text-[12.6px] leading-snug">
              <Mark centered className="mt-[2px] h-3.5 w-3.5 shrink-0 text-lime" trail={false} title="" />
              {agent}
            </span>
          </Bubble>
        )}
      </AnimatePresence>
    </>
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
const SYS_Y = [18, 88, 158, 228];
const SYS = { x: 20, w: 230, h: 60 };
const OUT = { x: 670, y: MID - 55, w: 190, h: 110 };
const EVAL = { x: 890, y: MID - 55, w: 190, h: 110 };
const SPEED = 900; // plan units per second for pulses

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

function Flow({ t, loop, scene }: { t: number; loop: number; scene: Scene }) {
  const on = (a: number) => t >= a;
  const thinking = t > T.think[0] && t < T.think[1];
  const state = thinking ? "working…" : t >= T.systems[0] && t < T.outcome ? "acting" : t >= T.outcome ? "done" : "listening";
  const window_ = (a: number, d = 0.8) => t >= a && t < a + d;
  return (
    <section aria-label="How one call flows through Treslabs" className="pb-[clamp(32px,5vw,72px)]">
      <div className="wrap">
        {/* desktop: the full horizontal map */}
        <div
          className="relative mx-auto hidden w-full max-w-[1100px] md:block"
          style={{ aspectRatio: `${W} / ${H}` }}
          role="img"
          aria-label="The caller's voice reaches Treslabs, which works in your systems, resolves the call, and scores it."
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <Wire pts={ENTRY} on={t > T.caller && t < T.ends} warm />
            {SYS_Y.map((y, i) => (
              <Wire key={i} pts={toSystem(y)} on={on(T.systems[i])} />
            ))}
            <Wire pts={TO_OUT} on={on(T.outcome)} />
            <Wire pts={TO_EVAL} on={on(T.evaluate)} />

            {T.entry.map((a) => window_(a) && <Pulse key={`e${a}-${loop}`} pts={ENTRY} warm />)}
            {SYS_Y.map((y, i) => window_(T.systems[i], 1) && <Pulse key={`s${i}-${loop}`} pts={toSystem(y)} />)}
            {window_(T.outcome) && <Pulse key={`o-${loop}`} pts={TO_OUT} />}
            {window_(T.evaluate) && <Pulse key={`v-${loop}`} pts={TO_EVAL} />}
          </svg>

          {scene.systems.map(([k, v], i) => {
            const lit = on(T.systems[i] + 0.35);
            return (
              <Box key={i} x={SYS.x} y={SYS_Y[i]} w={SYS.w} h={SYS.h}>
                <span
                  className={`absolute -right-[3.6px] top-1/2 h-[7.2px] w-[7.2px] -translate-y-1/2 rounded-[2.7px] transition-colors duration-300 ${
                    lit ? "bg-lime-deep" : "bg-line-2"
                  }`}
                />
                <div className="flex h-full flex-col justify-center px-4">
                  <div className="text-[12.15px] font-[540]">{k}</div>
                  <motion.div
                    initial={false}
                    animate={{ opacity: lit ? 1 : 0, y: lit ? 0 : 3 }}
                    transition={{ duration: 0.3 }}
                    className="t-label mt-1 truncate text-ink-2"
                  >
                    {v}
                  </motion.div>
                </div>
              </Box>
            );
          })}

          <Box x={CORE.x} y={CORE.y} w={CORE.s} h={CORE.s} label="treslabs · v15" solid glow={thinking}>
            <div className="absolute inset-0 grid place-items-center">
              <Mark centered spinning={thinking} maxSpeed={11} className="h-[44%] w-[44%] text-ink" trail={false} title="" />
            </div>
            <div className="t-label absolute inset-x-0 bottom-2.5 text-center text-ink-3">{state}</div>
          </Box>

          <Box x={OUT.x} y={OUT.y} w={OUT.w} h={OUT.h} label="outcome">
            <div className="flex h-full items-center gap-3.5 px-4 pt-4">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] transition-colors duration-300 ${
                  on(T.outcome + 0.3) ? "bg-lime text-ink" : "bg-sink text-ink-3"
                }`}
              >
                <Check />
              </span>
              <motion.div initial={false} animate={{ opacity: on(T.outcome + 0.3) ? 1 : 0.35 }} transition={{ duration: 0.3 }} className="min-w-0">
                <div className="truncate text-[13.05px] font-[540]">{on(T.outcome + 0.3) ? scene.outcome[0] : "Waiting…"}</div>
                <div className="t-label mt-1 text-ink-2">{on(T.outcome + 0.3) ? scene.outcome[1] : "—"}</div>
              </motion.div>
            </div>
          </Box>

          <Box x={EVAL.x} y={EVAL.y} w={EVAL.w} h={EVAL.h} label="evaluation">
            <div className="flex h-full flex-col justify-center px-4 pt-5">
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[14.4px] flex-1 rounded-[3.6px] border transition-colors duration-200 ${
                      on(T.evaluate + 0.3 + i * 0.09) ? "border-lime-deep/50 bg-lime" : "border-line-2"
                    }`}
                  />
                ))}
              </div>
              <div className="t-label mt-2.5 text-ink-2">{on(T.evaluate + 0.3) ? "6 of 6 checks" : "waiting…"}</div>
            </div>
          </Box>
        </div>

        {/* mobile: the same steps, stacked */}
        <ol className="mx-auto grid max-w-sm gap-2 md:hidden">
          {[
            { k: "Treslabs", v: state, on: t > T.think[0] },
            ...scene.systems.map(([k, v], i) => ({ k, v, on: on(T.systems[i] + 0.35) })),
            { k: "Outcome", v: scene.outcome[0], on: on(T.outcome + 0.3) },
            { k: "Evaluation", v: "6 of 6 checks", on: on(T.evaluate + 0.3) },
          ].map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-[12.6px] border border-line bg-paper px-4 py-3">
              <span className="flex items-center gap-2.5 text-[13.05px] font-[540]">
                <span className={`h-[7.2px] w-[7.2px] rounded-[2.7px] transition-colors ${s.on ? "bg-lime-deep" : "bg-line-2"}`} />
                {s.k}
              </span>
              <span className={`t-label truncate text-ink-2 transition-opacity ${s.on ? "opacity-100" : "opacity-30"}`}>{s.v}</span>
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
      transition={{ duration: 0.2 + total / SPEED, times, ease: "linear" }}
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
