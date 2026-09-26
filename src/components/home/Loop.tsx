"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Mark } from "@/components/brand/Mark";
import { ease } from "@/lib/motion";

export function Loop() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.35, once: true });

  const cards = [
    { n: "01", t: "Build", d: "Set the goal and the limits. No giant flowcharts.", v: <BuildViz on={on} /> },
    { n: "02", t: "Run", d: "Natural voice calls that act in your systems.", v: <RunViz /> },
    { n: "03", t: "Evaluate", d: "Every call is checked the moment it ends.", v: <EvalViz on={on} /> },
    { n: "04", t: "Improve", d: "Failures become tested fixes you approve.", v: <ImproveViz on={on} /> },
  ];

  return (
    <Section
      id="how"
      eyebrow="How it works"
      title={<>One loop. Every call makes the next one better.</>}
    >
      <div ref={ref} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.t}
            initial={{ opacity: 0, y: 20 }}
            animate={on ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: ease.out, delay: i * 0.1 }}
          >
            <Card className="flex h-full flex-col overflow-hidden">
              <div className="relative m-2 h-[162px] rounded-[10.8px] bg-bone">{c.v}</div>
              <div className="px-6 pb-6 pt-4">
                <div className="t-label text-ink-3">{c.n}</div>
                <h3 className="mt-2 text-[19.8px] font-[540] tracking-[-0.02em]">{c.t}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-2">{c.d}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function BuildViz({ on }: { on: boolean }) {
  const rows = [
    ["Goal", "Resolve, no transfer"],
    ["Never", "Refund over £50"],
    ["Hand over", "If the caller asks"],
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2.5 px-6">
      {rows.map(([k, v], i) => (
        <motion.div
          key={k}
          initial={{ opacity: 0, x: -10 }}
          animate={on ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.4 + i * 0.25, duration: 0.5, ease: ease.out }}
          className="flex items-center gap-3 rounded-[7.2px] border border-line bg-paper px-3 py-2 text-[11.7px]"
        >
          <span className="w-[4.5rem] shrink-0 text-ink-3">{k}</span>
          <span className="truncate">{v}</span>
        </motion.div>
      ))}
    </div>
  );
}

function RunViz() {
  // A conversation, as turns: the caller and the agent taking turns, looping.
  const turns = [
    { w: 42, who: "c" },
    { w: 30, who: "a" },
    { w: 18, who: "c" },
    { w: 48, who: "a" },
    { w: 24, who: "c" },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 px-6">
      <div className="flex items-center gap-2 text-[11.25px] text-ink-2">
        <span className="live-dot !h-1.5 !w-1.5" />
        Live · order line
      </div>
      {turns.map((t, i) => (
        <div key={i} className={`flex ${t.who === "a" ? "justify-end" : ""}`}>
          <motion.span
            className={`h-[8.1px] rounded-full ${t.who === "c" ? "bg-lime-deep" : "bg-ink"}`}
            initial={{ width: 0 }}
            animate={{ width: [`0%`, `${t.w}%`, `${t.w}%`, "0%"] }}
            transition={{ duration: 6, times: [0, 0.12, 0.88, 1], delay: i * 0.7, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
          />
        </div>
      ))}
    </div>
  );
}

function EvalViz({ on }: { on: boolean }) {
  const checks = [
    ["Resolved", true],
    ["Policy followed", true],
    ["Customer verified", true],
    ["Answered in time", false],
  ] as const;
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-6">
      {checks.map(([t, ok], i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0 }}
          animate={on ? { opacity: 1 } : undefined}
          transition={{ delay: 0.5 + i * 0.3, duration: 0.4 }}
          className="flex items-center justify-between rounded-[7.2px] bg-paper px-3 py-1.5 text-[11.7px]"
        >
          {t}
          <span className={`grid h-5 w-5 place-items-center rounded-full text-[9.9px] ${ok ? "bg-lime text-ink" : "bg-fault-tint text-fault"}`}>
            {ok ? "✓" : "✕"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ImproveViz({ on }: { on: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-4 px-6">
      <div className="flex items-center gap-2 text-[11.25px] text-ink-2">
        <span className="text-ink">
          <Mark spinning={false} className="h-[11.7px] w-auto" title="" />
        </span>
        v14 → v15
      </div>
      {[
        { v: "v14", p: 71.6, c: "bg-line-2" },
        { v: "v15", p: 76.6, c: "bg-lime" },
      ].map((b, i) => (
        <div key={b.v}>
          <div className="flex justify-between text-[11.25px] text-ink-3">
            <span>{b.v}</span>
            <span>{b.p}% resolved</span>
          </div>
          <div className="mt-1.5 h-[7.2px] rounded-full bg-paper">
            <motion.div
              className={`h-full rounded-full ${b.c}`}
              initial={{ width: 0 }}
              animate={on ? { width: `${b.p}%` } : undefined}
              transition={{ delay: 0.6 + i * 0.4, duration: 1, ease: ease.out }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
