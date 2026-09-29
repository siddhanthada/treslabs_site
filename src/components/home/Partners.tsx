"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Card } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/site/Button";
import { Eyebrow } from "@/components/brand/Frame";
import { Draft } from "@/components/site/Draft";
import { links, partnerGets, pathToLive } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Pre-launch, the honest offer is to build it together. A small cohort, what
  partners get, and the path from first recording to live — so "not launched
  yet" reads as selective, not small.
*/

const SEATS = { total: 5, taken: 2, draft: true }; // PLACEHOLDER

export function Partners() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });
  const reduce = useReducedMotion();

  return (
    <section id="partners" className="py-24 md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Design partners</Eyebrow>
          </Reveal>
          <Reveal as="h2" className="mt-5 text-[clamp(28.8px,3.6vw,48.6px)] font-[540] leading-[1.04] tracking-[-0.035em]" delay={0.05}>
            Build it with us.
          </Reveal>
          <Reveal as="p" className="mt-5 max-w-[28rem] text-[15.3px] leading-[1.5] text-ink-2" delay={0.1}>
            We’re working with a small group of enterprise teams to shape Treslabs before launch. Your calls, your edge cases, your
            say in what ships.
          </Reveal>

          <ul className="mt-9 grid gap-5">
            {partnerGets.map((g, i) => (
              <Reveal as="li" key={g.t} delay={0.12 + i * 0.06} className="flex gap-3.5">
                <span className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-lime">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
                    <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[14.4px] font-[540]">{g.t}</span>
                  <span className="mt-0.5 block text-[13.5px] leading-[1.5] text-ink-2">{g.d}</span>
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-10 flex flex-wrap items-center gap-3" delay={0.3}>
            <Button href={links.partner} variant="lime" arrow>
              Apply to be a design partner
            </Button>
            <Button href={links.sendCall} variant="line">
              Send us one call
            </Button>
          </Reveal>

          <Reveal className="mt-6 flex items-center gap-3" delay={0.35}>
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: SEATS.total }, (_, i) => (
                <span key={i} className={`h-2 w-5 rounded-full ${i < SEATS.taken ? "bg-ink" : "bg-line-2"}`} />
              ))}
            </span>
            <span className="text-[12.6px] text-ink-2">
              {SEATS.total - SEATS.taken} of {SEATS.total} places left in the first cohort
            </span>
            {SEATS.draft && <Draft />}
          </Reveal>
        </div>

        <div ref={ref} className="lg:col-span-7">
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="t-label text-ink-3">From first call to live</div>
              <Draft />
            </div>
            <ol className="relative mt-7">
              <span className="absolute bottom-6 left-[11px] top-3 w-px bg-line" aria-hidden />
              <motion.span
                className="absolute left-[11px] top-3 w-px origin-top bg-lime-deep"
                style={{ height: "calc(100% - 36px)" }}
                initial={reduce ? false : { scaleY: 0 }}
                animate={on ? { scaleY: 1 } : undefined}
                transition={{ duration: 2.4, ease: ease.inOut, delay: 0.3 }}
                aria-hidden
              />
              {pathToLive.map((s, i) => (
                <motion.li
                  key={s.t}
                  initial={reduce ? false : { opacity: 0, x: 8 }}
                  animate={on ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.5, ease: ease.out, delay: 0.35 + i * 0.42 }}
                  className="relative grid grid-cols-[24px_1fr] gap-5 pb-7 last:pb-0"
                >
                  <span
                    className={`relative z-10 mt-0.5 grid h-[23px] w-[23px] place-items-center rounded-[7px] border text-[10.35px] font-mono ${
                      i === pathToLive.length - 1 ? "border-lime-deep/40 bg-lime text-ink" : "border-line bg-paper text-ink-2"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-5">
                    <span className="t-label pt-[3px] text-ink-3">{s.when}</span>
                    <span>
                      <span className="block text-[14.4px] font-[540]">{s.t}</span>
                      <span className="mt-0.5 block text-[13.5px] leading-[1.5] text-ink-2">{s.d}</span>
                    </span>
                  </div>
                </motion.li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </section>
  );
}
