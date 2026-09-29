"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/site/Button";
import { Stage } from "@/components/site/Stage";
import { Eyebrow } from "@/components/brand/Frame";
import { Mark } from "@/components/brand/Mark";
import { Draft } from "@/components/site/Draft";
import { links, pathToLive } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Pre-launch, the honest offer is to build it together: a small cohort, and a
  short climb from first recording to live. The staircase carries the story.
*/

const SEATS = { total: 5, taken: 2 }; // PLACEHOLDER

const GETS = ["Your calls, evaluated first", "Weekly time with the builders", "Launch terms, held after launch"];

export function Partners() {
  const reduce = useReducedMotion();
  return (
    <section id="partners" className="py-24 md:py-32">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Early access</Eyebrow>
          </Reveal>
          <Reveal as="h2" className="mt-5 text-[clamp(34px,4.4vw,60px)] font-[540] leading-[0.98] tracking-[-0.042em]" delay={0.05}>
            Build it with us.
          </Reveal>
          <Reveal as="p" className="mt-5 max-w-[24rem] text-[15.3px] leading-[1.5] text-ink-2" delay={0.1}>
            A few early customers pilot Treslabs before launch — and shape what ships.
          </Reveal>
          <ul className="mt-8 grid gap-2.5">
            {GETS.map((g, i) => (
              <Reveal as="li" key={g} delay={0.14 + i * 0.05} className="flex items-center gap-3 text-[14.4px]">
                <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-lime">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
                    <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {g}
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-10 flex flex-wrap gap-3" delay={0.3}>
            <Button href={links.partner} variant="lime" arrow>
              Apply for early access
            </Button>
            <Button href={links.sendCall} variant="line">
              Send us one call
            </Button>
          </Reveal>
          <Reveal className="mt-6 flex items-center gap-3" delay={0.35}>
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: SEATS.total }, (_, i) => (
                <span key={i} className={`h-1.5 w-6 rounded-full ${i < SEATS.taken ? "bg-ink" : "bg-line-2"}`} />
              ))}
            </span>
            <span className="text-[12.6px] text-ink-2">
              {SEATS.total - SEATS.taken} of {SEATS.total} places left
            </span>
            <Draft />
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Stage tone="sand">
            <div className="px-5 py-10 sm:px-10 md:py-12">
              <div className="flex items-center justify-between">
                <span className="t-label text-ink-3">First call to live</span>
                <Draft />
              </div>
              {/* the climb */}
              <ol className="relative mt-8 grid gap-3 md:block md:h-[400px]">
                {pathToLive.map((s, i) => {
                  const last = i === pathToLive.length - 1;
                  return (
                    <motion.li
                      key={s.t}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.55, ease: ease.out, delay: 0.1 + i * 0.14 }}
                      className="md:absolute md:w-[44%]"
                      style={{ left: `${i * 14}%`, bottom: `${i * 19}%` }}
                    >
                      <div
                        className={`flex items-center gap-3.5 rounded-[16px] p-4 ${
                          last ? "bg-ink text-bone shadow-[0_24px_48px_-26px_rgba(17,18,24,.6)]" : "bg-paper shadow-[0_18px_36px_-28px_rgba(17,18,24,.45)]"
                        }`}
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] ${last ? "bg-lime text-ink" : "bg-bone font-mono text-[12px] text-ink-2"}`}>
                          {last ? <Mark centered className="h-4 w-4" trail={false} title="" /> : i + 1}
                        </span>
                        <span className="leading-tight">
                          <span className={`block font-mono text-[10.8px] ${last ? "text-on-carbon-3" : "text-ink-3"}`}>{s.when}</span>
                          <span className="mt-0.5 block text-[14.4px] font-[540]">{s.t}</span>
                        </span>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </Stage>
        </div>
      </div>

    </section>
  );
}
