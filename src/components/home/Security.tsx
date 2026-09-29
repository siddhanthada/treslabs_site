"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Draft } from "@/components/site/Draft";
import { compliance, principles } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Security by design, stated as principles we build to — not as badges we don't
  hold yet. Compliance status is shown honestly underneath.
  PROVISIONAL: every line must be confirmed by whoever owns security.
*/

const ICONS = ["globe", "redact", "key", "sign", "people", "lock"] as const;

export function Security() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.25, once: true });
  const reduce = useReducedMotion();
  return (
    <Section
      id="security"
      eyebrow="Security by design"
      title="Software that talks to your customers should be boring about security."
      sub="These are the rules Treslabs is built to — before any badge says so."
    >
      <div ref={ref}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <motion.div
              key={p.t}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={on ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: ease.out, delay: i * 0.07 }}
            >
              <Card className="h-full p-6">
                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-line bg-bone text-ink">
                    <Icon name={ICONS[i]} />
                  </span>
                  {p.draft && <Draft />}
                </div>
                <h3 className="mt-5 text-[15.3px] font-[540] tracking-[-0.01em]">{p.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-2">{p.d}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-3 flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="t-label text-ink-3">Compliance</div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {compliance.map((c) => (
              <li key={c.name} className="flex items-center gap-2.5 text-[13.5px]">
                <span className="font-[540]">{c.name}</span>
                <span className="rounded-[6px] bg-sink px-2 py-0.5 text-[12.15px] text-ink-2">{c.status}</span>
                {c.draft && <Draft />}
              </li>
            ))}
          </ul>
          <p className="text-[12.6px] text-ink-2 md:max-w-[26ch] md:text-right">Reports and our DPA are shared under NDA during evaluation.</p>
        </Card>
      </div>
    </Section>
  );
}

function Icon({ name }: { name: (typeof ICONS)[number] }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      {name === "globe" && (
        <>
          <circle cx="12" cy="12" r="8" {...p} />
          <path d="M4 12h16M12 4c2.4 2.3 3.6 5 3.6 8s-1.2 5.7-3.6 8c-2.4-2.3-3.6-5-3.6-8S9.6 6.3 12 4Z" {...p} />
        </>
      )}
      {name === "redact" && (
        <>
          <rect x="4" y="6" width="16" height="12" rx="2" {...p} />
          <path d="M7.5 10h9M7.5 14h5" {...p} strokeWidth={3} />
        </>
      )}
      {name === "key" && (
        <>
          <circle cx="8.5" cy="12" r="3.5" {...p} />
          <path d="M12 12h8M17 12v3M20 12v2" {...p} />
        </>
      )}
      {name === "sign" && (
        <>
          <path d="M5 19h14" {...p} />
          <path d="M6 15c2-4 3.5-8 5-8s0 7 1.5 7 2-3 3-3 1 2 2.5 2" {...p} />
        </>
      )}
      {name === "people" && (
        <>
          <circle cx="9" cy="9" r="3" {...p} />
          <path d="M3.5 18.5c.9-2.8 3-4.3 5.5-4.3s4.6 1.5 5.5 4.3" {...p} />
          <circle cx="17" cy="10" r="2.3" {...p} />
          <path d="M15.8 14.4c2.1.2 3.7 1.5 4.4 3.6" {...p} />
        </>
      )}
      {name === "lock" && (
        <>
          <rect x="5" y="10.5" width="14" height="9" rx="2" {...p} />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...p} />
        </>
      )}
    </svg>
  );
}
