"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Mark } from "@/components/brand/Mark";
import { incident } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  "What happens in the two hours after something goes wrong?" — told as the log
  it leaves behind. A new version rolls out, evaluation catches a policy error,
  the rollout pauses itself, v15 (still warm) takes back every call, affected
  customers are corrected, and the fix is replayed before it tries again.
*/

const STEP_MS = 1150;
const LIMIT = 5; // policy-error limit, %

export function Incident() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35, once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);
  const shown = reduce ? incident.length : n;

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    let id = 0;
    const step = () => {
      i += 1;
      setN(i);
      if (i < incident.length) id = window.setTimeout(step, STEP_MS);
    };
    id = window.setTimeout(step, 300);
    return () => window.clearTimeout(id);
  }, [inView, reduce, run]);

  const k = shown === 0 ? "idle" : incident[shown - 1].k;
  const rolling = k === "rollout" || k === "detect";
  const paused = k === "pause" || k === "cause";
  const back = shown >= 5;
  const traffic = shown === 0 ? 0 : back ? 0 : 10;
  const errors = shown >= 2 && !back ? 14.6 : 0;
  const state = shown === 0 ? "ready" : rolling ? "rolling out" : paused ? "paused itself" : shown >= 7 ? "fixed · back in review" : "rolled back to v15";

  return (
    <Section
      id="incidents"
      eyebrow="When AI goes wrong"
      title="Built for the two hours after something goes wrong."
      sub="Changes still go wrong. What matters is how fast you see it, how few callers it reaches, and how cleanly you get back."
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-12">
        {/* live state */}
        <Card className="flex flex-col p-6 md:p-7 lg:col-span-5">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-[12px] border border-line bg-bone">
              <Mark spinning={rolling} maxSpeed={11} centered className="h-8 w-8 text-ink" trail={false} title="Rollout state" />
            </span>
            <div>
              <div className="t-label text-ink-3">Agent · v16</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: ease.out }}
                  className={`text-[21.6px] tracking-[-0.02em] ${paused ? "text-[#a8411f]" : ""}`}
                >
                  {state}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <Meter label="Calls on v16" value={`${traffic}%`} fill={traffic / 100} />
            <Meter
              label="Policy errors on v16"
              value={`${errors}%`}
              fill={errors / 20}
              limit={LIMIT / 20}
              limitLabel={`pause above ${LIMIT}%`}
              fault={errors > LIMIT}
            />
            <div className="flex items-center justify-between rounded-[10px] border border-line bg-bone px-4 py-3">
              <span className="text-[13.05px]">v15 · previous version</span>
              <span className="flex items-center gap-2 text-[12.6px] text-ink-2">
                <span className={`h-2 w-2 rounded-full ${back ? "bg-lime-deep" : "bg-lime-deep/40"}`} />
                {back ? "serving 100% of calls" : "kept warm"}
              </span>
            </div>
          </div>

          <p className="mt-auto pt-8 text-[12.6px] leading-[1.5] text-ink-2">
            No one woke up to find out. The limit did its job.
          </p>
        </Card>

        {/* the log it leaves behind */}
        <Card className="p-6 md:p-7 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="t-label text-ink-3">Incident log · Tuesday</div>
            {shown >= incident.length && !reduce && (
              <button
                onClick={() => {
                  setN(0);
                  setRun((r) => r + 1);
                }}
                className="t-label rounded-[7.2px] bg-sink px-2.5 py-1 text-ink-2 transition-colors hover:text-ink"
              >
                ↺ Replay
              </button>
            )}
          </div>
          <ol className="relative mt-6">
            <span className="absolute bottom-3 left-[62px] top-3 w-px bg-line" aria-hidden />
            {incident.map((e, i) => {
              const on = i < shown;
              const tone =
                e.k === "detect" || e.k === "pause"
                  ? "bg-fault"
                  : e.k === "rollback" || e.k === "correct" || e.k === "replay"
                    ? "bg-lime-deep"
                    : "bg-ink-3";
              return (
                <motion.li
                  key={`${e.t}-${e.k}`}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.22 }}
                  transition={{ duration: 0.4 }}
                  className="relative grid grid-cols-[48px_28px_1fr] items-start gap-0 py-2.5"
                >
                  <span className="pt-[1px] font-mono text-[11.7px] tabular-nums text-ink-3">{e.t}</span>
                  <span className="relative flex justify-center pt-[5px]">
                    <motion.span
                      initial={false}
                      animate={{ scale: on ? 1 : 0.6 }}
                      className={`relative h-2.5 w-2.5 rounded-full ring-4 ring-paper ${on ? tone : "bg-line-2"}`}
                    />
                  </span>
                  <span className={`text-[14.4px] leading-[1.45] ${e.k === "pause" && on ? "font-[540] text-[#a8411f]" : ""}`}>
                    {e.text}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </Card>
      </div>
    </Section>
  );
}

function Meter({
  label,
  value,
  fill,
  limit,
  limitLabel,
  fault,
}: {
  label: string;
  value: string;
  fill: number;
  limit?: number;
  limitLabel?: string;
  fault?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13.05px] text-ink-2">{label}</span>
        <span className={`font-mono text-[13.05px] tabular-nums ${fault ? "text-[#a8411f]" : ""}`}>{value}</span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-sink">
        <motion.div
          className={`h-full rounded-full ${fault ? "bg-fault" : "bg-ink"}`}
          initial={false}
          animate={{ width: `${Math.min(1, fill) * 100}%` }}
          transition={{ duration: 0.6, ease: ease.out }}
        />
        {limit !== undefined && (
          <span className="absolute -top-1 bottom-[-4px] w-px bg-ink/50" style={{ left: `${limit * 100}%` }} aria-hidden />
        )}
      </div>
      {limitLabel && <div className="t-label mt-1.5 text-ink-3">{limitLabel}</div>}
    </div>
  );
}
