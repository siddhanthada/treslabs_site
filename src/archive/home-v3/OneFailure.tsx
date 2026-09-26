"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useInView, useReducedMotion } from "motion/react";
import { useCallClock } from "@/components/speech/useCallClock";
import { SpokenWords, turnProgress } from "@/components/speech/Spoken";
import { Mark } from "@/components/brand/Mark";
import { callRob, change, robSilence } from "@/content/scenario";
import { fmtInt, labelSnaps, mulberry32 } from "@/lib/motion";
import { color } from "@/lib/tokens";
import { NARROW, useMediaQuery } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ─── 73 calls that broke at the same step ──────────────────────────── */

type Seg = { t0: number; t1: number; who: "caller" | "agent" };
type Row = {
  pre: Seg[];
  gap: [number, number];
  postA: Seg[];
  postB: Seg[];
  fixGap: number;
  fixed: boolean;
};

const ALIGN_AT = 17; // seconds: where the failing step lines up

function buildRows(count: number): Row[] {
  const rnd = mulberry32(31);
  const r = (a: number, b: number) => a + rnd() * (b - a);
  const rows: Row[] = [];

  // Rob's call is the first row, built from the real transcript.
  rows.push({
    pre: callRob.turns
      .filter((u) => u.t1 <= robSilence.t0)
      .map((u) => ({ t0: u.t0, t1: u.t1, who: u.who })),
    gap: [robSilence.t0, robSilence.t1],
    postA: callRob.turns
      .filter((u) => u.t0 >= robSilence.t1)
      .map((u) => ({ t0: u.t0, t1: u.t1, who: u.who })),
    postB: [
      { t0: 18.5, t1: 25.8, who: "agent" },
      { t0: 26.1, t1: 27.6, who: "caller" },
      { t0: 27.9, t1: 32.2, who: "agent" },
      { t0: 32.5, t1: 33.8, who: "caller" },
    ],
    fixGap: 0.3,
    fixed: true,
  });

  // 61 of 73 resolve on replay; spread the 12 that don't through the set.
  const unfixed = new Set([5, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71]);
  for (let i = 1; i < count; i++) {
    const gs = r(12.5, 23);
    const pre: Seg[] = [];
    let t = 0.4;
    let who: Seg["who"] = "agent";
    while (t < gs - 2.2) {
      const d = who === "agent" ? r(1.8, 4.2) : r(1.1, 4.6);
      const t1 = Math.min(t + d, gs - 1.9);
      pre.push({ t0: t, t1, who });
      t = t1 + r(0.25, 0.5);
      who = who === "agent" ? "caller" : "agent";
    }
    pre.push({ t0: gs - 1.7, t1: gs, who: "agent" }); // "let me check…"
    const gl = r(3.1, 5.4);
    const g1 = gs + gl;
    const a1 = g1 + r(4.8, 7.4);
    const postA: Seg[] = [{ t0: g1, t1: a1, who: "agent" }];
    if (rnd() > 0.3) postA.push({ t0: a1 + 0.35, t1: a1 + r(1.4, 4), who: "caller" });

    const fixed = !unfixed.has(i);
    const fg = r(0.3, 0.9);
    const postB: Seg[] = [];
    let u = gs + fg;
    let w: Seg["who"] = "agent";
    const n = fixed ? 3 + Math.floor(rnd() * 3) : 2;
    for (let k = 0; k < n; k++) {
      const d = w === "agent" ? r(3, 7) : r(1, 2.8);
      postB.push({ t0: u, t1: u + d, who: w });
      u += d + r(0.25, 0.45);
      w = w === "agent" ? "caller" : "agent";
    }
    rows.push({ pre, gap: [gs, g1], postA, postB, fixGap: fg, fixed });
  }
  return rows;
}

/* ─── geometry ──────────────────────────────────────────────────────── */

type Geo = {
  vb: [number, number];
  shown: number;
  x0: number;
  k: number;
  y: (r: number) => number;
  h: number;
  focusRow: number;
};

const geoWide: Geo = {
  vb: [800, 470],
  shown: 25,
  x0: 24,
  k: 15.2,
  y: (r) => 34 + r * 16.6,
  h: 6,
  focusRow: 12,
};
const geoNarrow: Geo = {
  vb: [400, 500],
  shown: 16,
  x0: 10,
  k: 7.9,
  y: (r) => 40 + r * 28,
  h: 6,
  focusRow: 8,
};

const stepsCopy = [
  {
    tag: "Fail",
    title: "A call fails.",
    body: "Rob asks where his rug is. The carrier’s API takes 4.2 seconds. The agent waits in silence, apologises, and loses him.",
  },
  {
    tag: "Pattern",
    title: "It isn’t the only one.",
    body: "73 calls in seven days end the same way. Different customers, different words.",
  },
  {
    tag: "Cause",
    title: "The cause is a step, not a sentence.",
    body: "Lined up by the moment they broke, the pattern is plain: slow carrier lookups, and nothing to fall back on.",
  },
  {
    tag: "Change",
    title: "A change is proposed.",
    body: "Treslabs drafts a fix from the evidence: after 1.2 seconds, answer from the warehouse feed instead of waiting.",
  },
  {
    tag: "Replay",
    title: "It’s replayed before anyone ships it.",
    body: "Against the 73 failures and a 1,200-call regression set drawn from real traffic.",
  },
  {
    tag: "Review",
    title: "A person decides.",
    body: "Priya in CX Operations reads the evidence and approves. v15 rolls out gradually. v14 stays ready.",
  },
];

/**
 * The human moment the story starts from: sit through the silence, then
 * hear the customer leave. No interface, just the call.
 */
function RobMoment() {
  const ref = useRef<HTMLDivElement>(null);
  const started = useInView(ref, { amount: 0.6, once: true });
  const reduce = useReducedMotion();
  const { t } = useCallClock({ duration: 8.4, playing: started && !reduce, speed: 1 });
  const now = reduce ? 8.4 : t;
  const silence = Math.min(4.2, Math.max(0, now - 0.3));
  const last = callRob.turns[callRob.turns.length - 1];
  const words = { ...last, t0: 4.9, t1: 8.2 };
  return (
    <div ref={ref} className="mt-16">
      <div className="t-label flex items-center gap-4 text-on-carbon-3">
        <span>0:18</span>
        <span className="relative h-[8px] w-[min(46vw,560px)] overflow-hidden rounded-[1px] bg-carbon-2">
          <span className="hatch-fault absolute inset-y-0 left-0" style={{ width: `${(silence / 4.2) * 100}%` }} />
        </span>
        <span className={silence > 0 ? "text-fault-lit" : ""}>{silence.toFixed(1)}s of silence</span>
      </div>
      <p className="speech-caller mt-10 max-w-[18ch] text-[clamp(48px,6vw,96px)] leading-[1.02] text-daylight">
        <SpokenWords text={last.text} progress={turnProgress(words, now)} voice="caller" />
      </p>
      <p
        className="t-label mt-8 text-on-carbon-3 transition-opacity duration-700"
        style={{ opacity: now >= 8.2 ? 1 : 0 }}
      >
        Rob Mensah · call {fmtInt(callRob.id)} · {callRob.when} · hung up at 0:35
      </p>
    </div>
  );
}

/** Hand-off from the 400 calls: one of Tuesday's eleven carrier timeouts. */
function OneOfEleven() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(ref);
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 80%", once: true } });
      tl.from(q(".d"), { scale: 0, duration: 0.4, stagger: 0.04, ease: "back.out(2)", transformOrigin: "50% 50%" })
        .to(q(".d:not(.one)"), { opacity: 0.25, attr: { x: "+=140" }, duration: 0.8, ease: "power3.inOut" }, "+=0.2")
        .to(q(".one"), { attr: { width: 150 }, duration: 0.8, ease: "power3.inOut" }, "<")
        .from(q(".lbl"), { opacity: 0, x: -8, duration: 0.5 }, "-=0.2");
    },
    { scope: ref, dependencies: [reduce] },
  );
  return (
    <div ref={ref} className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
      <svg viewBox="0 0 330 14" className="h-[14px] w-[330px] max-w-full" aria-hidden>
        {Array.from({ length: 11 }, (_, i) => (
          <rect
            key={i}
            className={`d ${i === 0 ? "one" : ""}`}
            x={reduce ? (i === 0 ? 0 : 150 + i * 16) : i * 16}
            y={1}
            width={reduce && i === 0 ? 150 : 12}
            height={12}
            rx={6}
            fill={color.faultLit}
          />
        ))}
      </svg>
      <span className="lbl t-label text-on-carbon-3">
        Carrier lookup timeout · one of Tuesday’s eleven · call {fmtInt(callRob.id)}
      </span>
    </div>
  );
}

export function OneFailure() {
  const root = useRef<HTMLElement>(null);
  const isNarrow = useMediaQuery(NARROW);
  const reduce = useReducedMotion();
  const G = isNarrow ? geoNarrow : geoWide;
  const rows = useMemo(() => buildRows(change.why.calls), []);
  const shownRows = useMemo(() => {
    // Rob's call sits in the middle of the visible stack.
    const others = rows.slice(1, G.shown);
    const arr = [...others];
    arr.splice(G.focusRow, 0, rows[0]);
    return arr;
  }, [rows, G]);
  const [replaying, setReplaying] = useState(false);

  const X = (t: number) => G.x0 + t * G.k;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const caps = q(".fcap");
      const tags = q(".ftag");
      const focus = q(".row[data-focus='1']")[0];
      const others = q(".row[data-focus='0']");
      const inners = q(".row-inner");
      const gaps = q(".gap");
      const postB = q(".postB");
      const counter = q(".replay-count")[0];

      gsap.set(caps, { autoAlpha: 0, y: 16 });
      gsap.set(caps[0], { autoAlpha: 1, y: 0 });
      gsap.set(others, { autoAlpha: 0 });
      gsap.set(postB, { autoAlpha: 0 });
      gsap.set(q(".ov"), { autoAlpha: 0 });
      gsap.set(q(".ov-transcript"), { autoAlpha: 1 });
      const focusY = G.y(G.focusRow);
      const centerY = G.vb[1] * (isNarrow ? 0.78 : 0.7);
      gsap.set(focus, {
        y: centerY - focusY,
        scaleY: isNarrow ? 3.2 : 4,
        transformOrigin: "0% 50%",
      });

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      const go = (i: number, at: string) => {
        tl.to(caps[i - 1], { autoAlpha: 0, y: -16, duration: 0.35 }, at);
        tl.to(caps[i], { autoAlpha: 1, y: 0, duration: 0.45 }, `${at}+=0.2`);
        tl.to(tags[i - 1], { color: color.onCarbon3, duration: 0.2 }, at);
        tl.to(tags[i], { color: color.onCarbon, duration: 0.2 }, at);
      };

      tl.addLabel("fail").to({}, { duration: 0.6 });

      // 2 — pattern: Rob's call becomes one row among many
      tl.addLabel("pattern");
      go(1, "pattern");
      tl.to(q(".ov-transcript"), { autoAlpha: 0, duration: 0.3 }, "pattern");
      tl.to(focus, { y: 0, scaleY: 1, duration: 0.8, ease: "power3.inOut" }, "pattern");
      tl.to(
        others,
        { autoAlpha: 1, duration: 0.5, stagger: { each: 0.025, from: G.focusRow } },
        "pattern+=0.35",
      );
      tl.to(q(".ov-more"), { autoAlpha: 1, duration: 0.3 }, "pattern+=0.8");
      tl.to({}, { duration: 0.5 });

      // 3 — cause: rows slide so the failing step lines up
      tl.addLabel("cause");
      go(2, "cause");
      inners.forEach((el) => {
        const g0 = Number(el.getAttribute("data-g0"));
        tl.to(el, { x: (ALIGN_AT - g0) * G.k, duration: 0.9, ease: "power3.inOut" }, "cause");
      });
      tl.to(q(".ov-band"), { autoAlpha: 1, duration: 0.4 }, "cause+=0.7");
      tl.to({}, { duration: 0.5 });

      // 4 — change proposed
      tl.addLabel("change");
      go(3, "change");
      tl.to(q(".row"), { opacity: 0.28, duration: 0.4 }, "change");
      tl.to(q(".ov-band"), { autoAlpha: 0.35, duration: 0.4 }, "change");
      tl.fromTo(
        q(".ov-diff"),
        { autoAlpha: 0, scale: 0.94, x: isNarrow ? 0 : -60, transformOrigin: "0% 50%" },
        { autoAlpha: 1, scale: 1, x: 0, duration: 0.7, ease: "back.out(1.3)" },
        "change+=0.15",
      );
      tl.to({}, { duration: 0.5 });

      // 5 — replay
      tl.addLabel("replay");
      go(4, "replay");
      tl.to(q(".ov-diff"), { autoAlpha: 0, y: -12, duration: 0.35 }, "replay");
      tl.to(q(".ov-band"), { autoAlpha: 0, duration: 0.3 }, "replay");
      tl.to(q(".row"), { opacity: 1, duration: 0.3 }, "replay");
      tl.to(q(".ov-replay"), { autoAlpha: 1, duration: 0.3 }, "replay+=0.1");
      const cnt = { v: 0 };
      tl.to(
        cnt,
        {
          v: change.replay.total,
          duration: 1.3,
          ease: "none",
          onUpdate: () => {
            if (counter) counter.textContent = fmtInt(Math.round(cnt.v));
          },
        },
        "replay+=0.2",
      );
      const rowsAll = q(".row");
      const y0 = G.y(0) - 10;
      const y1 = G.y(G.shown - 1) + 10;
      tl.fromTo(
        q(".rscan"),
        { attr: { y1: y0, y2: y0 }, opacity: 0 },
        { attr: { y1: y1, y2: y1 }, opacity: 1, duration: 0.04 * rowsAll.length, ease: "none" },
        "replay+=0.25",
      );
      tl.to(q(".rscan"), { opacity: 0, duration: 0.2 }, `replay+=${0.25 + 0.04 * rowsAll.length}`);
      rowsAll.forEach((row, i) => {
        const at = `replay+=${0.25 + i * 0.04}`;
        const gap = row.querySelector(".gap");
        const fixW = Number(row.getAttribute("data-fixw"));
        const ok = row.getAttribute("data-fixed") === "1";
        if (gap) tl.to(gap, { attr: { width: fixW }, fill: ok ? color.signalLit : color.faultLit, duration: 0.35 }, at);
        tl.to(row.querySelector(".postA"), { autoAlpha: 0, duration: 0.25 }, at);
        tl.to(row.querySelector(".postB"), { autoAlpha: 1, duration: 0.35 }, `${at}+=0.1`);
      });
      tl.addLabel("results", "replay+=1.55");
      tl.fromTo(q(".ov-results"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, "results");
      tl.to(gaps, { fill: color.onCarbon3, duration: 0.5 }, "results+=0.2");
      tl.to({}, { duration: 0.5 });

      // 6 — review
      tl.addLabel("review");
      go(5, "review");
      tl.to(q(".row"), { opacity: 0.35, duration: 0.4 }, "review");
      if (isNarrow) tl.to(q(".ov-results"), { autoAlpha: 0, duration: 0.3 }, "review");
      tl.fromTo(q(".ov-review"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "review+=0.1");
      tl.fromTo(q(".ver-from"), { yPercent: 0 }, { yPercent: -100, duration: 0.5, ease: "back.out(1.6)" }, "review+=0.6");
      tl.fromTo(q(".ver-to"), { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "back.out(1.6)" }, "review+=0.6");
      tl.to({}, { duration: 0.6 });

      if (reduce) {
        tl.progress(1);
        return;
      }

      const start = tl.labels.replay / tl.duration();
      const stop = tl.labels.results / tl.duration();
      ScrollTrigger.create({
        trigger: q(".fstage")[0],
        start: "top top",
        end: () => `+=${window.innerHeight * 5.2}`,
        pin: true,
        scrub: 0.8,
        animation: tl,
        snap: {
          snapTo: labelSnaps(tl.labels, tl.duration()),
          duration: { min: 0.3, max: 0.9 },
          delay: 0.12,
          ease: "power2.inOut",
        },
        onUpdate: (self) => {
          const p = self.progress;
          const on = p > start && p < stop + 0.01;
          setReplaying((prev) => (prev === on ? prev : on));
        },
        invalidateOnRefresh: true,
      });
    },
    { scope: root, dependencies: [isNarrow, reduce], revertOnUpdate: true },
  );

  const bandX = X(ALIGN_AT) - 3;
  const bandW = 5.6 * G.k;

  return (
    <section id="improve" ref={root} data-nav="dark" className="relative bg-carbon text-on-carbon">
      <div className="wrap pb-10 pt-[var(--section-y)] md:pb-16">
        <OneOfEleven />
        <RobMoment />
        <div className="mt-24 grid gap-6 border-t border-carbon-line pt-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <span className="t-kicker mb-6 block text-on-carbon-3">Improvement</span>
            <h2 className="t-h2 max-w-[14ch]">Today’s calls are tomorrow’s tests.</h2>
          </div>
          <p className="t-lead text-on-carbon-2 lg:col-span-5">
            Follow Rob’s call from a Tuesday afternoon to a reviewed change in production.
          </p>
        </div>
      </div>

      <div className="fstage relative flex h-svh flex-col pt-[var(--nav-h)]">
        <div className="wrap grid h-full w-full grid-rows-[auto_1fr] gap-4 pb-6 md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-10 md:pb-0">
          {/* captions */}
          <div className="md:col-span-4">
            <ol className="mb-5 flex gap-4 md:mb-10 md:flex-col md:gap-2.5" aria-hidden>
              {stepsCopy.map((s, i) => (
                <li
                  key={s.tag}
                  className="ftag t-label flex items-center gap-3"
                  style={{ color: i === 0 ? color.onCarbon : color.onCarbon3 }}
                >
                  <span className="hidden md:inline">0{i + 1}</span>
                  <span className="hidden md:inline">{s.tag}</span>
                  <span className="md:hidden">{i + 1}</span>
                </li>
              ))}
            </ol>
            <div className="relative h-[150px] md:h-[220px]">
              {stepsCopy.map((s) => (
                <div key={s.tag} className="fcap absolute inset-0">
                  <h3 className="t-h3">{s.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-[15px] leading-[1.5] text-on-carbon-2 md:mt-4 md:text-[16.5px]">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            <ol className="sr-only">
              {stepsCopy.map((s) => (
                <li key={s.tag}>
                  {s.title} {s.body}
                </li>
              ))}
            </ol>
          </div>

          {/* canvas */}
          <div className="relative min-h-0 md:col-span-8">
            <div className="relative w-full" style={{ aspectRatio: `${G.vb[0]} / ${G.vb[1]}` }}>
              <svg
                key={isNarrow ? "n" : "w"}
                viewBox={`0 0 ${G.vb[0]} ${G.vb[1]}`}
                className="absolute inset-0 h-full w-full overflow-hidden"
                aria-hidden
              >
                <defs>
                  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="2.2" height="5" fill={color.faultLit} />
                  </pattern>
                </defs>
                <g className="ov ov-band">
                  <rect
                    x={bandX}
                    y={G.y(0) - 14}
                    width={bandW}
                    height={G.y(G.shown - 1) - G.y(0) + 28}
                    fill={color.faultLit}
                    opacity={0.1}
                    rx={3}
                  />
                </g>
                <line
                  className="rscan"
                  x1={0}
                  x2={G.vb[0]}
                  y1={0}
                  y2={0}
                  stroke={color.signalLit}
                  strokeWidth={1.5}
                  opacity={0}
                />
                {shownRows.map((row, ri) => {
                  const isFocus = row === rows[0];
                  const y = G.y(ri);
                  const seg = (s: Seg, k: number) => (
                    <rect
                      key={k}
                      x={X(s.t0)}
                      y={y - G.h / 2}
                      width={Math.max(1, (s.t1 - s.t0) * G.k - 1)}
                      height={G.h}
                      rx={1.5}
                      fill={s.who === "caller" ? color.onCarbon2 : color.onCarbon3}
                    />
                  );
                  return (
                    <g
                      key={ri}
                      className="row"
                      data-focus={isFocus ? 1 : 0}
                      data-fixed={row.fixed ? 1 : 0}
                      data-fixw={Math.max(2, row.fixGap * G.k)}
                    >
                      <g className="row-inner" data-g0={row.gap[0]}>
                        {row.pre.map(seg)}
                        <rect
                          className="gap"
                          x={X(row.gap[0])}
                          y={y - G.h / 2}
                          width={(row.gap[1] - row.gap[0]) * G.k}
                          height={G.h}
                          fill="url(#hatch)"
                        />
                        <g className="postA">{row.postA.map(seg)}</g>
                        <g className="postB">
                          {row.postB.map((s, k) => seg(s, k + 100))}
                          {!row.fixed && (
                            <circle
                              cx={X(row.postB[row.postB.length - 1].t1) + 6}
                              cy={y}
                              r={2.6}
                              fill={color.faultLit}
                            />
                          )}
                        </g>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* step 1: the moment itself */}
              <div className="ov ov-transcript pointer-events-none absolute inset-x-0 top-0">
                <div className="t-label mb-3 text-on-carbon-3 md:mb-5">
                  call {fmtInt(callRob.id)} · {callRob.when} · {callRob.version}
                </div>
                <div className="space-y-2.5 md:space-y-4">
                  <p className="speech-agent text-[15px] text-on-carbon-2 md:text-[19px]">
                    <span className="t-label mr-3 text-on-carbon-3">0:16</span>Let me check with the carrier.
                  </p>
                  <p className="t-label flex items-center gap-3 text-fault-lit">
                    <span className="hatch-fault inline-block h-[6px] w-16 rounded-[1px] opacity-90" />
                    4.2 seconds of silence
                  </p>
                  <p className="speech-agent hidden text-[19px] text-on-carbon-2 md:block">
                    <span className="t-label mr-3 text-on-carbon-3">0:22</span>
                    I’m sorry, I’m having trouble reaching the carrier right now…
                  </p>
                  <p className="speech-caller text-[22px] text-on-carbon md:text-[30px]">
                    <span className="t-label mr-3 align-middle text-on-carbon-3">0:29</span>
                    No — don’t worry. I’ll sort it out myself.
                  </p>
                </div>
              </div>

              <div className="ov ov-more t-label pointer-events-none absolute bottom-[-4px] right-0 text-on-carbon-3">
                +{change.why.calls - G.shown} more · {change.why.calls} calls · {change.why.days} days
              </div>

              <div
                className="ov ov-band t-label pointer-events-none absolute text-fault-lit"
                style={{
                  left: `${(bandX / G.vb[0]) * 100}%`,
                  top: `${((G.y(0) - 34) / G.vb[1]) * 100}%`,
                }}
              >
                carrier.status · p95 3.8s · no fallback
              </div>

              {/* step 4: the proposed change */}
              <div className="ov ov-diff absolute inset-x-0 top-[8%] mx-auto w-full max-w-[520px] rounded-[10px] border border-carbon-line bg-carbon-2 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)] md:right-[4%] md:left-auto md:top-[16%] md:p-6">
                <div className="t-label flex justify-between text-on-carbon-3">
                  <span>Change {change.id} · proposed</span>
                  <span className="hidden sm:inline">from {change.why.calls} calls</span>
                </div>
                <div className="t-data mt-4 text-on-carbon-3">{change.diff.path}</div>
                <div className="t-data mt-2 space-y-1.5 text-[12px] md:text-[13px]">
                  {change.diff.removed.map((l) => (
                    <div key={l} className="flex gap-3 text-fault-lit">
                      <span>−</span>
                      <span>{l}</span>
                    </div>
                  ))}
                  {change.diff.added.map((l) => (
                    <div key={l} className="flex gap-3 text-signal-lit">
                      <span>+</span>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
                <div className="t-label mt-5 text-on-carbon-3">Proposed by Treslabs · awaiting replay</div>
              </div>

              {/* step 5: replay */}
              <div className="ov ov-replay pointer-events-none absolute left-0 top-0 flex items-center gap-3 text-on-carbon">
                <Mark spinning={replaying} maxSpeed={9} className="h-[22px] w-auto" title="Replaying" />
                <span className="t-data">
                  Replayed <span className="replay-count">0</span> calls
                </span>
              </div>
              <div className="ov ov-results absolute bottom-[6%] left-0 w-full max-w-[520px] rounded-[10px] border border-carbon-line bg-carbon-2/95 p-4 md:bottom-[8%] md:p-5">
                <dl className="t-data grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-[12px] md:text-[13px]">
                  <dt className="text-on-carbon-2">The {change.replay.cluster.size} failures</dt>
                  <dd className="text-right">
                    {change.replay.cluster.before} → <span className="text-signal-lit">{change.replay.cluster.after}</span> resolved
                  </dd>
                  <dt className="text-on-carbon-2">Regression set · {fmtInt(change.replay.regression.size)}</dt>
                  <dd className="text-right">{change.replay.regression.regressions} regressions</dd>
                  <dt className="text-on-carbon-2">{change.replay.projection.metric}</dt>
                  <dd className="text-right">
                    {change.replay.projection.before}% → <span className="text-signal-lit">{change.replay.projection.after}%</span>
                  </dd>
                </dl>
              </div>

              {/* step 6: review */}
              <div className="ov ov-review absolute inset-x-0 top-[6%] mx-auto w-full max-w-[520px] rounded-[10px] border border-carbon-line bg-carbon-2 p-4 md:right-[4%] md:left-auto md:top-[10%] md:p-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="t-label text-on-carbon-3">Change {change.id}</div>
                    <div className="mt-2 text-[16px] leading-snug md:text-[18px]">{change.title}</div>
                  </div>
                  <div className="t-data relative h-[26px] overflow-hidden rounded-[5px] border border-carbon-line px-2 text-[13px] leading-[24px]">
                    <span className="ver-from block">{change.from}</span>
                    <span className="ver-to absolute inset-x-2 top-0 block text-signal-lit">{change.to}</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-carbon-line pt-4">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-on-carbon text-[11px] font-[600] text-carbon">
                    PR
                  </span>
                  <div className="text-[14px] leading-tight">
                    <div>
                      Approved by {change.review.reviewer}
                    </div>
                    <div className="t-label mt-1 text-on-carbon-3">
                      {change.review.role} · {change.review.approvedAt}
                    </div>
                  </div>
                </div>
                <div className="t-label mt-4 flex flex-wrap gap-x-3 gap-y-1 text-on-carbon-2">
                  {change.rollout.map((r, i) => (
                    <span key={r.pct}>
                      {r.pct}%{r.hold && ` · ${r.hold}`}
                      {i < change.rollout.length - 1 && <span className="ml-3 text-on-carbon-3">→</span>}
                    </span>
                  ))}
                  <span className="text-on-carbon-3">· {change.from} kept ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="h-[clamp(64px,10vw,140px)]" />
    </section>
  );
}
