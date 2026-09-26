"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { change, versions } from "@/content/scenario";
import { ease, fmtInt, spring } from "@/lib/motion";
import { SectionHead } from "@/components/site/SectionHead";

/**
 * The change record: reasons, evidence and a named decision in one object.
 * Rows arrive in the order the evidence was produced; approval lands last.
 */
export function Review() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });
  const reduce = useReducedMotion();
  const on = inView || !!reduce;

  const row = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    animate: on ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.7, ease: ease.out, delay: 0.15 + i * 0.14 },
  });

  const ev = change.replay;
  const evidence: [string, string, boolean?][] = [
    ["Replayed", `${fmtInt(ev.total)} calls`],
    ["The 73 failures", `${ev.cluster.before} → ${ev.cluster.after} resolved`, true],
    ["Regression set", `${ev.regression.regressions} of ${fmtInt(ev.regression.size)} regressed`],
    ["Guardrails", `${ev.guardrails.hit} of ${ev.guardrails.checked} triggered`],
    ["Added latency", ev.latency],
    [ev.projection.metric, `${ev.projection.before}% → ${ev.projection.after}%`, true],
  ];

  return (
    <section id="review" className="section-y border-t border-line bg-paper">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <SectionHead
            kicker="Review"
            title="Improvement you can audit, not magic."
            lead="Every change arrives with its reasons, its evidence and its author. Nothing reaches a customer until someone with permission says yes."
          />
          <ul className="mt-10 hidden border-t border-line lg:block">
            <li className="t-label pb-3 pt-4 text-ink-3">Version history · order support</li>
            {versions.map((v, i) => (
              <motion.li
                key={v.v}
                layout
                initial={reduce ? false : { opacity: 0 }}
                animate={on ? { opacity: i === 0 ? 1 : 0.8 } : undefined}
                transition={{ duration: 0.6, delay: i === 0 ? 1.35 : 0.2 + i * 0.05 }}
                className="grid grid-cols-[2.6rem_1fr] gap-3 border-b border-line py-3"
              >
                <span className={`t-data ${i === 0 ? "text-signal" : "text-ink-3"}`}>{v.v}</span>
                <span>
                  <span className="block text-[14.5px] leading-snug">{v.what}</span>
                  <span className="t-label mt-1 block text-ink-3">
                    {v.when} · {v.who} · {v.effect}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="lg:col-span-8">
          <article className="overflow-hidden rounded-[14px] border border-line bg-bone">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 md:px-8 md:py-6">
              <div>
                <div className="t-label text-ink-3">
                  Change {change.id} · {change.cluster}
                </div>
                <h3 className="mt-2 text-[21px] leading-tight tracking-[-0.02em] md:text-[26px]">
                  {change.title}
                </h3>
              </div>
              <motion.span
                initial={reduce ? false : { opacity: 0, scale: 1.25 }}
                animate={on ? { opacity: 1, scale: 1 } : undefined}
                transition={{ ...spring.settle, delay: 1.2 }}
                className="t-data rounded-[5px] bg-ink px-2.5 py-1 text-[12px] text-bone"
              >
                Approved
              </motion.span>
            </header>

            <div className="grid md:grid-cols-[11rem_1fr]">
              {/* why */}
              <RowLabel {...row(0)}>Why</RowLabel>
              <motion.div {...row(0)} className="border-b border-line px-5 pb-5 md:px-8 md:py-5">
                <p className="text-[15.5px] leading-[1.5]">
                  {change.why.calls} calls in {change.why.days} days stalled at the carrier lookup.{" "}
                  {change.why.hungUp} hung up, {change.why.transferred} were transferred,{" "}
                  {change.why.resolved} got an answer.
                </p>
                <p className="t-data mt-2 text-[12px] text-ink-3">{change.why.cause}</p>
              </motion.div>

              {/* what */}
              <RowLabel {...row(1)}>What changes</RowLabel>
              <motion.div {...row(1)} className="border-b border-line px-5 pb-5 md:px-8 md:py-5">
                <div className="t-data text-[12px] text-ink-3">{change.diff.path}</div>
                <div className="t-data mt-2 space-y-1 text-[12.5px] md:text-[13px]">
                  {change.diff.removed.map((l) => (
                    <div key={l} className="flex gap-3 rounded-[3px] bg-fault-tint/60 px-2 py-1 text-fault">
                      <span>−</span>
                      {l}
                    </div>
                  ))}
                  {change.diff.added.map((l) => (
                    <div key={l} className="flex gap-3 rounded-[3px] bg-signal-tint/70 px-2 py-1 text-signal">
                      <span>+</span>
                      {l}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* evidence */}
              <RowLabel {...row(2)}>Evidence</RowLabel>
              <motion.dl
                {...row(2)}
                className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-3"
              >
                {evidence.map(([k, v, strong]) => (
                  <div key={k} className="bg-bone px-5 py-4 md:px-6">
                    <dt className="t-label text-ink-3">{k}</dt>
                    <dd className={`mt-1.5 text-[15px] leading-tight tracking-[-0.01em] ${strong ? "font-[560]" : ""}`}>
                      {v}
                    </dd>
                  </div>
                ))}
              </motion.dl>

              {/* decision */}
              <RowLabel {...row(3)}>Decision</RowLabel>
              <motion.div {...row(3)} className="border-b border-line px-5 pb-5 md:px-8 md:py-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[11.5px] font-[600] text-bone">
                    PR
                  </span>
                  <div className="text-[15px] leading-tight">
                    {change.review.reviewer}
                    <span className="t-label ml-2 text-ink-3">
                      {change.review.role} · {change.review.approvedAt}
                    </span>
                  </div>
                </div>
                <p className="speech-caller mt-3 text-[19px] text-ink-2">“{change.review.note}”</p>
                <p className="t-label mt-2 text-ink-3">Proposed by {change.review.proposedBy}</p>
              </motion.div>

              {/* rollout */}
              <RowLabel {...row(4)}>Rollout</RowLabel>
              <motion.div {...row(4)} className="px-5 pb-6 md:px-8 md:py-5">
                <div className="flex items-center gap-2">
                  {change.rollout.map((r, i) => (
                    <div key={r.pct} className="flex-1">
                      <div className="h-[6px] overflow-hidden rounded-full bg-line">
                        <motion.div
                          className="h-full origin-left rounded-full bg-signal"
                          initial={reduce ? false : { scaleX: 0 }}
                          animate={on ? { scaleX: 1 } : undefined}
                          transition={{ duration: 0.9, ease: ease.brake, delay: 1.5 + i * 0.35 }}
                        />
                      </div>
                      <div className="t-label mt-2 text-ink-2">
                        {r.pct}%{r.hold && <span className="text-ink-3"> · {r.hold}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="t-label mt-3 text-ink-3">
                  {change.from} kept warm · roll back in one step
                </p>
              </motion.div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function RowLabel({
  children,
  ...motionProps
}: { children: React.ReactNode } & Record<string, unknown>) {
  return (
    <motion.div
      {...motionProps}
      className="t-label px-5 pb-2 pt-5 text-ink-3 md:border-b md:border-line md:px-8 md:py-5"
    >
      {children}
    </motion.div>
  );
}
