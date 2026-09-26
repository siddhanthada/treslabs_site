"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { ease } from "@/lib/motion";

/*
  PROVISIONAL — every certification and control below must be confirmed by
  whoever owns security/compliance before publishing. In development builds a
  visible "draft" marker is shown; flip `verified` once confirmed.
*/
const SEALS = [
  { top: "AICPA", big: "SOC 2", sub: "TYPE II", status: "Audit in progress", verified: false },
  { top: "EU · UK", big: "GDPR", sub: "READY", status: "DPA available", verified: false },
  { top: "ISO/IEC", big: "27001", sub: "ISMS", status: "Planned", verified: false },
];

const CONTROLS = [
  { t: "Data residency", d: "Recordings and transcripts stay in the region you choose — EU, UK or US." },
  { t: "Redaction by default", d: "Card numbers and personal details are removed before anything is stored." },
  { t: "Full audit trail", d: "Every change, approval and rollback is attributed and kept." },
  { t: "Role-based approvals", d: "Decide who can propose, approve and ship changes to an agent." },
];

const DRAFT = process.env.NODE_ENV !== "production";

export function Security() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });
  return (
    <Section
      id="security"
      eyebrow="Security"
      title="Software that talks to your customers should be boring about security."
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-12">
        <Card className="flex flex-col justify-center gap-8 p-6 md:p-8 lg:col-span-6">
          <div className="grid grid-cols-3 gap-2">
          {SEALS.map((s, i) => (
            <motion.div
              key={s.big}
              initial={{ opacity: 0, y: 12, rotate: -6 }}
              animate={on ? { opacity: 1, y: 0, rotate: 0 } : undefined}
              transition={{ type: "spring", stiffness: 165, damping: 17.5, delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              <Seal {...s} />
              <div className="mt-4 text-[14px] font-[520]">{s.status}</div>
              {DRAFT && !s.verified && (
                <div className="mt-1 rounded-[6px] bg-fault-tint px-1.5 text-[10.5px] text-fault">draft · verify</div>
              )}
            </motion.div>
          ))}
          </div>
          <p className="border-t border-line pt-5 text-center text-[14.5px] leading-[1.5] text-ink-2">
            Reports and our data processing agreement are available under NDA during evaluation.
          </p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
          {CONTROLS.map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 14 }}
              animate={on ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: ease.out, delay: 0.2 + i * 0.08 }}
            >
              <Card className="h-full p-6">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-lime">
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                    <path d="M8 1.8 13 3.6v4c0 3-2.1 5.4-5 6.6C5.1 13 3 10.6 3 7.6v-4Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-5 text-[17px] font-[540] tracking-[-0.01em]">{c.t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.5] text-ink-2">{c.d}</p>
                {DRAFT && <div className="mt-2 inline-flex rounded-[6px] bg-fault-tint px-1.5 text-[10.5px] text-fault">draft · verify</div>}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* A certificate seal: circular text ring, the mark of the standard in the middle. */
function Seal({ top, big, sub }: { top: string; big: string; sub: string }) {
  const id = `ring-${big}`;
  return (
    <svg viewBox="0 0 140 140" className="h-[124px] w-[124px]" aria-label={`${big} ${sub}`}>
      <circle cx="70" cy="70" r="66" fill="#fff" stroke="#111218" strokeWidth="1.2" />
      <circle cx="70" cy="70" r="54" fill="#d7f36a" />
      <circle cx="70" cy="70" r="54" fill="none" stroke="#111218" strokeWidth="1" strokeDasharray="2 3" />
      <defs>
        <path id={id} d="M70 70 m-60 0 a60 60 0 1 1 120 0 a60 60 0 1 1 -120 0" />
      </defs>
      <text fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="2.4" fill="#111218">
        <textPath href={`#${id}`} startOffset="2%">
          {`${top} · ${big} · ${sub} · ${top} · ${big} · ${sub} ·`}
        </textPath>
      </text>
      <text x="70" y="72" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize="22" letterSpacing="-0.5" fill="#111218">
        {big}
      </text>
      <text x="70" y="88" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="1.5" fill="#111218">
        {sub}
      </text>
    </svg>
  );
}
