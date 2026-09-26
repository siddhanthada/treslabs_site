"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { callDana, callOmar, type Call, type SystemEvent, type Turn } from "@/content/scenario";
import { ease, fmtInt, fmtTime } from "@/lib/motion";
import { color } from "@/lib/tokens";
import { Mark } from "@/components/brand/Mark";
import { Consequence } from "@/components/brand/Consequence";
import { SpokenWords, plain, turnProgress } from "@/components/speech/Spoken";

export function Actions() {
  return (
    <section id="actions" className="section-y">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="t-h2 max-w-[13ch] lg:col-span-7">
            It does the work — and knows where to stop.
          </h2>
          <p className="t-lead text-ink-2 lg:col-span-5">
            Mid-call, the agent reaches into your systems and brings back what it needs. When a
            request crosses a limit you set, a person takes over with the whole story.
          </p>
        </div>
        <div className="mt-14 space-y-6 md:mt-20 md:space-y-8">
          <CallActions call={callDana} caption="Does the work" playSeconds={8} />
          <CallActions call={callOmar} caption="Knows where to stop" playSeconds={6.5} />
        </div>
      </div>
    </section>
  );
}

const ROW = 60;
const CONV = 36;

/** The agent's turn that used a system's answer: the one in progress, else the next. */
const replyTo = (call: Call, e: SystemEvent): Turn | undefined =>
  call.turns.find((u) => u.who === "agent" && ((u.t0 <= e.at && u.t1 >= e.at + 0.8) || u.t0 >= e.at));

function CallActions({ call, caption, playSeconds }: { call: Call; caption: string; playSeconds: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.45, once: true });
  const reduce = useReducedMotion();
  const time = useMotionValue(reduce ? call.duration : 0);
  const [t, setT] = useState(reduce ? call.duration : 0);
  useMotionValueEvent(time, "change", (v) => {
    if (Math.abs(v - t) > 0.12 || v >= call.duration) setT(v);
  });

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(time, call.duration, { duration: playSeconds, ease: "linear", delay: 0.3 });
    return () => c.stop();
  }, [inView, reduce, time, call.duration, playSeconds]);

  const systems = Array.from(new Set(call.systems.map((e) => e.system)));
  const D = call.duration;
  const x = (s: number) => `${(s / D) * 100}%`;
  const left = useTransform(time, (s) => `${(s / D) * 100}%`);
  const done = t >= D - 0.01;
  const speaking = [...call.turns].reverse().find((u) => u.t0 <= t);
  const replies = new Set(call.systems.map((e) => replyTo(call, e)?.t0));

  return (
    <div ref={ref} className="overflow-hidden rounded-[14px] border border-line bg-paper">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-4 md:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="text-[16px] font-[560] tracking-[-0.01em]">{caption}</span>
          <span className="t-label text-ink-3">
            call {fmtInt(call.id)} · {call.caller}
          </span>
        </div>
        <motion.span className="t-label text-ink-2" animate={{ opacity: done ? 1 : 0.3 }} transition={{ duration: 0.5 }}>
          {call.outcome.label} · {fmtTime(D)}
        </motion.span>
      </header>

      {/* desktop: actions propagate out of the conversation and back */}
      <div className="hidden px-8 pb-7 pt-6 lg:block">
        <div className="mb-6 min-h-[64px] max-w-[62ch]">
          {speaking && (
            <p
              key={speaking.t0}
              className={
                speaking.who === "caller"
                  ? "speech-caller text-[24px] text-ink"
                  : "speech-agent text-[17px] text-ink-2"
              }
            >
              <span className="t-label mr-3 align-middle text-ink-3">
                {speaking.who === "caller" ? call.caller.split(" ")[0] : "Agent"}
              </span>
              <SpokenWords text={speaking.text} progress={turnProgress(speaking, t)} voice={speaking.who} cut={speaking.cut} />
            </p>
          )}
        </div>

        <div className="grid grid-cols-[9.5rem_1fr]">
          <div>
            <div className="t-label flex items-center text-ink-3" style={{ height: CONV }}>
              Conversation
            </div>
            {systems.map((s) => (
              <div key={s} className="t-label flex items-center border-t border-line text-ink-3" style={{ height: ROW }}>
                {s}
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: CONV + systems.length * ROW }}>
            {systems.map((s, i) => (
              <div key={s} className="absolute inset-x-0 border-t border-line" style={{ top: CONV + i * ROW }} />
            ))}
            {call.turns.map((u) => {
              const lit = replies.has(u.t0) && t >= u.t0 && t < u.t0 + 4;
              return (
                <span
                  key={u.t0}
                  className="absolute h-[8px] rounded-[2px] transition-colors duration-700"
                  style={{
                    top: CONV / 2 - 4,
                    left: x(u.t0),
                    width: x(Math.max(0, Math.min(t, u.t1) - u.t0)),
                    opacity: t > u.t0 ? 1 : 0,
                    backgroundColor: lit ? color.signal : u.who === "caller" ? color.ink : "rgba(140,143,147,.55)",
                  }}
                />
              );
            })}
            {call.systems.map((e) => (
              <Propagation
                key={e.at}
                e={e}
                on={t >= e.at}
                laneY={CONV + systems.indexOf(e.system) * ROW + ROW / 2}
                left={x(e.at)}
                flip={e.at / D > 0.62}
              />
            ))}
            <motion.span aria-hidden className="pointer-events-none absolute bottom-0 top-0 w-px bg-signal" style={{ left }} />
          </div>
        </div>
        <div className="t-label ml-[9.5rem] mt-3 flex justify-between text-ink-3">
          <span>0:00</span>
          <span>{fmtTime(D)}</span>
        </div>
      </div>

      {call.consequence && (
        <Consequence show={done} delay={0.3} className="px-8 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <p className="speech-caller text-[24px] leading-[1.1]">{call.consequence.headline}</p>
            <p className="text-[14px] text-umber">
              <span className="t-data mr-2 text-[12px]">{call.consequence.steps[call.consequence.steps.length - 1].at}</span>
              {call.consequence.steps[call.consequence.steps.length - 1].text}
            </p>
          </div>
        </Consequence>
      )}

      {/* phones and tablets: the same events, as a sequence */}
      <ol className="relative px-5 py-5 md:px-8 lg:hidden">
        <span aria-hidden className="absolute bottom-7 left-[27px] top-7 w-px bg-line md:left-[39px]" />
        {call.systems.map((e) => (
          <MobileEvent key={e.at} e={e} on={t >= e.at} reply={replyTo(call, e)} />
        ))}
      </ol>
    </div>
  );
}

/**
 * One tool call: out from the conversation, a moment of waiting, a state
 * comes back, and the reply that used it lights up.
 */
function Propagation({
  e,
  on,
  laneY,
  left,
  flip,
}: {
  e: SystemEvent;
  on: boolean;
  laneY: number;
  left: string;
  flip: boolean;
}) {
  const warn = e.status === "slow" || e.status === "blocked";
  const wait = e.status === "slow" ? 0.9 : 0.45;
  const top = CONV / 2;
  return (
    <div className="absolute" style={{ left, top: 0 }}>
      <motion.span
        aria-hidden
        className="absolute left-0 w-px origin-top"
        style={{ top, height: laneY - top }}
        initial={false}
        animate={{
          scaleY: on ? 1 : 0,
          backgroundColor: on ? [color.signal, color.signal, warn ? color.fault : color.line2] : color.line2,
        }}
        transition={{ scaleY: { duration: 0.3, ease: ease.out }, backgroundColor: { duration: 2.2, times: [0, 0.5, 1] } }}
      />
      {on && (
        <motion.span
          aria-hidden
          className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-signal"
          initial={{ top: top - 3, opacity: 0 }}
          animate={{ top: [top - 3, laneY - 3, laneY - 3, top - 3], opacity: [1, 1, 1, 0] }}
          transition={{ duration: 1.05 + wait, times: [0, 0.3, 0.3 + wait / (1.05 + wait), 1], ease: "easeInOut" }}
        />
      )}
      <motion.span
        className={`absolute flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-[6px] border border-line-2 bg-bone px-2.5 py-[5px] ${flip ? "right-0" : "left-0"}`}
        style={{ top: laneY }}
        initial={false}
        animate={{ opacity: on ? [0, 1, 1, 0] : 0 }}
        transition={{ duration: 0.45 + wait, times: [0, 0.15, 0.85, 1] }}
      >
        <Mark spinning={on} maxSpeed={9} className="h-[11px] w-auto text-ink" title="" />
        <span className="t-label text-ink-3">{e.system.toLowerCase()}…</span>
      </motion.span>
      <motion.div
        initial={false}
        animate={{
          opacity: on ? 1 : 0,
          x: on ? 0 : flip ? 6 : -6,
          borderColor: on
            ? [color.signal, e.status === "handoff" ? color.ink : warn ? "rgba(194,80,46,0.4)" : color.line2]
            : color.line2,
        }}
        transition={{
          delay: on ? 0.25 + wait : 0,
          duration: 0.5,
          ease: ease.out,
          borderColor: { delay: 0.25 + wait, duration: 1.6 },
        }}
        className={`absolute flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-[6px] border px-2.5 py-[5px] ${
          flip ? "right-0" : "left-0"
        } ${e.status === "handoff" ? "bg-ink text-bone" : warn ? "bg-fault-tint/50 text-fault" : "bg-bone text-ink"}`}
        style={{ top: laneY }}
      >
        {e.status === "blocked" && <Stop />}
        <span className="text-[13px] font-[520] leading-none tracking-[-0.01em]">{e.label}</span>
        <span className={`t-label leading-none ${e.status === "handoff" ? "text-bone/60" : warn ? "text-fault/80" : "text-ink-3"}`}>
          {e.detail}
        </span>
      </motion.div>
    </div>
  );
}

function MobileEvent({ e, on, reply }: { e: SystemEvent; on: boolean; reply?: Turn }) {
  const warn = e.status === "slow" || e.status === "blocked";
  return (
    <motion.li
      initial={false}
      animate={{ opacity: on ? 1 : 0.25 }}
      transition={{ duration: 0.4 }}
      className="relative grid grid-cols-[1.25rem_1fr] gap-3 py-2.5"
    >
      <span
        className={`relative z-10 mt-[5px] h-[11px] w-[11px] rounded-full border-2 ${
          on ? (warn ? "border-fault bg-fault" : e.status === "handoff" ? "border-ink bg-ink" : "border-ink bg-bone") : "border-line-2 bg-paper"
        }`}
      />
      <div>
        <div className="t-label text-ink-3">
          {fmtTime(e.at)} · {e.system}
        </div>
        <div className={`mt-0.5 text-[15px] leading-snug ${warn ? "text-fault" : ""}`}>
          {e.label} <span className="text-ink-3">— {e.detail}</span>
        </div>
        {reply && on && e.status !== "handoff" && (
          <div className="speech-agent mt-1 text-[13.5px] text-ink-3">“{plain(reply.text).slice(0, 72)}…”</div>
        )}
      </div>
    </motion.li>
  );
}

function Stop() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.6 9.4 9.4 2.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
