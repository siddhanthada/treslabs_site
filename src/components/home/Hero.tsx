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

      <Trace t={t} loop={loop} scene={scene} />
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

/* ── The live call trace ─────────────────────────────────────────────────
   The same call as the hero, drawn the way engineers read a request: lanes for
   who spoke and what Treslabs did in each system, a playhead, and the checks
   landing at the end. Evidence, not a flowchart. */

const DOM = 8.4; // seconds of the loop shown on the trace
const at = (v: number) => `${(Math.min(v, DOM) / DOM) * 100}%`;
const span = (a: number, b: number) => `${((Math.min(b, DOM) - a) / DOM) * 100}%`;

function Trace({ t, loop, scene }: { t: number; loop: number; scene: Scene }) {
  const head = Math.min(t, DOM);
  const working = t > T.think[0] && t < T.outcome;
  const state = t < T.think[0] ? "Listening" : t < T.outcome ? "Working" : t < T.ends ? "Resolved" : "Evaluated";
  const lanes: { k: string; bars: { a: number; b: number; tone: "caller" | "agent" | "system" | "outcome"; label?: string }[] }[] = [
    {
      k: "Caller",
      bars: [
        { a: T.caller, b: 2.1, tone: "caller" },
        { a: T.reply, b: 6, tone: "caller" },
      ],
    },
    { k: "Agent", bars: [{ a: T.agent, b: 4.1, tone: "agent" }] },
    ...scene.systems.map(([k, v], i) => ({
      k,
      bars: [{ a: T.systems[i], b: T.systems[i] + (i === 3 ? 0.9 : 0.75), tone: "system" as const, label: v }],
    })),
    { k: "Outcome", bars: [{ a: T.outcome, b: DOM, tone: "outcome" as const, label: scene.outcome[0] }] },
  ];

  return (
    <section aria-label="The live call, traced" className="pb-[clamp(40px,6vw,88px)]">
      <div className="wrap">
        <div className="mx-auto max-w-[1100px] rounded-[22px] bg-paper p-2 shadow-[0_40px_80px_-50px_rgba(17,18,24,.35)] ring-1 ring-line">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-bone">
                <Mark centered spinning={working} maxSpeed={11} className="h-4 w-4 text-ink" trail={false} title="" />
              </span>
              <span className="text-[14.4px] font-[540]">Live call trace</span>
            </div>
            <span
              className={`rounded-[8px] px-2.5 py-1 text-[12.15px] transition-colors duration-300 ${
                state === "Working" ? "bg-sink text-ink" : state === "Listening" ? "bg-sink text-ink-2" : "bg-lime text-ink"
              }`}
            >
              {state}
            </span>
          </div>

          {/* lanes */}
          <div className="overflow-x-auto rounded-[16px] bg-bone">
            <div className="relative min-w-[620px] px-4 py-4 sm:px-5">
              {lanes.map((l) => (
                <div key={l.k} className="grid grid-cols-[132px_1fr] items-center gap-4 py-[5px]">
                  <span className="truncate text-[13.05px] text-ink-2">{l.k}</span>
                  <div className="relative h-[26px]">
                    {l.bars
                      .filter((b) => b.tone === "system")
                      .map((b, n) => (
                        <span
                          key={`label-${n}`}
                          className={`absolute inset-y-0 flex items-center whitespace-nowrap pl-2.5 text-[12.15px] text-ink-2 transition-opacity duration-300 ${
                            head >= b.b ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ left: at(b.b) }}
                        >
                          {b.label}
                        </span>
                      ))}
                    {l.bars.map((b, n) => {
                      const shown = Math.max(0, Math.min(1, (head - b.a) / (b.b - b.a)));
                      return (
                        <div
                          key={n}
                          className="absolute inset-y-0 overflow-hidden"
                          style={{ left: at(b.a), width: span(b.a, b.b) }}
                        >
                          <div
                            className={`flex h-full items-center overflow-hidden whitespace-nowrap rounded-[7px] transition-[width] duration-100 ease-linear ${
                              b.tone === "caller"
                                ? "bg-ink/85"
                                : b.tone === "agent"
                                  ? "bg-[#9bbd28]"
                                  : b.tone === "outcome"
                                    ? "bg-lime ring-1 ring-lime-deep/30"
                                    : "bg-lime-deep/85"
                            }`}
                            style={{ width: `${shown * 100}%`, opacity: shown > 0 ? 1 : 0 }}
                          >
                            {(b.tone === "caller" || b.tone === "agent") && <SpeechTexture tone={b.tone} />}
                            {b.label && b.tone === "outcome" && <span className="px-2.5 text-[12.15px] font-[540] text-ink">{b.label}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* checks */}
              <div className="mt-2 grid grid-cols-[132px_1fr] items-center gap-4 border-t border-line pt-3">
                <span className="text-[13.05px] text-ink-2">Checks</span>
                <div className="relative h-[22px]">
                  <div className="absolute inset-y-0 right-0 flex items-center gap-1.5">
                    {Array.from({ length: 6 }, (_, i) => (
                      <span
                        key={`${loop}-${i}`}
                        className={`h-[16px] w-[16px] rounded-[4.5px] transition-colors duration-200 ${
                          t >= T.evaluate + 0.2 + i * 0.09 ? "bg-lime ring-1 ring-lime-deep/40" : "bg-paper ring-1 ring-line"
                        }`}
                      />
                    ))}
                    <span className={`order-first mr-2 text-[12.15px] transition-opacity duration-300 ${t >= T.evaluate + 0.8 ? "opacity-100" : "opacity-0"}`}>6 of 6 checks passed</span>
                  </div>
                </div>
              </div>

              {/* playhead */}
              <div className="pointer-events-none absolute inset-y-3 left-[calc(132px+16px+16px)] right-4 sm:left-[calc(132px+16px+20px)] sm:right-5">
                <span
                  className="absolute inset-y-0 w-px bg-ink/60 transition-[left] duration-100 ease-linear"
                  style={{ left: at(head), opacity: t >= T.ends ? 0 : 1 }}
                  aria-hidden
                />
              </div>

              {/* axis */}
              <div className="mt-3 grid grid-cols-[132px_1fr] gap-4">
                <span />
                <div className="flex justify-between font-mono text-[10.8px] text-ink-3">
                  {[0, 10, 20, 30, 40].map((s) => (
                    <span key={s}>0:{String(s).padStart(2, "0")}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A soft voice texture inside a speech bar. */
function SpeechTexture({ tone }: { tone: "caller" | "agent" }) {
  return (
    <span className="flex h-full flex-1 items-center gap-[3px] px-2" aria-hidden>
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className={`w-[2px] shrink-0 rounded-full ${tone === "caller" ? "bg-bone/50" : "bg-ink/35"}`}
          style={{ height: `${30 + ((i * 53) % 55)}%` }}
        />
      ))}
    </span>
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
