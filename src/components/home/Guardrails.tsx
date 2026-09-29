"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Section } from "@/components/site/Section";
import { Stage, VoicePill } from "@/components/site/Stage";
import { Mark } from "@/components/brand/Mark";
import { industries } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Goals and guardrails first. On one stage: the agent's definition as a quiet
  config card, and — beside it — the moment a guardrail does its job on a call.
*/

const ROTATE_MS = 8000;

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
      sub="No flowcharts. A goal, the actions it may take, and the lines it won’t cross."
      align="left"
    >
      <div ref={ref}>
        <Stage tone="lime">
          {/* industries: feature tabs with a progress line, so it's clear they're clickable and that they move on */}
          <div className="flex gap-6 overflow-x-auto border-b border-lime-deep/15 px-5 pt-5 sm:gap-9 sm:px-10 lg:px-14" role="tablist" aria-label="Industries">
            {industries.map((x, j) => {
              const on = i === j;
              return (
                <button
                  key={x.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setI(j);
                    setAuto(false);
                  }}
                  className={`relative shrink-0 pb-4 text-[15.3px] tracking-[-0.01em] transition-colors ${on ? "text-ink" : "text-ink-3 hover:text-ink"}`}
                >
                  {x.name}
                  <span className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden rounded-full">
                    {on &&
                      (auto && !reduce ? (
                        <motion.span
                          key={`${x.key}-${inView}`}
                          className="block h-full origin-left bg-ink"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: inView ? 1 : 0 }}
                          transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                        />
                      ) : (
                        <motion.span layoutId="ind-line" className="block h-full bg-ink" />
                      ))}
                  </span>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={ind.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid items-center gap-10 px-5 py-10 sm:px-10 md:py-14 lg:grid-cols-12 lg:gap-8 lg:px-14"
            >
              {/* the definition */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: ease.out }}
                className="rounded-[18px] bg-paper p-2 shadow-[0_30px_60px_-34px_rgba(40,52,10,.45)] lg:col-span-6"
              >
                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                  <span className="flex items-center gap-2.5 text-[13.5px] font-[540]">
                    <Mark centered className="h-4 w-4 text-ink" trail={false} title="" />
                    {ind.name} agent
                  </span>
                  <span className="rounded-[7px] bg-lime px-2 py-0.5 font-mono text-[10.8px] text-ink">v15 live</span>
                </div>
                <div className="grid gap-1.5">
                  <Field k="Goal">
                    <p className="text-[14.4px] leading-[1.4]">{ind.goal}</p>
                  </Field>
                  <Field k="Can use">
                    <div className="flex flex-wrap gap-1.5">
                      {ind.can.map((c) => (
                        <span key={c.system} className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-paper px-2.5 py-1 text-[12.6px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-lime-deep" />
                          {c.system}
                        </span>
                      ))}
                    </div>
                  </Field>
                  <Field k="Never">
                    <div className="flex flex-wrap gap-1.5">
                      {ind.never.map((n) => (
                        <span key={n} className="inline-flex items-center gap-1.5 rounded-[8px] bg-fault-tint/70 px-2.5 py-1 text-[12.6px] text-[#8f3a1d]">
                          <X />
                          {n}
                        </span>
                      ))}
                    </div>
                  </Field>
                  {ind.procedure ? (
                    <Field k="In order">
                      <div className="flex flex-wrap items-center gap-1 text-[12.6px] text-ink-2">
                        {ind.procedure.steps.map((s, n) => (
                          <span key={s} className="inline-flex items-center gap-1">
                            <span className="rounded-[7px] bg-paper px-2 py-0.5 ring-1 ring-line">{s}</span>
                            {n < ind.procedure!.steps.length - 1 && <span className="text-ink-3">›</span>}
                          </span>
                        ))}
                      </div>
                    </Field>
                  ) : (
                    <Field k="Hands over">
                      <p className="text-[13.05px] leading-[1.45] text-ink-2">{ind.handover}</p>
                    </Field>
                  )}
                </div>
              </motion.div>

              {/* the moment it matters */}
              <div className="relative flex flex-col items-start gap-3.5 lg:col-span-6 lg:pl-6">
                <Float delay={0.15}>
                  <VoicePill name={ind.caller} role="On the line" initial={ind.caller[0]} />
                </Float>
                <Float delay={0.45} className="self-stretch sm:ml-8">
                  <div className="rounded-[16px] rounded-tl-[6px] bg-paper px-5 py-4 shadow-[0_20px_40px_-28px_rgba(40,52,10,.5)]">
                    <p className="speech-caller text-[clamp(19px,1.8vw,24px)] leading-[1.18]">{ind.moment.caller}</p>
                  </div>
                </Float>
                <Float delay={0.95} className="sm:ml-16">
                  <div className="inline-flex items-center gap-2.5 rounded-[12px] border border-fault/25 bg-[#fbeee8] px-3.5 py-2.5 text-[13.05px] text-[#8f3a1d]">
                    <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-fault text-bone">
                      <X />
                    </span>
                    <span>
                      <span className="font-[540]">Guardrail</span> · {ind.moment.stop}
                    </span>
                  </div>
                </Float>
                <Float delay={1.45} className="self-stretch sm:ml-8">
                  <div className="flex items-start gap-3 rounded-[16px] rounded-tr-[6px] bg-ink px-5 py-4 text-bone">
                    <Mark centered className="mt-0.5 h-4 w-4 shrink-0 text-lime" trail={false} title="" />
                    <p className="text-[14.4px] leading-[1.45]">{ind.moment.then}</p>
                  </div>
                </Float>
              </div>
            </motion.div>
          </AnimatePresence>

        </Stage>
      </div>
    </Section>
  );
}

function Field({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] bg-bone px-4 py-3">
      <div className="t-label mb-1.5 text-ink-3">{k}</div>
      {children}
    </div>
  );
}

function Float({ delay, className = "", children }: { delay: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: ease.out, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function X() {
  return (
    <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0" aria-hidden>
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
