"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Draft } from "@/components/site/Draft";
import { tryIt } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Pre-launch, the best proof is the thing itself. Call the agent our harness
  tests every build on, and try to break it: each line comes with the moves
  worth trying and what the agent will do — including where it stops. When
  you hang up, the call is evaluated like every test call.
*/

export function Try() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const line = tryIt.lines[i];

  return (
    <Section
      id="try"
      eyebrow="Try it"
      title="Don’t take our word for it. Call it."
      sub="The test agent below runs on the same harness we put every build through. Try to break it — each call is evaluated the moment you hang up."
    >
      <div ref={ref}>
        <Card className="grid overflow-hidden lg:grid-cols-12">
          {/* the line */}
          <div className="flex flex-col bg-ink p-7 text-bone md:p-9 lg:col-span-5">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Test lines">
              {tryIt.lines.map((l, j) => (
                <button
                  key={l.key}
                  role="tab"
                  aria-selected={i === j}
                  onClick={() => {
                    setI(j);
                    setNote(null);
                  }}
                  className={`rounded-[9px] px-3.5 py-1.5 text-[12.6px] transition-colors ${
                    i === j ? "bg-bone text-ink" : "bg-carbon-2 text-on-carbon-2 hover:text-bone"
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-2.5 text-[12.6px] text-on-carbon-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime/60" />
                <span className="relative h-2 w-2 rounded-full bg-lime" />
              </span>
              Test agent online · {line.company}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={line.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: ease.out }}
                className="mt-3 flex items-center gap-3"
              >
                <span className="text-[clamp(28px,3.2vw,42px)] font-[500] tabular-nums leading-none tracking-[-0.03em]">{line.number}</span>
                <Draft />
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <a href={`tel:${line.tel}`} className="btn btn-lime">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M5.2 2.2 3.4 2.6c-.6.1-1 .7-.9 1.3.7 4.8 4.5 8.6 9.3 9.4.6.1 1.2-.3 1.3-.9l.4-1.8c.1-.5-.2-1-.7-1.2l-2-.8c-.4-.2-.9 0-1.2.3l-.7.9C7.6 9 6.3 7.7 5.4 6.2l.9-.7c.3-.3.5-.8.3-1.2l-.8-2c-.2-.5-.7-.8-1.2-.7Z"
                    fill="currentColor"
                  />
                </svg>
                Call the test line
              </a>
              <button
                className="btn btn-ghost-dark"
                onClick={() => {
                  navigator.clipboard?.writeText(line.number);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied" : "Copy number"}
              </button>
            </div>

            <form
              className="mt-9 border-t border-carbon-line pt-7"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!tryIt.callMe) {
                  setNote("Call-backs open at launch. For now, ring the number above.");
                  return;
                }
                const phone = new FormData(e.currentTarget).get("phone");
                const res = await fetch(tryIt.callMe, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ line: line.key, phone }) }).catch(() => null);
                setNote(res?.ok ? "Calling you now — pick up in a few seconds." : "Couldn’t place the call. Try the number above.");
              }}
            >
              <label htmlFor="phone" className="text-[13.05px] text-on-carbon-2">
                Or have it call you
              </label>
              <div className="mt-2.5 flex gap-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+44 7700 900123"
                  className="h-[41.4px] min-w-0 flex-1 rounded-[10px] border border-carbon-line bg-carbon-2 px-3.5 text-[13.5px] text-bone outline-none placeholder:text-on-carbon-3 focus:border-on-carbon-3"
                />
                <button type="submit" className="btn btn-bone">
                  Call me
                </button>
              </div>
              <AnimatePresence>
                {note && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 text-[12.6px] text-lime"
                  >
                    {note}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            <p className="mt-auto pt-9 text-[11.7px] leading-[1.5] text-on-carbon-3">
              Fictional company. Calls are recorded and evaluated — please don’t share real personal details.
            </p>
          </div>

          {/* what to try */}
          <div className="flex flex-col p-7 md:p-9 lg:col-span-7">
            <div className="t-label text-ink-3">Try to break it</div>
            <AnimatePresence mode="wait">
              <motion.ul
                key={line.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-5 grid gap-3 sm:grid-cols-2"
              >
                {line.challenges.map((c, n) => (
                  <motion.li
                    key={c.say}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: ease.out, delay: 0.05 + n * 0.07 }}
                    className="flex flex-col rounded-[12.6px] border border-line bg-bone p-5"
                  >
                    <span className="font-mono text-[10.35px] text-ink-3">0{n + 1}</span>
                    <p className="speech-caller mt-2 text-[19.8px] leading-[1.2]">{c.say.startsWith("(") ? c.say : `“${c.say}”`}</p>
                    <div className="mt-auto flex items-start gap-2 pt-5 text-[12.6px] leading-[1.45] text-ink-2">
                      <span
                        className={`mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-[4px] ${
                          "stop" in c && c.stop ? "bg-fault-tint text-[#a8411f]" : "bg-lime text-ink"
                        }`}
                      >
                        {"stop" in c && c.stop ? (
                          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
                            <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
                            <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {c.does}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>

            <div className="mt-7 rounded-[12.6px] border border-line p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-[540]">When you hang up</span>
                <span className="t-label text-ink-3">evaluated like every test call</span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {tryIt.checks.map((c, n) => (
                  <motion.li
                    key={c}
                    initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                    animate={on ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ duration: 0.35, ease: ease.out, delay: 0.4 + n * 0.12 }}
                    className="flex items-center gap-2 rounded-[8px] bg-sink px-2.5 py-1.5 text-[12.6px]"
                  >
                    <span className="grid h-3.5 w-3.5 place-items-center rounded-[3.6px] bg-lime ring-1 ring-lime-deep/40">
                      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
                        <path d="M3.5 8.4 6.6 11.4 12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {c}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
