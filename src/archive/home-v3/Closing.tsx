"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Mark } from "@/components/brand/Mark";
import { Button } from "@/components/site/Button";
import { contact } from "@/content/scenario";
import { BladeField, useArrival } from "@/components/brand/BladeField";

/** What a visitor gets back — the same record the page has been filling. */
const RETURNS = [
  { k: "Every turn", v: "who spoke, when, and who talked over whom" },
  { k: "What was meant", v: "intent, context, the customer’s state" },
  { k: "What was done", v: "each system the agent touched, and what came back" },
  { k: "What went wrong", v: "the step it broke at, and how often that happens" },
  { k: "What we’d change", v: "a proposed fix, replayed against your call" },
];

/**
 * The culmination: an empty record, waiting for your call. The mark rests
 * open; reaching for the call-to-action sets it working.
 */
export function Closing() {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const p = useArrival(ref);
  const reduce = useReducedMotion();
  const on = () => setBusy(true);
  const off = () => setBusy(false);

  return (
    <section ref={ref} id="contact" className="relative overflow-hidden bg-daylight">
      <BladeField
        p={p}
        spread={1.75}
        turn={55}
        className="pointer-events-none absolute left-[62%] top-1/2 h-[170%] w-[120%] -translate-x-1/2 -translate-y-1/2 text-[#ecd09c]"
      />
      <div className="wrap relative grid gap-14 py-[calc(var(--section-y)*1.15)] lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <h2 className="t-display max-w-[8ch]">Send us one call.</h2>
          <p className="t-lead mt-8 max-w-[30rem] text-umber">
            One recording from your current setup is enough. It comes back the way every call on
            this page did.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={contact.sendCall} variant="ink" arrow onMouseEnter={on} onMouseLeave={off} onFocus={on} onBlur={off}>
              Send a recording
            </Button>
            <Button href={contact.demo} variant="line" className="!border-umber/30">
              Book a demo
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-[14px] border border-umber/15 bg-paper shadow-[0_30px_80px_-40px_rgba(107,74,31,.45)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 md:px-7">
              <span className="flex items-center gap-3">
                <span className="text-ink">
                  <Mark spinning={busy} maxSpeed={12} className="h-[26px] w-auto" title="Waiting for your call" />
                </span>
                <span className="t-label text-ink-3">{busy ? "ready when you are" : "call record · waiting"}</span>
              </span>
              <span className="t-label text-ink-3">your call</span>
            </div>
            <dl>
              {RETURNS.map((r, i) => (
                <motion.div
                  key={r.k}
                  className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line px-5 py-4 last:border-0 md:grid-cols-[10rem_1fr] md:px-7"
                  animate={busy && !reduce ? { backgroundColor: ["rgba(220,220,250,0)", "rgba(220,220,250,0.55)", "rgba(220,220,250,0)"] } : {}}
                  transition={{ duration: 1.1, delay: i * 0.12 }}
                >
                  <dt className="text-[15px] font-[520] tracking-[-0.01em]">{r.k}</dt>
                  <dd className="text-[14.5px] leading-[1.45] text-ink-3">{r.v}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
