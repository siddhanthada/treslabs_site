"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Draft } from "@/components/site/Draft";
import { harness } from "@/content/site";
import { ease } from "@/lib/motion";

/*
  Pre-launch proof. We don't have customers to quote yet; we do have a harness
  that places real calls against every build. Show its log — and the loop
  working on ourselves: pass rate up, latency down, regressions to zero.
  PLACEHOLDER numbers until the real log is wired in (see content/site.ts).
*/

export function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });
  const reduce = useReducedMotion();
  const runs = harness.runs;
  const first = runs[0];
  const last = runs[runs.length - 1];

  const stats = [
    { k: "Checks passed", v: `${last.pass}%`, d: `+${(last.pass - first.pass).toFixed(1)} pts since ${first.week}` },
    { k: "Median response", v: `${last.p50} ms`, d: `−${first.p50 - last.p50} ms since ${first.week}` },
    { k: "Regressions", v: `${last.regressions}`, d: `on ${last.calls.toLocaleString("en-GB")} replayed calls` },
  ];

  // pass-rate chart
  const W = 520;
  const H = 150;
  const lo = 75;
  const hi = 100;
  const x = (i: number) => 20 + (i * (W - 40)) / (runs.length - 1);
  const y = (p: number) => H - 18 - ((p - lo) / (hi - lo)) * (H - 36);
  const line = runs.map((r, i) => `${i ? "L" : "M"}${x(i)} ${y(r.pass)}`).join(" ");
  const area = `${line} L${x(runs.length - 1)} ${H - 18} L${x(0)} ${H - 18} Z`;

  return (
    <Section
      id="harness"
      eyebrow="From the harness"
      title="Not launched. Not untested."
      sub="Every build is put through real phone calls — the hard scenarios included — before anyone else hears it. This is the log."
    >
      <div ref={ref}>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="live-dot !h-1.5 !w-1.5" />
              <span className="text-[13.5px] font-[540]">Test harness · weekly runs</span>
              {harness.draft && <Draft />}
            </div>
            <span className="t-label text-ink-3">
              latest build <span className="text-ink">{last.build}</span> · {last.scenarios} scenarios
            </span>
          </div>

          <div className="grid lg:grid-cols-12">
            {/* headline numbers */}
            <div className="grid min-w-0 grid-cols-1 gap-px border-b border-line bg-line sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1 lg:border-b-0 lg:border-r">
              {stats.map((s, i) => (
                <motion.div
                  key={s.k}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={on ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.6, ease: ease.out, delay: 0.1 + i * 0.1 }}
                  className="bg-paper px-6 py-5"
                >
                  <div className="t-label text-ink-3">{s.k}</div>
                  <div className="mt-2 text-[clamp(26px,3vw,40px)] font-[500] leading-none tracking-[-0.035em]">{s.v}</div>
                  <div className="mt-2 text-[12.15px] text-lime-deep">{s.d}</div>
                </motion.div>
              ))}
            </div>

            {/* the trend + the log */}
            <div className="min-w-0 p-6 lg:col-span-7">
              <div className="flex items-baseline justify-between">
                <span className="text-[13.05px] text-ink-2">Checks passed, week by week</span>
                <span className="t-label text-ink-3">
                  {first.week} → {last.week}
                </span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" aria-label="Checks passed rising each week">
                {[80, 90, 100].map((g) => (
                  <g key={g}>
                    <line x1={20} x2={W - 20} y1={y(g)} y2={y(g)} stroke="#e3e3dd" strokeDasharray="3 5" />
                    <text x={W - 16} y={y(g) + 3} className="fill-[#8a8c96] font-mono text-[10px]">
                      {g}%
                    </text>
                  </g>
                ))}
                <motion.path
                  d={area}
                  fill="rgba(215,243,106,.35)"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={on ? { opacity: 1 } : undefined}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="#56720a"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={on ? { pathLength: 1 } : undefined}
                  transition={{ duration: 1.4, ease: ease.out, delay: 0.2 }}
                />
                {runs.map((r, i) => (
                  <motion.circle
                    key={r.build}
                    cx={x(i)}
                    cy={y(r.pass)}
                    r={3.5}
                    fill="#fff"
                    stroke="#56720a"
                    strokeWidth={1.6}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={on ? { opacity: 1 } : undefined}
                    transition={{ delay: 0.3 + i * 0.18 }}
                  />
                ))}
              </svg>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[460px] text-left font-mono text-[11.7px] tabular-nums">
                  <thead className="text-ink-3">
                    <tr className="border-b border-line">
                      <th className="py-2 font-normal">Build</th>
                      <th className="py-2 font-normal">Week</th>
                      <th className="py-2 text-right font-normal">Calls</th>
                      <th className="py-2 text-right font-normal">Passed</th>
                      <th className="py-2 text-right font-normal">Median</th>
                      <th className="py-2 text-right font-normal">Regr.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...runs].reverse().slice(0, 4).map((r, i) => (
                      <tr key={r.build} className={`border-b border-line/70 ${i === 0 ? "text-ink" : "text-ink-2"}`}>
                        <td className="py-2">{r.build}</td>
                        <td className="py-2">{r.week}</td>
                        <td className="py-2 text-right">{r.calls.toLocaleString("en-GB")}</td>
                        <td className="py-2 text-right">{r.pass}%</td>
                        <td className="py-2 text-right">{r.p50} ms</td>
                        <td className={`py-2 text-right ${r.regressions ? "text-[#a8411f]" : "text-lime-deep"}`}>{r.regressions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
        <p className="mt-5 text-center text-[13.05px] text-ink-2">
          The same loop we sell, run on ourselves: every failure becomes a scenario, every scenario runs on every build.{" "}
          <a href="#hear" className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-ink">
            Listen to test calls ↑
          </a>
        </p>
      </div>
    </Section>
  );
}
