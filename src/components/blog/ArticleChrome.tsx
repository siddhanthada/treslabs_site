"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/** A thin lime-deep line under the nav that fills as you read. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-lime-deep"
      style={{ scaleX: x }}
      aria-hidden
    />
  );
}

/** Sticky table of contents; the section being read is marked. */
export function Toc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const on = () => {
      const y = window.innerHeight * 0.3;
      let cur = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= y) cur = it.id;
      }
      setActive(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [items]);
  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className="sticky top-[calc(var(--nav-h)+32px)]">
      <div className="t-label text-ink-3">On this page</div>
      <ul className="mt-4 border-l border-line">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`-ml-px block border-l py-1.5 pl-4 text-[13.05px] leading-[1.35] transition-colors ${
                active === it.id ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CopyLink() {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(window.location.href);
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
      className="inline-flex items-center gap-2 rounded-[9px] border border-line bg-paper px-3 py-1.5 text-[12.6px] text-ink-2 transition-colors hover:text-ink"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M6.5 9.5l3-3M7 4.5l1-1a2.8 2.8 0 0 1 4 4l-1 1M9 11.5l-1 1a2.8 2.8 0 0 1-4-4l1-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {done ? "Link copied" : "Copy link"}
    </button>
  );
}
