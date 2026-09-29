"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { Pixel } from "@/components/brand/Pixel";

/**
 * Editorial image that arrives the Treslabs way: it builds in as pixels,
 * coarse to fine, then resolves into the real photo.
 */
export function Cover({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority,
  cols = 56,
  focus = { x: 0.5, y: 0.5 },
  zoom = 1,
  delay = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  cols?: number;
  /** Where to crop from, 0–1. Pixels and photo share it so the handoff doesn't jump. */
  focus?: { x: number; y: number };
  /** Crop tighter around the focus point. */
  zoom?: number;
  /** Extra ms before resolving, to stagger a row. */
  delay?: number;
  /** Kept for call-site compatibility; unused. */
  edge?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { amount: 0.25, once: true });
  const reduce = useReducedMotion();
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!seen || reduce) return;
    const id = window.setTimeout(() => setResolved(true), 1500 + delay);
    return () => window.clearTimeout(id);
  }, [seen, reduce, delay]);

  const photo = reduce || resolved;

  return (
    <div ref={ref} className={`relative overflow-hidden bg-sink ${className}`}>
      <Image
        src={`${src}?w=1600&q=80&auto=format`}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover transition-opacity duration-700 ${photo ? "opacity-100" : "opacity-0"}`}
        style={{
          objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: `${focus.x * 100}% ${focus.y * 100}%`,
        }}
      />
      {!reduce && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${photo ? "opacity-0" : "opacity-100"}`} aria-hidden>
          <Pixel src={src} focus={focus} zoom={zoom} cols={cols} build={1.1} scan={false} className="absolute inset-0" />
        </div>
      )}
    </div>
  );
}
