"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Card } from "@/components/site/Section";
import { Pixel, PEOPLE } from "@/components/brand/Pixel";
import { Phone } from "@/components/brand/Phone";
import { ease } from "@/lib/motion";

const SIDES = [
  {
    who: PEOPLE.ana,
    zoom: 1.2,
    tag: "Tuesday · v14",
    dur: "1:12",
    line: "“No — don’t worry. I’ll sort it out myself.”",
    note: "4.2 seconds of silence while the carrier timed out. The caller hung up.",
    bad: true,
    checks: "3 of 6 checks",
  },
  {
    who: PEOPLE.nina,
    zoom: 1.9,
    tag: "Thursday · v15",
    dur: "0:48",
    line: "“Oh — brilliant. Before six?”",
    note: "Answered from the warehouse feed in under a second. Delivered at 14:52.",
    bad: false,
    checks: "6 of 6 checks",
  },
];

export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });

  return (
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
                  zoom={s.zoom}
                  build={1.6}
                  scan={false}
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
                {/* the build is the call being evaluated; the verdict lands when it resolves */}
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={on ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.4, ease: ease.out, delay: 1.9 + i * 0.15 }}
                  className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-[7.2px] px-2.5 py-1 text-[11.25px] ${
                    s.bad ? "bg-paper text-[#a8411f]" : "bg-paper text-ink"
                  }`}
                >
                  <span
                    className={`grid h-3.5 w-3.5 place-items-center rounded-[3px] ${
                      s.bad ? "bg-fault-tint text-[#a8411f]" : "bg-lime text-ink"
                    }`}
                  >
                    {s.bad ? (
                      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
                        <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
                        <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  Evaluated · {s.checks}
                </motion.span>
              </div>
              <div className="px-5 pb-5 pt-6">
                <p className="speech-caller text-[27px] leading-[1.12]">{s.line}</p>
                <p className="mt-3 text-[13.5px] leading-[1.5] text-ink-2">{s.note}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
  );
}

/** One side of the story as a compact moment: who called, what they said, and the verdict. */
export function Moment({ side }: { side: "before" | "after" }) {
  const s = SIDES[side === "before" ? 0 : 1];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: ease.out }}
      className="flex w-full max-w-[640px] gap-4 rounded-[20px] bg-paper p-3 shadow-[0_24px_48px_-34px_rgba(17,18,24,.45)] ring-1 ring-ink/5 sm:gap-5"
    >
      <Pixel
        src={s.who.src}
        focus={s.who.focus}
        cols={30}
        zoom={s.zoom}
        build={1.4}
        scan={false}
        className="aspect-square w-[108px] shrink-0 overflow-hidden rounded-[14px] bg-sink sm:w-[132px]"
        alt=""
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-[7px] px-2 py-0.5 text-[11.7px] ${s.bad ? "bg-fault-tint/70 text-[#8f3a1d]" : "bg-lime text-ink"}`}>
            <Phone className="h-3 w-3" />
            {s.tag}
          </span>
          <span className={`text-[12.15px] ${s.bad ? "text-[#a8411f]" : "text-lime-deep"}`}>{s.checks}</span>
        </div>
        <p className="speech-caller mt-2.5 text-[clamp(19px,1.9vw,25px)] leading-[1.15]">{s.line}</p>
        <p className="mt-2 text-[13.05px] leading-[1.45] text-ink-2">{s.note}</p>
      </div>
    </motion.div>
  );
}
