"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Card } from "@/components/site/Section";
import { Eyebrow } from "@/components/brand/Frame";
import { Reveal } from "@/components/site/Reveal";
import { ease } from "@/lib/motion";

const EVENTS = [
  { at: "00:03", sys: "Customer record", t: "Caller verified", tone: "ok" },
  { at: "00:13", sys: "Orders", t: "Order #44812 found", tone: "ok" },
  { at: "00:17", sys: "Carrier", t: "No answer in 1.2s", tone: "slow" },
  { at: "00:18", sys: "Warehouse feed", t: "Out for delivery today", tone: "ok" },
  { at: "00:30", sys: "SMS", t: "Alert set — two stops away", tone: "ok" },
] as const;

export function Actions() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const shown = reduce ? EVENTS.length + 1 : n;

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    let id = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i <= EVENTS.length) id = window.setTimeout(tick, 650);
    };
    id = window.setTimeout(tick, 300);
    return () => window.clearTimeout(id);
  }, [inView, reduce]);

  return (
    <section id="actions" className="py-24 md:py-32">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Actions</Eyebrow>
          </Reveal>
          <Reveal as="h2" className="mt-5 text-[clamp(32px,4vw,54px)] font-[540] leading-[1.04] tracking-[-0.035em]" delay={0.05}>
            It does the work. And knows when to hand over.
          </Reveal>
          <Reveal as="p" className="mt-5 max-w-[28rem] text-[17px] leading-[1.5] text-ink-2" delay={0.1}>
            Mid-call, the agent works in your CRM, orders, bookings and payments — inside limits
            you set.
          </Reveal>
        </div>

        <div ref={ref} className="lg:col-span-7">
          <Card className="p-3">
            <ol>
              {EVENTS.map((e, i) => {
                const on = i < shown;
                return (
                  <motion.li
                    key={e.at}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.25 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0"
                  >
                    <span className="t-label w-12 text-ink-3">{e.at}</span>
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        on ? (e.tone === "slow" ? "bg-fault" : "bg-lime-deep") : "bg-line-2"
                      }`}
                    />
                    <span className="w-40 shrink-0 text-[15px] font-[520]">{e.sys}</span>
                    <span className={`text-[15px] ${e.tone === "slow" ? "text-fault" : "text-ink-2"}`}>{e.t}</span>
                  </motion.li>
                );
              })}
            </ol>
            <motion.div
              initial={false}
              animate={{ opacity: shown > EVENTS.length ? 1 : 0, y: shown > EVENTS.length ? 0 : 8 }}
              transition={{ duration: 0.6, ease: ease.out }}
              className="m-2 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-ink px-5 py-4 text-bone"
            >
              <span className="text-[15px]">
                A refund over the £50 limit? <span className="text-bone/60">It goes to a person — with the full story.</span>
              </span>
              <span className="rounded-[8px] bg-lime px-3 py-1 text-[13px] text-ink">Handed to Sam · Returns</span>
            </motion.div>
          </Card>
        </div>
      </div>
    </section>
  );
}
