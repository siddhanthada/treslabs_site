"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { tuesday } from "@/content/scenario";
import { labelSnaps, mulberry32 } from "@/lib/motion";
import { color } from "@/lib/tokens";
import { plain } from "@/components/speech/Spoken";
import { NARROW, useMediaQuery } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ─── data: 400 calls, 28 failures in 5 groups, 8 sampled by QA ───── */

type Dot = { i: number; cluster: number; qa: boolean; slot: number };

function buildDots(): Dot[] {
  const rnd = mulberry32(7);
  const n = tuesday.calls;
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const failures = idx.slice(0, tuesday.failures);
  const clean = idx.slice(tuesday.failures);
  const dots: Dot[] = Array.from({ length: n }, (_, i) => ({ i, cluster: -1, qa: false, slot: 0 }));
  let k = 0;
  tuesday.clusters.forEach((c, ci) => {
    for (let s = 0; s < c.today; s++) {
      const d = dots[failures[k++]];
      d.cluster = ci;
      d.slot = s;
    }
  });
  // QA listens to 8 calls; by chance, one of them is a failure.
  dots[failures[3]].qa = true;
  clean.slice(0, tuesday.qaSampled - tuesday.qaFound).forEach((i) => (dots[i].qa = true));
  return dots;
}

type Layout = {
  vb: [number, number];
  pitch: number;
  r: number;
  grid: (i: number) => [number, number];
  cluster: (c: number, s: number) => [number, number];
  label: (c: number) => { x: number; y: number; anchor: "start" | "end"; countX: number };
};

const wide: Layout = {
  vb: [1000, 530],
  pitch: 26,
  r: 8.4,
  grid: (i) => [13 + (i % 20) * 26, 13 + Math.floor(i / 20) * 26],
  cluster: (c, s) => [604 + s * 25, 62 + c * 102],
  label: (c) => ({ x: 596, y: 62 + c * 102 - 25, anchor: "start", countX: 996 }),
};

const narrow: Layout = {
  vb: [400, 600],
  pitch: 19,
  r: 6.4,
  grid: (i) => [11 + (i % 20) * 19.4, 11 + Math.floor(i / 20) * 19.4],
  cluster: (c, s) => [11 + s * 16, 438 + c * 36],
  label: (c) => ({ x: 206, y: 438 + c * 36 + 4, anchor: "start", countX: 396 }),
};

const steps = [
  { n: "400", text: "calls on a Tuesday. From the outside, they all look fine." },
  { n: "28", text: "went wrong. A few an hour, scattered through the day." },
  { n: "2%", text: "is what manual QA listens to. It finds 1 of the 28." },
  { n: "400", text: "evaluated by Treslabs, each as it ends. All 28 found." },
  { n: "4", text: "causes, not 28 problems — grouped by the step that broke, not by what callers said." },
];

export function EveryCall() {
  const root = useRef<HTMLElement>(null);
  const isNarrow = useMediaQuery(NARROW);
  const reduce = useReducedMotion();
  const dots = useMemo(() => buildDots(), []);
  const L = isNarrow ? narrow : wide;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const all = q(".dot");
      const fail = q(".dot[data-fail='1']");
      const qa = q(".dot[data-qa='1']");
      const qaHit = q(".dot[data-qa='1'][data-fail='1']");
      const clean = q(".dot[data-fail='0']");
      const caps = q(".cap");
      const pips = q(".pip");

      gsap.set(all, { attr: { fill: color.line2 } });
      gsap.set(caps, { autoAlpha: 0, y: 14 });
      gsap.set(caps[0], { autoAlpha: 1, y: 0 });
      gsap.set(q(".clabel"), { autoAlpha: 0 });
      gsap.set(q(".vq"), { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      const swap = (from: number, to: number, at: string) => {
        tl.to(caps[from], { autoAlpha: 0, y: -14, duration: 0.35 }, at);
        tl.to(caps[to], { autoAlpha: 1, y: 0, duration: 0.45 }, `${at}+=0.2`);
        tl.to(pips[to], { backgroundColor: color.ink, duration: 0.2 }, at);
      };

      tl.addLabel("s0").to({}, { duration: 0.4 });

      // 1 — failures become visible
      tl.addLabel("s1");
      swap(0, 1, "s1");
      tl.to(fail, { attr: { fill: color.fault }, duration: 0.5, stagger: { each: 0.012, from: "random" } }, "s1");
      tl.fromTo(q(".vq"), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.12 }, "s1+=0.35");
      tl.to({}, { duration: 0.4 });

      // 2 — QA hears 8: failures fade back to invisible, except the one QA caught
      tl.addLabel("s2");
      swap(1, 2, "s2");
      tl.to(fail, { attr: { fill: color.line2 }, duration: 0.4 }, "s2");
      tl.to(q(".vq"), { autoAlpha: 0, duration: 0.3 }, "s2");
      tl.to(qa, { attr: { fill: color.ink, r: L.r * 1.25 }, duration: 0.5, stagger: 0.04 }, "s2+=0.2");
      tl.fromTo(
        q(".qring"),
        { attr: { r: L.r }, opacity: 0.9 },
        { attr: { r: L.r * 2.8 }, opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.04 },
        "s2+=0.2",
      );
      tl.to(qaHit, { attr: { fill: color.fault }, duration: 0.3 }, "s2+=0.7");
      tl.to({}, { duration: 0.4 });

      // 3 — evaluation sweeps every call, left to right; all 28 surface
      tl.addLabel("s3");
      swap(2, 3, "s3");
      tl.to(qa, { attr: { r: L.r, fill: color.line2 }, duration: 0.3 }, "s3");
      // A single evaluation line crosses every call; each dot is judged as it passes.
      const col = (el: Element) => Number(el.getAttribute("data-i")) % 20;
      const SWEEP = 0.8;
      const [gx0] = L.grid(0);
      const [gx1] = L.grid(19);
      tl.fromTo(
        q(".scan"),
        { attr: { x1: gx0 - L.pitch, x2: gx0 - L.pitch }, opacity: 0 },
        { attr: { x1: gx1 + L.pitch, x2: gx1 + L.pitch }, opacity: 1, duration: SWEEP, ease: "none" },
        "s3+=0.1",
      );
      tl.to(q(".scan"), { opacity: 0, duration: 0.2 }, `s3+=${0.1 + SWEEP}`);
      tl.to(
        all,
        {
          attr: { fill: color.signalTint },
          duration: 0.2,
          stagger: (_: number, el: Element) => (col(el) / 19) * SWEEP,
        },
        "s3+=0.1",
      );
      tl.to(
        fail,
        {
          attr: { fill: color.fault, r: L.r * 1.15 },
          duration: 0.25,
          stagger: (_: number, el: Element) => (col(el) / 19) * SWEEP + 0.06,
        },
        "s3+=0.1",
      );
      tl.to({}, { duration: 0.4 });

      // 4 — failures leave the grid and group by cause
      tl.addLabel("s4");
      swap(3, 4, "s4");
      tl.to(clean, { attr: { fill: color.line }, duration: 0.4 }, "s4");
      // Like the mark: each group converges to a point (accelerating), then
      // releases into its row and settles exactly.
      fail.forEach((el, k) => {
        const c = Number(el.getAttribute("data-c"));
        const sl = Number(el.getAttribute("data-s"));
        const [ax, ay] = L.cluster(c, 0);
        const [x, y] = L.cluster(c, sl);
        const t0 = 0.1 + c * 0.14 + (k % 5) * 0.012;
        tl.to(
          el,
          {
            attr: { cx: ax, cy: ay, r: L.r * 0.7, fill: c === tuesday.clusters.length - 1 ? color.ink3 : color.fault },
            duration: 0.55,
            ease: "power3.in",
          },
          `s4+=${t0}`,
        );
        tl.to(el, { attr: { cx: x, cy: y, r: L.r }, duration: 0.55, ease: "back.out(1.6)" }, `s4+=${t0 + 0.55}`);
      });
      tl.to(q(".clabel"), { autoAlpha: 1, duration: 0.4, stagger: 0.14 }, "s4+=0.75");
      tl.addLabel("end").to({}, { duration: 0.3 });

      if (reduce) {
        tl.progress(1);
        return;
      }

      // Calls arrive before anything is said about them.
      gsap.from(all, {
        opacity: 0,
        duration: 0.5,
        stagger: { each: 0.0035, from: "random" },
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });

      ScrollTrigger.create({
        trigger: q(".stage")[0],
        start: "top top",
        end: () => `+=${window.innerHeight * 3.4}`,
        pin: true,
        scrub: 0.7,
        animation: tl,
        snap: {
          snapTo: labelSnaps(tl.labels, tl.duration()),
          duration: { min: 0.25, max: 0.8 },
          delay: 0.12,
          ease: "power2.inOut",
        },
        invalidateOnRefresh: true,
      });
    },
    { scope: root, dependencies: [isNarrow, reduce], revertOnUpdate: true },
  );

  return (
    <section id="every-call" ref={root} className="relative">
      <div className="stage flex h-svh items-center pt-[calc(var(--nav-h)+12px)] md:pt-[var(--nav-h)]">
        <div className="wrap grid w-full items-center gap-5 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5 lg:col-span-4">
            <span className="t-kicker mb-5 hidden text-ink-3 md:block">Every call</span>
            <h2 className="t-h2 max-w-[12ch] !text-[clamp(28px,4vw,58px)]">
              You can’t fix what you only sample.
            </h2>

            <div className="relative mt-5 h-[104px] md:mt-12 md:h-[170px]">
              {steps.map((s, i) => (
                <div key={i} className="cap absolute inset-0" aria-hidden={i !== 0 && !reduce}>
                  <div className="t-num text-[44px] leading-none md:text-[84px]">{s.n}</div>
                  <p className="mt-2 max-w-[32ch] text-[14.5px] leading-[1.45] text-ink-2 md:mt-3 md:text-[16.5px]">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} className="pip h-[3px] w-6 rounded-full" style={{ background: i === 0 ? color.ink : color.line2 }} />
              ))}
            </div>
            <ul className="sr-only">
              {steps.map((s, i) => (
                <li key={i}>
                  {s.n} {s.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 lg:col-span-8">
            <svg
              key={isNarrow ? "n" : "w"}
              viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
              className="mx-auto block h-auto max-h-[56svh] w-full md:max-h-[70svh]"
              role="img"
              aria-label="400 calls as dots. 28 failed. Manual QA sampled 8 and found 1. Treslabs evaluated all 400 and grouped the 28 failures into four causes."
            >
              {dots.map((d) => {
                const [x, y] = L.grid(d.i);
                return (
                  <circle
                    key={d.i}
                    className="dot"
                    data-fail={d.cluster >= 0 ? 1 : 0}
                    data-qa={d.qa ? 1 : 0}
                    data-c={d.cluster}
                    data-i={d.i}
                    data-s={d.slot}
                    cx={x}
                    cy={y}
                    r={L.r}
                    fill={color.line2}
                  />
                );
              })}
              {dots
                .filter((d) => d.qa)
                .map((d) => {
                  const [x, y] = L.grid(d.i);
                  return (
                    <circle key={`q${d.i}`} className="qring" cx={x} cy={y} r={L.r} fill="none" stroke={color.ink} strokeWidth={1.2} opacity={0} />
                  );
                })}
              {!isNarrow &&
                tuesday.clusters.slice(0, 4).map((c, ci) => {
                  const d = dots.find((x) => x.cluster === ci && x.slot === 1) ?? dots.find((x) => x.cluster === ci);
                  if (!d) return null;
                  const [x, y] = L.grid(d.i);
                  const text = plain(c.voice);
                  const w = text.length * 8.6 + 26;
                  const flip = x > 330;
                  return (
                    <g key={`v${ci}`} className="vq" transform={`translate(${flip ? x - 14 - w : x + 14} ${y - 17})`}>
                      <rect width={w} height={34} rx={2} fill={color.daylight} />
                      <text x={13} y={23} fontFamily="var(--font-serif)" fontSize={20} fill={color.ink}>
                        {text}
                      </text>
                    </g>
                  );
                })}
              <line
                className="scan"
                x1={0}
                x2={0}
                y1={L.grid(0)[1] - L.pitch}
                y2={L.grid(399)[1] + L.pitch}
                stroke={color.signal}
                strokeWidth={isNarrow ? 2 : 2.5}
                opacity={0}
              />
              {tuesday.clusters.map((c, ci) => {
                const lb = L.label(ci);
                const first = ci === 0;
                return (
                  <g key={c.id} className="clabel">
                    <text
                      x={lb.x}
                      y={lb.y}
                      fontFamily="var(--font-sans)"
                      fontSize={isNarrow ? 12.5 : 15}
                      fontWeight={first ? 560 : 440}
                      fill={ci === tuesday.clusters.length - 1 ? color.ink3 : color.ink}
                    >
                      {c.label}
                    </text>
                    {!isNarrow && (
                      <text
                        x={lb.countX}
                        y={lb.y}
                        textAnchor="end"
                        fontFamily="var(--font-mono)"
                        fontSize={12}
                        fill={first ? color.ink : color.ink3}
                      >
                        {c.today} today · {c.week} this week
                      </text>
                    )}
                    {!isNarrow && (
                      <text
                        x={lb.x}
                        y={lb.y + 50}
                        fontFamily="var(--font-serif)"
                        fontStyle="italic"
                        fontSize={15}
                        fill={color.ink2}
                      >
                        “{plain(c.voice)}”
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
