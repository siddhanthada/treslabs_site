"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Mark } from "@/components/brand/Mark";
import { industries, systems } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Goals and guardrails first, explicit procedures where they matter. One agent
  definition per industry, beside the moment its guardrail does its job:
  the agent does the work, and knows where to stop.
*/

const ROTATE_MS = 7000;

export function Guardrails() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const ind = industries[i];

  useEffect(() => {
    if (!inView || reduce || !auto) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % industries.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [i, inView, reduce, auto]);

  return (
    <Section
      id="guardrails"
      eyebrow="Goals and guardrails"
      title="Tell it what to achieve. And where to stop."
      sub="No giant flowcharts. Set the goal, grant the actions, draw the limits — and spell out steps only where the order matters."
    >
      <div ref={ref}>
        <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Industries">
          {industries.map((x, j) => (
            <button
              key={x.key}
              role="tab"
              aria-selected={i === j}
              onClick={() => {
                setI(j);
                setAuto(false);
              }}
              className={`relative overflow-hidden rounded-[9px] px-4 py-2 text-[12.6px] transition-colors ${
                i === j ? "bg-ink text-bone" : "bg-sink text-ink-2 hover:text-ink"
              }`}
            >
              {x.name}
              {i === j && auto && !reduce && (
                <motion.span
                  key={`${x.key}-bar`}
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-lime"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: inView ? 1 : 0 }}
                  transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={ind.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: ease.out }}
            className="mt-8 grid gap-4 lg:grid-cols-12"
          >
            {/* the agent definition */}
            <Card className="lg:col-span-7">
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <Mark centered className="h-4 w-4 text-ink" trail={false} title="" />
                  <span className="text-[13.5px] font-[540]">{ind.name} agent</span>
                  <span className="rounded-[5.4px] bg-sink px-1.5 py-0.5 font-mono text-[10.35px] text-ink-2">v15 live</span>
                </div>
                <span className="t-label hidden text-ink-3 sm:block">{ind.line}</span>
              </div>

              <dl className="divide-y divide-line">
                <Row k="Goal">
                  <p className="text-[14.4px] leading-[1.45]">{ind.goal}</p>
                </Row>
                <Row k="Can">
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {ind.can.map((c) => (
                      <li key={c.system} className="flex items-start gap-2 text-[13.05px] leading-[1.4]">
                        <Tick />
                        <span>
                          <span className="font-[540]">{c.system}</span>
                          <span className="text-ink-2"> · {c.action}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Row>
                <Row k="Never">
                  <ul className="flex flex-wrap gap-1.5">
                    {ind.never.map((n) => (
                      <li key={n} className="flex items-center gap-1.5 rounded-[7.2px] bg-fault-tint/60 px-2.5 py-1 text-[12.6px] text-[#8f3a1d]">
                        <Cross />
                        {n}
                      </li>
                    ))}
                  </ul>
                </Row>
                <Row k="Hands over">
                  <p className="text-[13.05px] leading-[1.45] text-ink-2">{ind.handover}</p>
                </Row>
                {ind.procedure && (
                  <Row k="Procedure">
                    <div className="t-label mb-2 text-ink-3">{ind.procedure.name}</div>
                    <ol className="flex flex-wrap items-center gap-1.5">
                      {ind.procedure.steps.map((s, n) => (
                        <li key={s} className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5 rounded-[7.2px] border border-line bg-bone px-2 py-1 text-[12.15px]">
                            <span className="font-mono text-[10.35px] text-ink-3">{n + 1}</span>
                            {s}
                          </span>
                          {n < ind.procedure!.steps.length - 1 && <span className="text-ink-3">→</span>}
                        </li>
                      ))}
                    </ol>
                  </Row>
                )}
              </dl>
            </Card>

            {/* the moment a guardrail does its job */}
            <Card className="flex flex-col p-6 lg:col-span-5">
              <div className="t-label text-ink-3">A guardrail at work</div>
              <div className="mt-6 flex flex-1 flex-col justify-center gap-3">
                <Step delay={0.15}>
                  <div className="rounded-[10px] bg-bone px-4 py-3 shadow-[0_8px_24px_-16px_rgba(17,18,24,.35)]">
                    <p className="speech-caller text-[18px] leading-[1.2]">{ind.moment.caller}</p>
                  </div>
                </Step>
                <Step delay={0.75}>
                  <div className="flex items-center gap-2.5 rounded-[10px] border border-fault/30 bg-fault-tint/40 px-4 py-3 text-[13.05px] text-[#8f3a1d]">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-fault text-bone">
                      <Cross />
                    </span>
                    <span>
                      <span className="font-[540]">Stopped · </span>
                      {ind.moment.stop}
                    </span>
                  </div>
                </Step>
                <Step delay={1.35}>
                  <div className="flex items-center gap-2.5 rounded-[10px] bg-ink px-4 py-3 text-[13.05px] text-bone">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-lime text-ink">
                      <Tick />
                    </span>
                    {ind.moment.then}
                  </div>
                </Step>
              </div>
              <p className="mt-6 border-t border-line pt-4 text-[12.6px] leading-[1.5] text-ink-2">
                It does the work. And it knows where to stop.
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* the systems it acts in */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="t-label text-ink-3">Acts in your systems, over APIs</div>
          <ul className="flex max-w-[860px] flex-wrap justify-center gap-2">
            {systems.map((s) => (
              <li key={s} className="rounded-[9px] border border-line bg-paper px-3.5 py-2 text-[12.6px] text-ink-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 px-6 py-4 sm:grid-cols-[110px_1fr] sm:gap-6">
      <dt className="t-label pt-0.5 text-ink-3">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Step({ delay, children }: { delay: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: ease.out, delay }}
    >
      {children}
    </motion.div>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[3px] h-3 w-3 shrink-0 text-lime-deep" aria-hidden>
      <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0" aria-hidden>
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
