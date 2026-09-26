"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { mulberry32, ease } from "@/lib/motion";

const TABS = [
  { k: "Calls", n: "540", line: "calls on a Tuesday. From the outside, they all look fine." },
  { k: "Failures", n: "36", line: "went wrong — a few an hour, easy to miss." },
  { k: "Manual QA", n: "2%", line: "is what a QA team listens to. It finds 1 of the 36." },
  { k: "Treslabs", n: "100%", line: "evaluated as each call ends. All 36 found and grouped by cause." },
];

export function Sampling() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);

  const { fail, qa } = useMemo(() => {
    const r = mulberry32(7);
    const idx = Array.from({ length: 540 }, (_, i) => i).sort(() => r() - 0.5);
    const fail = new Set(idx.slice(0, 36));
    const qa = new Set([idx[3], ...idx.slice(36, 46)]);
    return { fail, qa };
  }, []);

  useEffect(() => {
    if (!inView || reduce || !auto) return;
    const id = window.setTimeout(() => setTab((t) => (t + 1) % TABS.length), 3200);
    return () => window.clearTimeout(id);
  }, [tab, inView, reduce, auto]);

  const fill = (i: number) => {
    const f = fail.has(i);
    if (tab === 0) return "var(--color-sink)";
    if (tab === 1) return f ? "var(--color-fault)" : "var(--color-sink)";
    if (tab === 2) return qa.has(i) ? (f ? "var(--color-fault)" : "var(--color-ink)") : "var(--color-sink)";
    return f ? "var(--color-fault)" : "var(--color-lime)";
  };

  return (
    <Section
      id="every-call"
      eyebrow="The problem"
      title="Most voice agents stop improving the day they go live."
      sub="Teams listen to a handful of calls and hope they’re representative. They rarely are."
    >
      <div ref={ref}>
        <Card className="grid items-center gap-10 p-6 md:p-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid gap-[3.6px]" style={{ gridTemplateColumns: "repeat(27, minmax(0, 1fr))" }} aria-hidden>
            {Array.from({ length: 540 }, (_, i) => (
              <span
                key={i}
                className="aspect-square rounded-full transition-[background-color,transform] duration-500"
                style={{
                  backgroundColor: fill(i),
                  transitionDelay: tab === 3 ? `${(i % 27) * 14}ms` : "0ms",
                  transform: tab === 2 && qa.has(i) ? "scale(1.25)" : "scale(1)",
                }}
              />
            ))}
          </div>

          <div>
            <div className="flex flex-wrap gap-2" role="tablist">
              {TABS.map((t, i) => (
                <button
                  key={t.k}
                  role="tab"
                  aria-selected={tab === i}
                  onClick={() => {
                    setTab(i);
                    setAuto(false);
                  }}
                  className={`rounded-[9px] px-4 py-2 text-[12.6px] transition-colors ${
                    tab === i ? (i === 3 ? "bg-lime text-ink" : "bg-ink text-bone") : "bg-sink text-ink-2 hover:text-ink"
                  }`}
                >
                  {t.k}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: ease.out }}
                className="mt-10"
              >
                <div className={`text-[clamp(64.8px,7.2vw,108px)] font-[520] leading-none tracking-[-0.05em] `}>
                  {TABS[tab].n}
                </div>
                <p className="mt-4 max-w-[26rem] text-[16.2px] leading-[1.45] text-ink-2">{TABS[tab].line}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-10 flex flex-wrap gap-5 text-[11.7px] text-ink-3">
              <Legend c="var(--color-fault)" t="Failed call" />
              <Legend c="var(--color-ink)" t="Heard by QA" />
              <Legend c="var(--color-lime)" t="Evaluated by Treslabs" />
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
      {t}
    </span>
  );
}
