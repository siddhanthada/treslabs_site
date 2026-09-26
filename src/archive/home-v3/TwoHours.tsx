"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { incident, security } from "@/content/scenario";
import { ease } from "@/lib/motion";
import { Mark } from "@/components/brand/Mark";
import { Consequence } from "@/components/brand/Consequence";

const STEP_MS = 1100;

/**
 * Operations: what happens when a change goes wrong, told as the log it leaves
 * behind. The mark spins while v16 rolls out and brakes to rest when the
 * rollout pauses itself. Security follows as a quiet, provisional strip.
 */
export function TwoHours() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35, once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
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
    id = window.setTimeout(step, 200);
    return () => window.clearTimeout(id);
  }, [inView, reduce]);

  const last = incident[Math.max(0, shown - 1)];
  const v16 = shown === 0 ? 0 : last.rollout;
  const rolling = shown >= 1 && shown < 3;
  const paused = shown >= 3 && shown < 5;
  const errorRate = shown >= 2 ? (shown >= 5 ? 0 : 14.6) : shown >= 1 ? 1.2 : 0;
  const state = rolling ? "rolling out" : paused ? "paused automatically" : shown >= 5 ? "rolled back to v15" : "waiting";

  return (
    <section data-nav="dark" className="bg-carbon text-on-carbon">
      <div className="wrap py-[var(--section-y)]">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <span className="t-kicker mb-6 block text-on-carbon-3">Operations</span>
            <h2 className="t-h2 max-w-[12ch]">Built for the two hours after something goes wrong.</h2>
            <p className="t-lead mt-6 max-w-[30rem] text-on-carbon-2">
              Changes still go wrong. What matters is how fast you see it, how few callers it
              reaches, and how cleanly you get back.
            </p>

            <div className="mt-12 flex items-center gap-4 border-t border-carbon-line pt-6">
              <span className="text-on-carbon">
                <Mark spinning={rolling} maxSpeed={11} className="h-[44px] w-auto" title="Rollout state" />
              </span>
              <div>
                <div className="t-label text-on-carbon-3">v16</div>
                <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: ease.out }}
                  className={`text-[20px] tracking-[-0.02em] ${paused ? "text-fault-lit" : ""}`}
                >
                  {state}
                </motion.div>
              </div>
            </div>
          </div>

          <div ref={ref} className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-carbon-line">
              <Meter
                label="Traffic on v16"
                value={`${v16}%`}
                fill={v16 / 100}
                tone={paused ? "fault" : "signal"}
              />
              <Meter
                label="Policy errors on v16"
                value={`${errorRate.toFixed(1)}%`}
                fill={Math.min(1, errorRate / 20)}
                limit={5 / 20}
                tone={errorRate > 5 ? "fault" : "ink"}
              />
            </div>

            <ol className="mt-8">
              {incident.map((row, i) => {
                const on = i < shown;
                const bad = row.kind === "fault" || row.kind === "stop";
                return (
                  <motion.li
                    key={i}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.16 }}
                    transition={{ duration: 0.5, ease: ease.out }}
                    className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-carbon-line py-3.5 md:grid-cols-[6rem_1fr]"
                  >
                    <span className={`t-num text-[22px] leading-none md:text-[26px] ${bad ? "text-fault-lit" : "text-on-carbon-2"}`}>
                      {row.time}
                    </span>
                    <span className="text-[15.5px] leading-[1.45]">{row.text}</span>
                  </motion.li>
                );
              })}
            </ol>
            <Consequence show={shown >= 6} className="mt-6 rounded-[3px] px-6 pb-5 pt-6">
              <div className="t-label text-umber/70">14:20 · sent to the 6 affected customers</div>
              <p className="speech-caller mt-2 text-[24px] leading-[1.15]">
                “We told you the wrong returns date earlier. You have until 12 October — no need to
                call us back.”
              </p>
            </Consequence>
            <p className="t-label mt-4 text-on-carbon-3">
              41 calls reached v16. 6 were affected. All 6 were contacted within 20 minutes.
            </p>
          </div>
        </div>

        {/* trust, restrained — every claim provisional until confirmed */}
        <div id="security" className="mt-[var(--section-y)] border-t border-carbon-line pt-12">
          <div className="grid gap-8 lg:grid-cols-12">
            <h3 className="t-h3 max-w-[20ch] lg:col-span-5">
              Software that talks to your customers should be boring about security.
            </h3>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-7">
              {security.map((s) => (
                <div key={s.k}>
                  <dt className="t-label flex items-center gap-2 text-on-carbon-3">
                    {s.k}
                    {!s.verified && (
                      <span className="rounded-[3px] border border-dashed border-fault-lit/60 px-1 text-[10px] text-fault-lit">
                        draft · confirm
                      </span>
                    )}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-[1.45] text-on-carbon-2">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({
  label,
  value,
  fill,
  limit,
  tone,
}: {
  label: string;
  value: string;
  fill: number;
  limit?: number;
  tone: "signal" | "fault" | "ink";
}) {
  const bar = tone === "fault" ? "bg-fault-lit" : tone === "signal" ? "bg-signal-lit" : "bg-on-carbon-2";
  return (
    <div className="bg-carbon-2 px-5 py-5 md:px-6">
      <div className="t-label text-on-carbon-3">{label}</div>
      <div className="t-num mt-2 text-[40px] leading-none md:text-[52px]">{value}</div>
      <div className="relative mt-4 h-[5px] rounded-full bg-carbon-line">
        <motion.div
          className={`h-full origin-left rounded-full ${bar}`}
          initial={false}
          animate={{ scaleX: fill }}
          transition={{ type: "spring", stiffness: 165, damping: 17.5 }}
        />
        {limit !== undefined && (
          <span className="absolute -top-1.5 h-[17px] w-px bg-on-carbon" style={{ left: `${limit * 100}%` }}>
            <span className="t-label absolute left-1.5 top-[-3px] whitespace-nowrap text-[10px] text-on-carbon-3">limit 5%</span>
          </span>
        )}
      </div>
    </div>
  );
}
