"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Card, Section } from "@/components/site/Section";
import { Pixel, PEOPLE } from "@/components/brand/Pixel";
import { Mark } from "@/components/brand/Mark";
import { SpokenWords, plain, turnProgress } from "@/components/speech/Spoken";
import { scenarios, type Scenario } from "@/content/scenarios";
import { ease, fmtTime, mulberry32 } from "@/lib/motion";
import { CallIt } from "./Try";

/**
 * Hear it handle the hard ones. Pick a scenario; the call plays with a live
 * transcript, a scrubbable waveform and what Treslabs did at each moment.
 * Optional sound uses the browser's own voices — clearly a preview.
 */
export function Scenarios() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const sc = scenarios[idx];
  const [t, setT] = useState(0);
  const seen = useInView(ref, { amount: 0.35, once: true });
  // until someone presses a control, the first call plays when it's first seen
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? (seen && !reduce);
  const [speed, setSpeed] = useState(1);
  const [sound, setSound] = useState(false);
  const clock = useRef({ t: 0 });

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock.current.t = Math.min(sc.duration, clock.current.t + dt * speed);
      setT(clock.current.t);
      if (clock.current.t >= sc.duration) {
        setUserPlaying(false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, sc.duration]);

  const seek = useCallback((s: number) => {
    clock.current.t = s;
    setT(s);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  const choose = (i: number) => {
    setIdx(i);
    seek(0);
    setUserPlaying(true);
  };

  useSpeech(sc, t, playing && sound, speed);

  const done = t >= sc.duration - 0.05;

  return (
    <Section
      id="hear"
      eyebrow="Hear it, then call it"
      title="Don’t take our word for it."
      sub="Listen to four hard calls. Then ring the test agent yourself."
    >
      <div ref={ref}>
        {/* the scenarios */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {scenarios.map((s, i) => {
            const active = i === idx;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={active}
                className={`group flex items-center gap-4 rounded-[14.4px] border p-3 text-left transition-colors ${
                  active ? "border-ink bg-paper" : "border-line bg-paper/60 hover:border-line-2 hover:bg-paper"
                }`}
              >
                <Pixel
                  src={PEOPLE[s.person].src}
                  focus={PEOPLE[s.person].focus}
                  cols={30}
                  zoom={1.4}
                  animate={false}
                  scan={false}
                  gap={0.4}
                  className="h-[68.4px] w-[68.4px] shrink-0 overflow-hidden rounded-[9px]"
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13.95px] font-[540] tracking-[-0.01em]">{s.title}</span>
                  <span className="mt-0.5 block truncate text-[11.7px] text-ink-3">
                    {s.caller} · {fmtTime(s.duration)}
                  </span>
                  <span
                    className={`mt-1.5 inline-flex rounded-[5.4px] px-1.5 py-0.5 text-[10.35px] ${
                      active ? "bg-lime text-ink" : "bg-sink text-ink-2"
                    }`}
                  >
                    {s.hard}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* the player */}
        <Card className="mt-4 grid lg:grid-cols-12">
          <div className="border-line p-6 md:p-8 lg:col-span-7 lg:border-r">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (done) seek(0);
                    setUserPlaying(!playing || done);
                  }}
                  className="grid h-11 w-11 place-items-center rounded-[9px] bg-lime text-ink transition-colors hover:bg-lime-hover"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? (
                    <svg viewBox="0 0 16 16" className="h-4 w-4"><rect x="3.5" y="3" width="3" height="10" rx="1" fill="currentColor" /><rect x="9.5" y="3" width="3" height="10" rx="1" fill="currentColor" /></svg>
                  ) : (
                    <svg viewBox="0 0 16 16" className="h-4 w-4"><path d="M5 3.2v9.6c0 .5.5.8.9.5l7.2-4.8a.6.6 0 0 0 0-1L5.9 2.7c-.4-.3-.9 0-.9.5Z" fill="currentColor" /></svg>
                  )}
                </button>
                <div>
                  <div className="text-[13.5px] font-[540]">{sc.title}</div>
                  <div className="t-label text-ink-3">
                    {fmtTime(t)} / {fmtTime(sc.duration)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[1, 1.5].map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSpeed(sp)}
                    className={`rounded-[7.2px] px-2.5 py-1.5 text-[11.7px] ${speed === sp ? "bg-ink text-bone" : "bg-sink text-ink-2"}`}
                  >
                    {sp}×
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSound((s) => !s);
                    window.speechSynthesis?.cancel();
                  }}
                  className={`flex items-center gap-2 rounded-[7.2px] px-2.5 py-1.5 text-[11.7px] ${sound ? "bg-ink text-bone" : "bg-sink text-ink-2"}`}
                  aria-pressed={sound}
                  title="Uses your browser's built-in voices — a preview, not our voice"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden><path d="M2 6v4h3l4 3V3L5 6H2Z" fill="currentColor" />{sound && <path d="M11 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />}</svg>
                  Sound
                </button>
              </div>
            </div>

            <Wave sc={sc} t={t} onSeek={seek} />

            <ol className="mt-6 space-y-3.5">
              {sc.turns.map((u) => {
                const p = turnProgress(u, t);
                const caller = u.who === "caller";
                return (
                  <li key={u.t0} className="grid grid-cols-[4.5rem_1fr] gap-3">
                    <span className="flex items-center gap-1.5 pt-[2.7px] text-[11.25px] text-ink-3">
                      {caller ? (
                        <span className="h-2 w-2 rounded-[1.8px] bg-lime-deep" />
                      ) : (
                        <Mark className="h-[9px] w-auto text-ink" title="" />
                      )}
                      {caller ? sc.caller : "Agent"}
                    </span>
                    <p className={caller ? "speech-caller text-[18.9px] leading-[1.2] text-ink" : "text-[13.95px] leading-[1.5] text-ink-2"}>
                      <SpokenWords text={u.text} progress={p} voice={u.who} cut={u.cut} ghost={0.2} />
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-col bg-bone/50 p-6 md:p-8 lg:col-span-5">
            <div className="t-label text-ink-3">What Treslabs did</div>
            <ol className="mt-4 space-y-2">
              {sc.acts.map((a) => {
                const on = t >= a.at;
                return (
                  <motion.li
                    key={a.at}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.3, x: on ? 0 : -4 }}
                    transition={{ duration: 0.35, ease: ease.out }}
                    className="flex items-start gap-3 rounded-[10.8px] border border-line bg-paper px-3.5 py-3"
                  >
                    <span
                      className={`mt-[2.7px] grid h-[16.2px] w-[16.2px] shrink-0 place-items-center rounded-[4.5px] text-[9.9px] ${
                        !on ? "bg-sink text-ink-3" : a.tone === "slow" || a.tone === "stop" ? "bg-fault-tint text-fault" : "bg-lime text-ink"
                      }`}
                    >
                      {a.tone === "stop" ? "!" : a.tone === "slow" ? "~" : "✓"}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.6px] font-[520]">{a.system}</span>
                      <span className="block text-[12.15px] text-ink-2">{a.text}</span>
                    </span>
                    <span className="t-label ml-auto pt-[1.8px] text-ink-3">{fmtTime(a.at)}</span>
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-auto pt-6">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 165, damping: 17.5 }}
                    className="rounded-[12.6px] bg-ink p-5 text-bone"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[15.3px] font-[540]">{sc.outcome.label}</span>
                      <span className="rounded-[5.4px] bg-lime px-2 py-0.5 text-[10.8px] text-ink">{sc.outcome.checks}</span>
                    </div>
                    <div className="mt-1.5 text-[12.15px] text-bone/60">Evaluated the moment the call ended.</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="live"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-[12.6px] border border-dashed border-line-2 p-5 text-[12.6px] text-ink-3"
                  >
                    <Mark spinning={playing} maxSpeed={9} className="h-[14.4px] w-auto text-ink" title="" trail={false} />
                    {playing ? "Call in progress…" : "Press play to hear the call"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>

      {/* then: call it yourself */}
      <div className="mt-24 md:mt-32">
        <div className="mb-10 flex items-center gap-5">
          <span className="h-px flex-1 bg-line" />
          <h3 className="text-center text-[clamp(22px,2.4vw,32px)] font-[540] tracking-[-0.028em]">Now, call it yourself.</h3>
          <span className="h-px flex-1 bg-line" />
        </div>
        <CallIt />
      </div>
    </Section>
  );
}

/* A waveform built from who spoke when; click anywhere to jump. */
function Wave({ sc, t, onSeek }: { sc: Scenario; t: number; onSeek: (s: number) => void }) {
  const bars = useMemo(() => {
    const r = mulberry32(sc.key.length * 97 + 3);
    const out: { at: number; h: number; who: "caller" | "agent" | null }[] = [];
    const n = 96;
    for (let i = 0; i < n; i++) {
      const at = (i / n) * sc.duration;
      const turn = sc.turns.find((u) => at >= u.t0 && at <= u.t1);
      out.push({ at, h: turn ? 0.25 + r() * 0.75 : 0.08, who: turn ? turn.who : null });
    }
    return out;
  }, [sc]);
  const pos = Math.min(1, t / sc.duration);
  return (
    <div className="mt-6">
      <button
        type="button"
        className="relative flex h-14 w-full items-center gap-[2.7px]"
        aria-label="Seek within the call"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - r.left) / r.width) * sc.duration);
        }}
      >
        {bars.map((b, i) => (
          <span
            key={i}
            className="flex-1 rounded-full transition-colors duration-200"
            style={{
              height: `${b.h * 100}%`,
              backgroundColor: b.at <= t ? (b.who ? "#9bbd28" : "#c9d99a") : b.who ? "#d9d9d2" : "#e8e8e3",
            }}
          />
        ))}
        {/* playhead */}
        <span
          className="pointer-events-none absolute inset-y-0 w-[1.5px] rounded-full bg-ink transition-[left] duration-100"
          style={{ left: `calc(${pos * 100}% - 0.75px)` }}
          aria-hidden
        />
      </button>
      {/* who spoke when: a slim lane instead of recolouring the waveform */}
      <div className="relative mt-2 h-[3px] w-full rounded-full bg-sink" aria-hidden>
        {sc.turns.map((u) => (
          <span
            key={`${u.who}-${u.t0}`}
            className={`absolute inset-y-0 rounded-full ${u.who === "caller" ? "bg-ink/70" : "bg-lime-deep/60"}`}
            style={{ left: `${(u.t0 / sc.duration) * 100}%`, width: `${((u.t1 - u.t0) / sc.duration) * 100}%` }}
          />
        ))}
      </div>
      <div className="t-label mt-2 flex gap-4 text-ink-3" aria-hidden>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3 rounded-full bg-ink/70" />
          {sc.caller}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3 rounded-full bg-lime-deep/60" />
          Agent
        </span>
      </div>
    </div>
  );
}

/* Optional sound: the browser's own voices, one for the caller, one for the agent. */
function useSpeech(sc: Scenario, t: number, on: boolean, speed: number) {
  const spoken = useRef(new Set<string>());
  useEffect(() => {
    spoken.current.clear();
    window.speechSynthesis?.cancel();
  }, [sc.key, on]);
  useEffect(() => {
    if (!on || typeof window === "undefined" || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
    const gb = voices.filter((v) => v.lang === "en-GB");
    const pool = gb.length >= 2 ? gb : voices;
    for (const u of sc.turns) {
      const id = `${sc.key}-${u.t0}`;
      if (t >= u.t0 && t < u.t0 + 0.4 && !spoken.current.has(id)) {
        spoken.current.add(id);
        const ut = new SpeechSynthesisUtterance(plain(u.text));
        ut.voice = pool[u.who === "caller" ? 0 : Math.min(1, pool.length - 1)] ?? null;
        ut.rate = 1.05 * speed;
        window.speechSynthesis.speak(ut);
      }
    }
  }, [t, on, sc, speed]);
}
