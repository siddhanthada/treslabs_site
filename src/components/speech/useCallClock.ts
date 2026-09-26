"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue } from "motion/react";

type Options = {
  duration: number;
  playing: boolean;
  speed?: number;
  /** Seconds to hold on the finished call before `onEnd` fires. */
  hold?: number;
  onEnd?: () => void;
  /** Coarse updates per second for React state (words, fields). */
  hz?: number;
};

/**
 * A call's clock. Smooth time lives in a MotionValue (playheads); a coarse
 * copy drives React so word reveals don't re-render at 60fps.
 */
export function useCallClock({ duration, playing, speed = 1, hold = 0, onEnd, hz = 14 }: Options) {
  const time = useMotionValue(0);
  const [t, setT] = useState(0);
  const st = useRef({ t: 0, held: 0, ended: false });
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const seek = useCallback(
    (s: number) => {
      st.current = { t: s, held: 0, ended: false };
      time.set(s);
      setT(s);
    },
    [time],
  );

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let q = -1;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const S = st.current;
      if (S.t < duration) {
        S.t = Math.min(duration, S.t + dt * speed);
        time.set(S.t);
      } else if (!S.ended) {
        S.held += dt;
        if (S.held >= hold) {
          S.ended = true;
          onEndRef.current?.();
        }
      }
      const nq = Math.floor(S.t * hz);
      if (nq !== q) {
        q = nq;
        setT(S.t);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, speed, hold, hz, time]);

  return { t, time, seek };
}
