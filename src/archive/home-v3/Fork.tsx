"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { callRob, robFork, robReplay, robSilence, type Call, type Turn } from "@/content/scenario";
import { useCallClock } from "@/components/speech/useCallClock";
import { SpokenWords, turnProgress } from "@/components/speech/Spoken";
import { Mark } from "@/components/brand/Mark";
import { Consequence } from "@/components/brand/Consequence";
import { ease, fmtTime } from "@/lib/motion";
import { color } from "@/lib/tokens";
import { NARROW, useMediaQuery } from "@/lib/useMediaQuery";

const SPEED = 1.25;
const END = 36;
const GAP = 1.6; // visual room for the fork, in seconds
const XMAX = END + GAP;
const x = (t: number) => ((t < robFork ? t : t + GAP) / XMAX) * 100;

const shared = callRob.turns.filter((u) => u.t1 <= robFork);
const v14 = callRob.turns.filter((u) => u.t0 >= robFork);
const v15 = robReplay.turns.filter((u) => u.t0 >= robFork);

/**
 * One recorded call, forked. The trunk is Rob's real call up to the moment
 * it went wrong; the branches are v14 as it happened and v15 as replayed.
 */
export function Fork() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const started = useInView(ref, { amount: 0.4, once: true });
  const reduce = useReducedMotion();
  const isNarrow = useMediaQuery(NARROW);
  const [runs, setRuns] = useState(0);
  const { t, time, seek } = useCallClock({
    duration: END,
    playing: started && inView && !reduce,
    speed: SPEED,
  });
  const now = reduce ? END : t;
  const head = useTransform(time, (s) => `${x(s)}%`);
  const done = now >= END - 0.5;

  return (
    <section className="section-y overflow-hidden" aria-labelledby="fork-title">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <span className="t-kicker mb-6 block text-ink-3">Before and after</span>
            <h2 id="fork-title" className="t-h2 max-w-[15ch]">
              Same caller. Same words. Then the call forks.
            </h2>
          </div>
          <p className="t-lead text-ink-2 lg:col-span-5">
            Rob’s Tuesday call on v14, and the same call replayed on v15 before anyone approved it.
            Up to the fork it’s his recording; after it, a simulated caller answers as he would.
          </p>
        </div>

        <div ref={ref} className="mt-14 lg:mt-20">
          {isNarrow ? (
            <ForkNarrow t={now} />
          ) : (
            <ForkWide t={now} head={head} />
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6 lg:mt-14">
          <Consequence show={done} className="min-h-[132px] flex-1 rounded-[3px] px-7 pb-6 pt-6">
            <div className="grid items-end gap-6 lg:grid-cols-[1.4fr_1fr]">
              <p className="speech-caller text-[30px] leading-[1.05] md:text-[40px]">
                The same question, one version later. This time, an answer.
              </p>
              <p className="text-[15px] leading-[1.45] text-umber">
                <span className="t-data mr-2 text-[12px]">Thu 14:52</span>
                Dana’s lamp arrived in Leeds, the way v15 said it would. 61 of Tuesday’s 73 callers
                would have heard the same.
              </p>
            </div>
          </Consequence>
          <button
            type="button"
            onClick={() => {
              seek(0);
              setRuns((r) => r + 1);
            }}
            className="btn btn-line !h-10 !text-[14px]"
            aria-label="Play the fork again"
            key={runs}
          >
            <span aria-hidden>↺</span> Play again
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── desktop: a horizontal fork ───────────────────────────────────── */

const Y = { top: 150, trunk: 238, low: 326 };

function ForkWide({ t, head }: { t: number; head: MotionValue<string> }) {
  const forked = t >= robFork;
  const inSilence = t > robSilence.t0 && t < robSilence.t1;
  const silence = Math.max(0, Math.min(t, robSilence.t1) - robSilence.t0);
  const sysOn = t >= 15.0;

  const topLine = current(forked ? v14 : shared, t);
  const lowLine = forked ? current(v15, t) : null;

  return (
    <div className="relative h-[476px]" role="img" aria-label="Rob's call forks at 16 seconds. On v14 the agent goes silent for 4.2 seconds, apologises, and Rob hangs up. On v15 the agent answers from the warehouse feed and the call is resolved.">
      {/* captions */}
      <Caption line={topLine} t={t} tag={forked ? "v14 · Tuesday" : "Rob’s call · both versions"} pos="top" />
      <Caption line={lowLine} t={t} tag="v15 · replay" pos="low" />

      {/* branches */}
      <svg viewBox="0 0 1000 476" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d={`M${x(robFork) * 10} ${Y.trunk} C ${x(robFork) * 10 + 28} ${Y.trunk}, ${x(robFork) * 10 + 14} ${Y.top}, ${x(robFork + 0.01) * 10 + 43} ${Y.top}`}
          fill="none"
          stroke={color.line2}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M${x(robFork) * 10} ${Y.trunk} C ${x(robFork) * 10 + 28} ${Y.trunk}, ${x(robFork) * 10 + 14} ${Y.low}, ${x(robFork + 0.01) * 10 + 43} ${Y.low}`}
          fill="none"
          stroke={forked ? color.signal : color.line2}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
        />
        <line x1={0} x2={x(robFork) * 10} y1={Y.trunk} y2={Y.trunk} stroke={color.line} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <line x1={x(robFork + 0.01) * 10 + 43} x2={1000} y1={Y.top} y2={Y.top} stroke={color.line} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <line x1={x(robFork + 0.01) * 10 + 43} x2={1000} y1={Y.low} y2={Y.low} stroke={color.line} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>

      <Segs turns={shared} t={t} y={Y.trunk} />
      <Segs turns={v14} t={t} y={Y.top} />
      <Segs turns={v15} t={t} y={Y.low} />

      {/* the fork point */}
      <div className="absolute" style={{ left: `${x(robFork)}%`, top: Y.trunk - 30 }}>
        <span className="t-label -translate-x-1/2 whitespace-nowrap text-ink-3" style={{ display: "inline-block" }}>
          fork · {fmtTime(robFork)}
        </span>
      </div>

      {/* v14: the silence */}
      <div
        className="hatch-fault absolute h-[10px] rounded-[1px]"
        style={{
          left: `${x(robSilence.t0)}%`,
          width: `${(silence / XMAX) * 100}%`,
          top: Y.top - 5,
          opacity: silence > 0 ? 1 : 0,
        }}
      />
      <div className="absolute" style={{ left: `${x(robSilence.t0)}%`, top: Y.top + 14 }}>
        <span
          className={`t-num inline-block text-[34px] leading-none text-fault transition-opacity duration-500 ${silence > 0 ? "opacity-100" : "opacity-0"}`}
        >
          {silence.toFixed(1)}s
        </span>
        <span className={`t-label ml-2 text-fault transition-opacity ${silence > 0 && !inSilence ? "opacity-100" : "opacity-0"}`}>
          of silence
        </span>
      </div>

      {/* v15: the fallback, caused by the slow carrier */}
      <div className="absolute flex items-center gap-2" style={{ left: `${x(robFork) + 3}%`, top: Y.low + 16 }}>
        <span className="text-ink">
          <Mark spinning={t >= 15 && t < 16.2} maxSpeed={10} className="h-[12px] w-auto" title="" />
        </span>
        <motion.span
          initial={false}
          animate={{ opacity: sysOn ? 1 : 0, color: t >= 16.2 && t < 19 ? color.signal : color.ink2 }}
          transition={{ duration: 0.8 }}
          className="t-label whitespace-nowrap"
        >
          carrier silent 1.2s → warehouse feed: left Manchester 07:10
        </motion.span>
      </div>

      {/* outcomes */}
      <Outcome call={callRob} t={t} top={Y.top} />
      <Outcome call={robReplay} t={t} top={Y.low} />

      {/* playhead */}
      <motion.span className="absolute bottom-0 top-0 w-px bg-signal" style={{ left: head }} aria-hidden />
    </div>
  );
}

function current(turns: Turn[], t: number) {
  const started = turns.filter((u) => u.t0 <= t);
  return started[started.length - 1] ?? null;
}

function Caption({ line, t, tag, pos }: { line: Turn | null; t: number; tag: string; pos: "top" | "low" }) {
  return (
    <div className={`absolute left-0 right-[22%] ${pos === "top" ? "top-0" : "bottom-0"}`}>
      <div className={`t-label mb-2 ${pos === "low" ? "text-signal" : "text-ink-3"}`}>
        {line ? tag : ""}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {line && (
          <motion.p
            key={line.t0 + pos}
            initial={{ opacity: 0, y: pos === "top" ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: ease.out }}
            className={
              line.who === "caller"
                ? "speech-caller text-[26px] text-ink lg:text-[32px]"
                : "speech-agent text-[17px] text-ink-2 lg:text-[19px]"
            }
          >
            <span className="t-label mr-3 align-middle text-ink-3">
              {line.who === "caller" ? "Rob" : "Agent"}
              {line.simulated ? " · simulated" : ""}
            </span>
            <SpokenWords text={line.text} progress={turnProgress(line, t)} voice={line.who} />
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Segs({ turns, t, y }: { turns: Turn[]; t: number; y: number }) {
  return (
    <>
      {turns
        .filter((u) => u.t0 <= t)
        .map((u) => (
          <span
            key={u.t0}
            className={`absolute h-[10px] rounded-[2px] ${u.who === "caller" ? "bg-ink" : "bg-ink-3/55"}`}
            style={{
              left: `${x(u.t0)}%`,
              width: `${((Math.min(t, u.t1) - u.t0) / XMAX) * 100}%`,
              top: y - 5,
            }}
          />
        ))}
    </>
  );
}

function Outcome({ call, t, top }: { call: Call; t: number; top: number }) {
  const on = t >= call.duration;
  const bad = call.outcome.tone === "fault";
  return (
    <motion.div
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.15 }}
      transition={{ type: "spring", stiffness: 165, damping: 17.5 }}
      className="absolute right-0"
      style={{ top: top - 40 }}
    >
      <span
        className={`t-data whitespace-nowrap rounded-[5px] px-2 py-[3px] text-[12px] ${
          bad ? "bg-fault-tint text-fault" : "bg-ink text-bone"
        }`}
      >
        {bad ? "Hung up" : "Resolved"} · {fmtTime(call.duration)}
      </span>
    </motion.div>
  );
}

/* ─── phones: the fork, vertical ───────────────────────────────────── */

function ForkNarrow({ t }: { t: number }) {
  const silence = Math.max(0, Math.min(t, robSilence.t1) - robSilence.t0);
  const line = (u: Turn) => {
    const p = turnProgress(u, t);
    return (
      <p
        key={u.t0}
        className={`${u.who === "caller" ? "speech-caller text-[19px] text-ink" : "speech-agent text-[14px] text-ink-2"} transition-opacity`}
        style={{ opacity: p > 0 ? 1 : 0.18 }}
      >
        <SpokenWords text={u.text} progress={p} voice={u.who} ghost={0.18} />
        {u.simulated && <span className="t-label ml-1 text-ink-3"> sim</span>}
      </p>
    );
  };
  return (
    <div>
      <div className="space-y-3 border-l border-line-2 pl-4">{shared.slice(1).map(line)}</div>
      <div className="t-label my-5 flex items-center gap-2 text-ink-3">
        <span className="h-px flex-1 bg-line-2" /> fork · {fmtTime(robFork)} <span className="h-px flex-1 bg-line-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3 border-l border-line-2 pl-3">
          <div className="t-label text-ink-3">v14 · Tuesday</div>
          {line(v14[0])}
          <div className="flex items-center gap-2">
            <span className="hatch-fault h-[6px] rounded-[1px]" style={{ width: `${(silence / 4.2) * 64}px` }} />
            <span className="t-data text-[11px] text-fault">{silence > 0 ? `${silence.toFixed(1)}s` : ""}</span>
          </div>
          {v14.slice(1).map(line)}
          <Outcome2 call={callRob} t={t} />
        </div>
        <div className="space-y-3 border-l border-signal/50 pl-3">
          <div className="t-label text-signal">v15 · replay</div>
          <div className="t-label text-ink-3" style={{ opacity: t >= 15 ? 1 : 0.2 }}>
            carrier 1.2s → warehouse
          </div>
          {v15.map(line)}
          <Outcome2 call={robReplay} t={t} />
        </div>
      </div>
    </div>
  );
}

function Outcome2({ call, t }: { call: Call; t: number }) {
  const bad = call.outcome.tone === "fault";
  return (
    <span
      className={`t-data inline-block rounded-[5px] px-2 py-[3px] text-[11px] transition-opacity duration-500 ${
        bad ? "bg-fault-tint text-fault" : "bg-ink text-bone"
      }`}
      style={{ opacity: t >= call.duration ? 1 : 0 }}
    >
      {bad ? "Hung up" : "Resolved"} · {fmtTime(call.duration)}
    </span>
  );
}
