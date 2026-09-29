"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/components/site/Reveal";
import { Eyebrow } from "@/components/brand/Frame";
import { Draft } from "@/components/site/Draft";
import { faq, links } from "@/content/site";
import { ease } from "@/lib/motion";

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
          </Reveal>
          <Reveal as="h2" className="mt-5 text-[clamp(28.8px,3.6vw,48.6px)] font-[540] leading-[1.04] tracking-[-0.035em]" delay={0.05}>
            Asked, answered.
          </Reveal>
          <Reveal as="p" className="mt-5 max-w-[22rem] text-[15.3px] leading-[1.5] text-ink-2" delay={0.1}>
            Anything else, ask the people building it.{" "}
            <a href={links.sendCall} className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink">
              hello@treslabs.ai
            </a>
          </Reveal>
        </div>

        <ul className="border-t border-line lg:col-span-8">
          {faq.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-line">
                <button
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={on}
                  onClick={() => setOpen(on ? -1 : i)}
                >
                  <span className={`text-[17.1px] tracking-[-0.012em] transition-colors ${on ? "text-ink" : "text-ink-2 hover:text-ink"}`}>
                    {f.q}
                  </span>
                  <span
                    className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-[8px] transition-colors ${on ? "bg-lime" : "bg-sink"}`}
                    aria-hidden
                  >
                    <span className="absolute h-[1.5px] w-3 bg-ink" />
                    <motion.span
                      className="absolute h-3 w-[1.5px] bg-ink"
                      animate={{ scaleY: on ? 0 : 1 }}
                      transition={{ duration: 0.25, ease: ease.out }}
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[60ch] pb-6 pr-12 text-[14.4px] leading-[1.6] text-ink-2">
                        {f.a} {"draft" in f && f.draft && <Draft />}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
