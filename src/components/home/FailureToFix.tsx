"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Mark } from "@/components/brand/Mark";
import { ease } from "@/lib/motion";

const STEP_MS = 1100;

export function FailureToFix() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const shown = reduce ? 5 : n;

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    let id = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < 5) id = window.setTimeout(tick, STEP_MS);
    };
    id = window.setTimeout(tick, 250);
    return () => window.clearTimeout(id);
  }, [inView, reduce]);

  const steps = [
    { k: "Detect", big: "1 call", small: "flagged unresolved", v: <Pulse /> },
    { k: "Group", big: "73 calls", small: "same step, 7 days", v: <Cluster on={shown >= 2} /> },
    { k: "Propose", big: "1 change", small: "carrier fallback", v: <Diff /> },
    { k: "Replay", big: "+5.0 pts", small: "1,273 calls · 0 regressions", v: <Replay on={shown >= 4} /> },
    { k: "Approve", big: "v15 live", small: "approved by Priya R.", v: <Approve on={shown >= 5} /> },
  ];

  return (
    <Section
      id="improve"
      eyebrow="Improvement you can audit"
      title="One call fails. Here’s what happens next."
      sub="The carrier’s system was slow, and the agent gave up. Treslabs turned that into a tested fix."
    >
      <div ref={ref} className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {steps.map((s, i) => {
          const on = i < shown;
          return (
            <motion.div
              key={s.k}
              initial={false}
              animate={{ opacity: on ? 1 : 0.4, y: on ? 0 : 8 }}
              transition={{ duration: 0.6, ease: ease.out }}
            >
              <Card className={`flex h-full flex-col p-5 transition-colors duration-500 ${i === 4 && on ? "!border-ink !bg-ink text-bone" : ""}`}>
                <div className={`t-label ${i === 4 && on ? "text-bone/60" : "text-ink-3"}`}>
                  0{i + 1} {s.k}
                </div>
                <div className="my-5 grid h-[82.8px] place-items-center">{s.v}</div>
                <div className="mt-auto text-[23.4px] font-[540] leading-none tracking-[-0.03em]">{s.big}</div>
                <div className={`mt-1.5 text-[12.6px] ${i === 4 && on ? "text-bone/70" : "text-ink-2"}`}>{s.small}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

function Pulse() {
  return (
    <span className="relative grid h-10 w-10 place-items-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-fault/20" />
      <span className="h-4 w-4 rounded-full bg-fault" />
    </span>
  );
}

function Cluster({ on }: { on: boolean }) {
  return (
    <div className="grid grid-cols-9 gap-[4.5px]">
      {Array.from({ length: 36 }, (_, i) => (
        <motion.span
          key={i}
          className="h-[8.1px] w-[8.1px] rounded-full bg-fault"
          initial={false}
          animate={{ opacity: on ? 1 : 0.15, scale: on ? 1 : 0.6 }}
          transition={{ delay: on ? i * 0.012 : 0, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

function Diff() {
  return (
    <div className="w-full space-y-1.5 text-[10.35px] leading-tight">
      <div className="rounded-[5.4px] bg-fault-tint px-2 py-1 text-fault">− apologise, offer a callback</div>
      <div className="rounded-[5.4px] bg-sink px-2 py-1 text-ink">+ after 1.2s, use warehouse feed</div>
      <div className="rounded-[5.4px] bg-sink px-2 py-1 text-ink">+ tell the caller what’s known</div>
    </div>
  );
}

function Replay({ on }: { on: boolean }) {
  return (
    <div className="w-full space-y-2">
      {[71.6, 76.6].map((p, i) => (
        <div key={p} className="h-[7.2px] rounded-full bg-sink">
          <motion.div
            className={`h-full rounded-full ${i ? "bg-lime" : "bg-line-2"}`}
            initial={false}
            animate={{ width: on ? `${p}%` : "0%" }}
            transition={{ duration: 0.9, delay: i * 0.25, ease: ease.out }}
          />
        </div>
      ))}
    </div>
  );
}

function Approve({ on }: { on: boolean }) {
  return (
    <span className={on ? "text-lime" : "text-ink-3"}>
      <Mark spinning={false} intro={false} className="h-[39.6px] w-auto" title="" />
    </span>
  );
}
