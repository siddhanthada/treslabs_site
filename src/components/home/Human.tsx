"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Pixel, PEOPLE } from "@/components/brand/Pixel";
import { Phone } from "@/components/brand/Phone";
import { ease } from "@/lib/motion";

const SIDES = [
  {
    who: PEOPLE.ana,
    tag: "Tuesday · v14",
    dur: "1:12",
    line: "“No — don’t worry. I’ll sort it out myself.”",
    note: "4.2 seconds of silence while the carrier timed out. The caller hung up.",
    bad: true,
  },
  {
    who: PEOPLE.lena,
    tag: "Thursday · v15",
    dur: "0:48",
    line: "“Oh — brilliant. Before six?”",
    note: "Answered from the warehouse feed in under a second. Delivered at 14:52.",
    bad: false,
  },
];

export function Human() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });

  return (
    <Section
      eyebrow="Before and after"
      title="Behind every call is someone waiting for an answer."
      sub="The same question, asked before and after one approved change."
    >
      <div ref={ref} className="grid gap-4 md:grid-cols-2">
        {SIDES.map((s, i) => (
          <motion.div
            key={s.tag}
            initial={{ opacity: 0, y: 20 }}
            animate={on ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: ease.out, delay: i * 0.15 }}
          >
            <Card className="h-full p-2">
              <div className="relative">
                <Pixel
                  src={s.who.src}
                  focus={s.who.focus}
                  cols={84}
                  animate={false}
                  className="aspect-[16/10] w-full overflow-hidden rounded-[10.8px]"
                  alt=""
                />
                <span
                  className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-[7.2px] px-2.5 py-1 text-[11.25px] ${
                    s.bad ? "bg-paper text-fault" : "bg-lime text-ink"
                  }`}
                >
                  <Phone className="h-3 w-3" />
                  {s.tag} · {s.dur}
                </span>
              </div>
              <div className="px-5 pb-5 pt-6">
                <p className="speech-caller text-[27px] leading-[1.12]">{s.line}</p>
                <p className="mt-3 text-[13.5px] leading-[1.5] text-ink-2">{s.note}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
