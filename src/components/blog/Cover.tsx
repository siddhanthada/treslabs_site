"use client";

import Image from "next/image";
import { Pixel } from "@/components/brand/Pixel";

/**
 * Editorial image: a real photo with a small pixel signature — its right edge
 * dissolves into the Treslabs pixel grid. Informational images never get this.
 */
export function Cover({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority,
  cols = 72,
  edge = 0.3,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  cols?: number;
  /** How far the pixel signature reaches in from the right edge (0–1). */
  edge?: number;
}) {
  const mask = `linear-gradient(to left, #000 0%, #000 ${edge * 40}%, transparent ${edge * 100}%)`;
  return (
    <div className={`relative overflow-hidden bg-sink ${className}`}>
      <Image src={`${src}?w=1600&q=80&auto=format`} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      <div className="absolute inset-0" style={{ maskImage: mask, WebkitMaskImage: mask }} aria-hidden>
        <Pixel src={src} focus={{ x: 0.5, y: 0.5 }} cols={cols} animate={false} scan={false} className="absolute inset-0" />
      </div>
    </div>
  );
}
