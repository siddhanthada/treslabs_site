"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Card, Section } from "@/components/site/Section";
import { ease } from "@/lib/motion";

const ITEMS = [
  { t: "Every call evaluated", d: "Resolution, policy and tone, scored as each call ends.", i: "check" },
  { t: "Replay before release", d: "Fixes are tested on real past calls first.", i: "replay" },
  { t: "Human approval", d: "Nothing reaches customers until someone says yes.", i: "person" },
  { t: "Guardrails & handover", d: "Hard limits, and a clean handoff to your team.", i: "shield" },
  { t: "Versions & rollback", d: "Every change is versioned. Roll back in one step.", i: "versions" },
  { t: "Natural conversation", d: "Interruptions and pauses handled like a person would.", i: "wave" },
] as const;

export function Capabilities() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.25, once: true });
  return (
    <Section eyebrow="Built for production" title="Everything you need to run voice agents you can trust.">
      <div ref={ref} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.t}
            initial={{ opacity: 0, y: 16 }}
            animate={on ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: ease.out, delay: i * 0.07 }}
          >
            <Card className="h-full p-7">
              <span className="grid h-11 w-11 place-items-center rounded-[9px] bg-lime text-ink">
                <Icon name={it.i} />
              </span>
              <h3 className="mt-6 text-[17.1px] font-[540] tracking-[-0.015em]">{it.t}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-2">{it.d}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Icon({ name }: { name: (typeof ITEMS)[number]["i"] }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      {name === "check" && <><circle cx="12" cy="12" r="8.5" {...p} /><path d="m8.5 12.2 2.4 2.4 4.6-5" {...p} /></>}
      {name === "replay" && <><path d="M4 12a8 8 0 1 0 2.4-5.7" {...p} /><path d="M4 4.5v3.8h3.8" {...p} /></>}
      {name === "person" && <><circle cx="12" cy="8.5" r="3.5" {...p} /><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" {...p} /></>}
      {name === "shield" && <><path d="M12 3.5 19 6v5.5c0 4.2-3 7.5-7 9-4-1.5-7-4.8-7-9V6z" {...p} /></>}
      {name === "versions" && <><rect x="4" y="9" width="12" height="11" rx="2" {...p} /><path d="M8 5h10a2 2 0 0 1 2 2v9" {...p} /></>}
      {name === "wave" && <><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" {...p} /></>}
    </svg>
  );
}
