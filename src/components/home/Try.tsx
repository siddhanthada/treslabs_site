"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/site/Reveal";
import { Stage } from "@/components/site/Stage";
import { Eyebrow } from "@/components/brand/Frame";
import { Mark } from "@/components/brand/Mark";
import { Draft } from "@/components/site/Draft";
import { tryIt } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  The best proof before launch is the thing itself: call the agent our harness
  tests every build on, and try to break it. Left: the line. Right: a call in
  progress, with the moves worth trying floating around it.
*/

const SPOTS = [
  "lg:left-[3%] lg:top-[6%]",
  "lg:right-[3%] lg:top-[11%]",
  "lg:left-[3%] lg:bottom-[11%]",
  "lg:right-[3%] lg:bottom-[6%]",
];

export function Try() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [sec, setSec] = useState(0);
  const line = tryIt.lines[i];

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setSec((s) => (s + 1) % 600), 1000);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  return (
    <section id="try" className="py-24 md:py-32">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
        {/* the line */}
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Try it</Eyebrow>
          </Reveal>
          <Reveal as="h2" className="mt-5 max-w-[12ch] text-[clamp(30px,3.9vw,52px)] font-[540] leading-[1.02] tracking-[-0.038em]" delay={0.05}>
            Don’t take our word for it. Call it.
          </Reveal>
          <Reveal as="p" className="mt-5 max-w-[26rem] text-[15.3px] leading-[1.5] text-ink-2" delay={0.1}>
            A test agent on our harness answers a fictional line. Try to break it.
          </Reveal>

          <Reveal delay={0.15} className="mt-9">
            <div className="inline-flex rounded-[12px] border border-line bg-paper p-1" role="tablist" aria-label="Test lines">
              {tryIt.lines.map((l, j) => (
                <button
                  key={l.key}
                  role="tab"
                  aria-selected={i === j}
                  onClick={() => {
                    setI(j);
                    setNote(null);
                  }}
                  className={`relative rounded-[9px] px-3.5 py-1.5 text-[12.6px] transition-colors ${i === j ? "text-ink" : "text-ink-3 hover:text-ink"}`}
                >
                  {i === j && (
                    <motion.span layoutId="line-pill" className="absolute inset-0 rounded-[9px] bg-sink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                  )}
                  <span className="relative">{l.name}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={line.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: ease.out }}
                className="mt-7"
              >
                <div className="t-label text-ink-3">{line.company}</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[clamp(30px,3.2vw,42px)] font-[500] tabular-nums leading-none tracking-[-0.03em]">{line.number}</span>
                  <Draft />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a href={`tel:${line.tel}`} className="btn btn-lime">
                <Phone />
                Call the test line
              </a>
              <button
                className="btn btn-line"
                onClick={() => {
                  navigator.clipboard?.writeText(line.number);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-6">
              {!open ? (
                <button onClick={() => setOpen(true)} className="text-[13.05px] text-ink-2 underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">
                  Or have it call you
                </button>
              ) : (
                <form
                  className="flex max-w-[400px] gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!tryIt.callMe) {
                      setNote("Call-backs open at launch — for now, ring the number above.");
                      return;
                    }
                    const phone = new FormData(e.currentTarget).get("phone");
                    const res = await fetch(tryIt.callMe, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ line: line.key, phone }),
                    }).catch(() => null);
                    setNote(res?.ok ? "Calling you now — pick up in a few seconds." : "Couldn’t place the call. Try the number above.");
                  }}
                >
                  <label htmlFor="phone" className="sr-only">
                    Your phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoFocus
                    autoComplete="tel"
                    placeholder="Your number"
                    className="h-[41.4px] min-w-0 flex-1 rounded-[10px] border border-[#8a8c84] bg-paper px-3.5 text-[13.5px] outline-none placeholder:text-ink-3 focus:border-ink"
                  />
                  <button type="submit" className="btn btn-ink">
                    Call me
                  </button>
                </form>
              )}
              {note && <p className="mt-2.5 text-[12.6px] text-lime-deep">{note}</p>}
            </div>
          </Reveal>
        </div>

        {/* a call in progress */}
        <div ref={ref} className="lg:col-span-7">
          <Stage tone="lime" className="lg:min-h-[600px]">
            <div className="relative flex flex-col items-center gap-6 px-5 py-10 sm:px-8 lg:min-h-[600px] lg:justify-center lg:py-0">
              {/* the call */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: ease.out }}
                className="relative z-10 w-full max-w-[262px] rounded-[26px] bg-paper p-6 text-center shadow-[0_40px_80px_-40px_rgba(40,52,10,.55)] ring-1 ring-ink/5"
              >
                <div className="flex items-center justify-between text-[11.7px] text-ink-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-deep" />
                    Live
                  </span>
                  <span className="font-mono tabular-nums">
                    {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className="relative mx-auto mt-6 grid h-[88px] w-[88px] place-items-center">
                  {!reduce &&
                    [0, 1].map((r) => (
                      <motion.span
                        key={r}
                        className="absolute inset-0 rounded-full border border-lime-deep/30"
                        animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: r * 1.2 }}
                      />
                    ))}
                  <span className="grid h-[88px] w-[88px] place-items-center rounded-full bg-ink">
                    <Mark centered spinning={false} className="h-9 w-9 text-lime" trail={false} title="" />
                  </span>
                </div>
                <div className="mt-5 text-[15.3px] font-[540]">Treslabs test agent</div>
                <div className="mt-0.5 text-[12.6px] text-ink-3">{line.name} · listening</div>
                <div className="mx-auto mt-5 flex h-7 items-center justify-center gap-[3px]" aria-hidden>
                  {Array.from({ length: 26 }, (_, n) => (
                    <span
                      key={n}
                      className={`w-[2.5px] rounded-full bg-[#9bbd28] ${reduce ? "" : "animate-[voice_1.2s_ease-in-out_infinite]"}`}
                      style={{ height: `${25 + ((n * 37) % 70)}%`, animationDelay: `${(n % 7) * 0.08}s` }}
                    />
                  ))}
                </div>
                <div className="mt-5 border-t border-line pt-4 text-[11.7px] text-ink-3">Scored on 6 checks when you hang up</div>
              </motion.div>

              {/* the moves worth trying */}
              <AnimatePresence mode="wait">
                <motion.ul key={line.key} className="grid w-full gap-3 sm:grid-cols-2 lg:contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {line.challenges.map((c, n) => {
                    const stop = "stop" in c && c.stop;
                    return (
                      <motion.li
                        key={c.say}
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: ease.out, delay: 0.2 + n * 0.12 }}
                        className={`lg:absolute lg:w-[196px] ${SPOTS[n]}`}
                      >
                        <motion.div
                          animate={reduce ? undefined : { y: [0, n % 2 ? 5 : -5, 0] }}
                          transition={{ duration: 6 + n, repeat: Infinity, ease: "easeInOut" }}
                          className="rounded-[16px] bg-paper/95 p-4 shadow-[0_22px_44px_-30px_rgba(40,52,10,.55)] ring-1 ring-ink/5 backdrop-blur"
                        >
                          <div className="t-label text-ink-3">Try saying</div>
                          <p className="speech-caller mt-1.5 text-[16.2px] leading-[1.2]">{c.say.startsWith("(") ? c.say.slice(1, -1) : `“${c.say}”`}</p>
                          <div className={`mt-3 inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-[11.7px] ${stop ? "bg-fault-tint/70 text-[#8f3a1d]" : "bg-lime/60 text-ink"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${stop ? "bg-fault" : "bg-lime-deep"}`} />
                            {c.does}
                          </div>
                        </motion.div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>
            </div>
          </Stage>
        </div>
      </div>
    </section>
  );
}

function Phone() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M5.2 2.2 3.4 2.6c-.6.1-1 .7-.9 1.3.7 4.8 4.5 8.6 9.3 9.4.6.1 1.2-.3 1.3-.9l.4-1.8c.1-.5-.2-1-.7-1.2l-2-.8c-.4-.2-.9 0-1.2.3l-.7.9C7.6 9 6.3 7.7 5.4 6.2l.9-.7c.3-.3.5-.8.3-1.2l-.8-2c-.2-.5-.7-.8-1.2-.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
