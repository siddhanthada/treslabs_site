"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useStickyProgress } from "@/lib/useStickyProgress";
import { agentSpec, flowRules, type SpecKey } from "@/content/scenario";
import { useMediaQuery } from "@/lib/useMediaQuery";

const ROWS: { key: SpecKey; label: string; checked?: boolean }[] = [
  { key: "goal", label: "Goal", checked: true },
  { key: "can", label: "Can" },
  { key: "never", label: "Never", checked: true },
  { key: "handoff", label: "Hands over when", checked: true },
  { key: "knows", label: "Knows" },
  { key: "procedure", label: "Explicit procedure", checked: true },
];

const TAG: Record<SpecKey | "dropped", string> = {
  goal: "goal",
  can: "can",
  never: "never",
  handoff: "hand over",
  knows: "knows",
  procedure: "procedure",
  dropped: "replaced by the goal",
};

const NOTE: Record<number, string> = {
  5: "failed Rob on Tuesday",
  14: "hard-coded to policy v6",
};

/**
 * A scripted call flow resolves into intent. Rules are tagged by what they
 * really express, then converge into the definition — except the steps that
 * genuinely need to stay explicit.
 */
export function Goals() {
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();
  if (!wide || reduce) return <GoalsStatic />;
  return <GoalsSticky />;
}

function Head() {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <span className="t-kicker mb-6 block text-ink-3">Build</span>
        <h2 className="t-h2 max-w-[16ch]">Goals and guardrails first. Explicit steps when they matter.</h2>
      </div>
      <p className="t-lead text-ink-2 lg:col-span-5">
        Describe the outcome and the limits instead of scripting every path. The same definition
        runs the agent and grades every call.
      </p>
    </div>
  );
}

function GoalsSticky() {
  const section = useRef<HTMLElement>(null);
  const ruleRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rowRefs = useRef<Partial<Record<SpecKey, HTMLDivElement | null>>>({});
  const [deltas, setDeltas] = useState<{ x: number; y: number }[]>([]);

  const p = useStickyProgress(section);

  useLayoutEffect(() => {
    const measure = () => {
      setDeltas(
        flowRules.map((r, i) => {
          const a = ruleRefs.current[i]?.getBoundingClientRect();
          const target = r.to === "dropped" ? null : rowRefs.current[r.to]?.getBoundingClientRect();
          if (!a || !target) return { x: 0, y: 60 };
          return { x: target.left + 150 - a.left, y: target.top + target.height / 2 - (a.top + a.height / 2) };
        }),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const countText = useTransform(p, (v): string =>
    v < 0.42 ? "16 of 228 branches shown" : v < 0.72 ? "converging…" : "resolved into 6 lines",
  );
  const scriptOpacity = useTransform(p, [0.64, 0.76], [1, 0]);
  const resultOpacity = useTransform(p, [0.8, 0.9], [0, 1]);
  const resultY = useTransform(p, [0.8, 0.9], [16, 0]);

  return (
    <section ref={section} className="relative h-[260svh] border-t border-line">
      <div className="sticky top-0 flex h-svh flex-col justify-center pt-[var(--nav-h)]">
        <div className="wrap w-full">
          <Head />
          <div className="relative mt-12 grid grid-cols-12 gap-8">
            <div className="relative col-span-6">
              <div className="t-label mb-3 flex justify-between text-ink-3">
                <span>order_support.flow — scripted</span>
                <motion.span>{countText}</motion.span>
              </div>
              <motion.div
                className="pointer-events-none absolute left-0 top-10 max-w-[26rem]"
                style={{ opacity: resultOpacity, y: resultY }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="t-num text-[64px] leading-none text-ink-3 line-through decoration-[2px]">228</span>
                  <span className="t-num text-[96px] leading-none">6</span>
                </div>
                <p className="mt-4 text-[16px] leading-[1.5] text-ink-2">
                  branches became six lines of intent. One procedure stays explicit, because the
                  business needs it done in that order every time.
                </p>
              </motion.div>
              <motion.ol className="t-data text-[12px] leading-[22px]" style={{ opacity: scriptOpacity }}>
                {flowRules.map((r, i) => (
                  <li
                    key={i}
                    ref={(el) => {
                      ruleRefs.current[i] = el;
                    }}
                    className="relative"
                  >
                    <Rule i={i} rule={r.rule} to={r.to} p={p} d={deltas[i]} />
                  </li>
                ))}
              </motion.ol>
            </div>

            <div className="col-span-6">
              <div className="t-label mb-3 flex justify-between text-ink-3">
                <span>order_support — defined</span>
                <span>v15</span>
              </div>
              <div className="rounded-[14px] border border-line bg-paper">
                {ROWS.map((row, ri) => (
                  <DefRow
                    key={row.key}
                    row={row}
                    ri={ri}
                    p={p}
                    refCb={(el) => {
                      rowRefs.current[row.key] = el;
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rule({
  i,
  rule,
  to,
  p,
  d,
}: {
  i: number;
  rule: string;
  to: SpecKey | "dropped";
  p: MotionValue<number>;
  d?: { x: number; y: number };
}) {
  const n = flowRules.length;
  const tagAt = 0.1 + (i / n) * 0.26;
  const go0 = 0.44 + (i / n) * 0.12;
  const go1 = go0 + 0.16;
  const dropped = to === "dropped";
  const k = useTransform(p, [go0, go1], [0, 1], { clamp: true });
  // Accelerating convergence, like the blades closing as the mark spins up.
  const accel = useTransform(k, (v) => v * v * v);
  const x = useTransform(accel, (v) => (dropped ? 0 : (d?.x ?? 0) * v));
  const y = useTransform(accel, (v) => (dropped ? 40 * v : (d?.y ?? 0) * v));
  const scaleX = useTransform(accel, (v) => (dropped ? 1 : 1 - 0.8 * v));
  const opacity = useTransform(k, [0, 0.45, 0.9], [1, 0.55, 0]);
  const tagOpacity = useTransform(p, [tagAt, tagAt + 0.03], [0, 1]);
  const strike = useTransform(p, [tagAt + 0.02, tagAt + 0.08], [0, 1]);
  const note = NOTE[i];
  return (
    <motion.div className="flex items-baseline gap-3" style={{ x, y, scaleX, opacity, transformOrigin: "0% 50%" }}>
      <span className="w-5 shrink-0 text-right text-ink-3/60">{i + 1}</span>
      <span className={`relative truncate ${dropped || note ? "text-fault" : "text-ink-2"}`}>
        {rule}
        {dropped && (
          <motion.span className="absolute left-0 top-1/2 h-px w-full origin-left bg-fault" style={{ scaleX: strike }} />
        )}
      </span>
      <motion.span
        style={{ opacity: tagOpacity }}
        className={`ml-auto shrink-0 whitespace-nowrap rounded-[4px] px-1.5 text-[10.5px] leading-[17px] ${
          dropped || note ? "bg-fault-tint text-fault" : "bg-signal-tint text-signal"
        }`}
      >
        {note ?? TAG[to]}
      </motion.span>
    </motion.div>
  );
}

function DefRow({
  row,
  ri,
  p,
  refCb,
}: {
  row: (typeof ROWS)[number];
  ri: number;
  p: MotionValue<number>;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const a = 0.52 + ri * 0.035;
  const opacity = useTransform(p, [a, a + 0.08], [0.12, 1]);
  const y = useTransform(p, [a, a + 0.08], [6, 0]);
  const checkOpacity = useTransform(p, [0.86, 0.94], [0, 1]);
  return (
    <div ref={refCb} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line px-6 py-3.5 last:border-0">
      <span className="t-label pt-[3px] text-ink-3">{row.label}</span>
      <motion.div style={{ opacity, y }}>
        <DefContent k={row.key} />
        {row.checked && (
          <motion.span style={{ opacity: checkOpacity }} className="t-label mt-1.5 block text-signal">
            evaluated on every call
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

function DefContent({ k }: { k: SpecKey }) {
  const s = agentSpec;
  if (k === "goal") return <p className="text-[18px] leading-snug tracking-[-0.015em]">{s.goal}</p>;
  if (k === "procedure")
    return (
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[14.5px]">{s.procedure.name}:</span>
          {s.procedure.steps.map((st, i) => (
            <span key={st} className="flex items-center gap-1.5">
              <span className="t-data rounded-[4px] border border-line-2 px-1.5 text-[12px]">{st}</span>
              {i < s.procedure.steps.length - 1 && <span className="text-ink-3">→</span>}
            </span>
          ))}
        </div>
        <p className="t-label mt-1.5 text-ink-3">{s.procedure.why}</p>
      </div>
    );
  const list = k === "can" ? s.can : k === "never" ? s.never : k === "handoff" ? s.handoff : s.knows;
  return <p className="text-[14.5px] leading-[1.5]">{list.join(" · ")}</p>;
}

/* phones, tablets and reduced motion: the result, with the script folded above it */
function GoalsStatic() {
  return (
    <section className="section-y border-t border-line">
      <div className="wrap">
        <Head />
        <details className="mt-10 rounded-[10px] border border-line bg-paper px-4 py-3">
          <summary className="t-label cursor-pointer text-ink-3">The same agent, scripted · 16 of 228 branches</summary>
          <ol className="t-data mt-3 space-y-1.5 text-[11.5px] text-ink-2">
            {flowRules.map((r, i) => (
              <li key={i} className={r.to === "dropped" || NOTE[i] ? "text-fault" : ""}>
                {r.rule}
                {(NOTE[i] || r.to === "dropped") && <span className="ml-2 opacity-70">— {NOTE[i] ?? TAG.dropped}</span>}
              </li>
            ))}
          </ol>
        </details>
        <div className="mt-6 rounded-[14px] border border-line bg-paper">
          {ROWS.map((row) => (
            <div key={row.key} className="border-b border-line px-5 py-4 last:border-0">
              <span className="t-label text-ink-3">{row.label}</span>
              <div className="mt-1.5">
                <DefContent k={row.key} />
              </div>
              {row.checked && <span className="t-label mt-1.5 block text-signal">evaluated on every call</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
