"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/*
  People, rendered as the system sees them: a photograph resolved into a
  colour pixel grid. It builds coarse → fine, like an image being generated,
  then a faint lime scan line reads across it now and then.

  Photos: Unsplash (free licence, commercial use allowed). Illustrative only —
  never presented as real customers.
*/

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const BLOCKS = [16, 8, 4, 2, 1];
const LEVELS = 7;

type RGB = [number, number, number];

export function Pixel({
  src,
  cols = 48,
  focus = { x: 0.5, y: 0.35 },
  gap = 1,
  build = 1.9,
  scan = true,
  animate = true,
  zoom = 1,
  className = "",
  alt = "",
}: {
  src: string;
  /** Pixels across. */
  cols?: number;
  /** Where to keep when cropping, as fractions of the photo. */
  focus?: { x: number; y: number };
  /** Gap between pixels, in CSS px. */
  gap?: number;
  /** Seconds to resolve. */
  build?: number;
  scan?: boolean;
  /** false: appear already resolved (a quick fade) — the build is reserved for a live call. */
  animate?: boolean;
  /** Crop tighter than the frame's aspect around the focus point. */
  zoom?: number;
  className?: string;
  alt?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = host.current;
    const canvas = cv.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let started = false;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${src}${src.includes("?") ? "&" : "?"}w=640&q=75&auto=format`;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let cell = 0;
    let rows = 0;
    let finalGrid: RGB[] = [];
    let stages: RGB[][] = [];
    let order: Float32Array = new Float32Array(0);

    const prepare = () => {
      const r = el.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cell = W / cols;
      rows = Math.max(1, Math.round(H / cell));
      // Backing store at device resolution; CSS size stays 100% of the frame so
      // page-level zoom never scales the canvas twice.
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      // crop the photo to the grid's aspect around the focus point
      const aspect = cols / rows;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      if (sw / sh > aspect) sw = sh * aspect;
      else sh = sw / aspect;
      sw /= zoom;
      sh /= zoom;
      const sx = Math.min(img.naturalWidth - sw, Math.max(0, focus.x * img.naturalWidth - sw / 2));
      const sy = Math.min(img.naturalHeight - sh, Math.max(0, focus.y * img.naturalHeight - sh / 2));

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.imageSmoothingQuality = "high";
      o.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const d = o.getImageData(0, 0, cols, rows).data;

      // auto-levels: stretch the 2nd–98th percentile of luminance so every photo lands the same
      const lums: number[] = [];
      for (let i = 0; i < d.length; i += 4) lums.push(0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]);
      lums.sort((a, b) => a - b);
      const lo = lums[Math.floor(lums.length * 0.02)];
      const hi = lums[Math.floor(lums.length * 0.98)];
      const k = 255 / Math.max(40, hi - lo);
      for (let i = 0; i < d.length; i += 4)
        for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, (d[i + c] - lo) * k));

      // colour treatment: a little more saturation, posterised with an ordered dither
      const step = 255 / (LEVELS - 1);
      finalGrid = new Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const g = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
          const t = (BAYER[y % 4][x % 4] / 16 - 0.5) * step * 0.9;
          const px: RGB = [0, 0, 0];
          for (let c = 0; c < 3; c++) {
            const v = g + (d[i + c] - g) * 1.28 + t;
            px[c] = Math.max(0, Math.min(255, Math.round(v / step) * step));
          }
          finalGrid[y * cols + x] = px;
        }
      }

      // coarser stages: each cell takes its block's average
      stages = BLOCKS.map((b) => {
        if (b === 1) return finalGrid;
        const out: RGB[] = new Array(cols * rows);
        for (let by = 0; by < rows; by += b) {
          for (let bx = 0; bx < cols; bx += b) {
            let r0 = 0;
            let g0 = 0;
            let b0 = 0;
            let n = 0;
            for (let y = by; y < Math.min(rows, by + b); y++)
              for (let x = bx; x < Math.min(cols, bx + b); x++) {
                const p = finalGrid[y * cols + x];
                r0 += p[0];
                g0 += p[1];
                b0 += p[2];
                n++;
              }
            const avg: RGB = [r0 / n, g0 / n, b0 / n];
            for (let y = by; y < Math.min(rows, by + b); y++)
              for (let x = bx; x < Math.min(cols, bx + b); x++) out[y * cols + x] = avg;
          }
        }
        return out;
      });
      order = new Float32Array(cols * rows);
      for (let i = 0; i < order.length; i++) order[i] = Math.random();
    };

    const draw = (elapsed: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const S = BLOCKS.length;
      const p = reduce || !animate ? S : (elapsed / build) * S;
      const scanY = scan && !reduce && elapsed > build + 0.6 ? (((elapsed - build) % 5.5) / 1.6) * rows : -99;
      const g = Math.min(gap, cell * 0.2);
      for (let y = 0; y < rows; y++) {
        const nearScan = Math.abs(y - scanY);
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const k = Math.min(S - 1, Math.floor(p - order[i] * 1.1));
          if (k < 0) continue;
          let [r, gg, b] = stages[k][i];
          if (nearScan < 1.5) {
            const a = 0.45 * (1 - nearScan / 1.5);
            r = r + (215 - r) * a;
            gg = gg + (243 - gg) * a;
            b = b + (106 - b) * a;
          }
          ctx.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
          ctx.fillRect(x * cell, y * cell, cell - g, cell - g);
        }
      }
    };

    const start = () => {
      if (started || cancelled || !img.complete || !img.naturalWidth) return;
      started = true;
      prepare();
      if (!animate) {
        draw(0);
        canvas.style.opacity = "1";
        return;
      }
      const t0 = performance.now();
      let last = 0;
      const loop = (now: number) => {
        if (cancelled) return;
        const e = (now - t0) / 1000;
        // full frame rate while resolving, then a calm 20fps for the scan
        if (e < build + 0.2 || now - last > 50) {
          draw(e);
          last = now;
        }
        if (reduce) return;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { threshold: 0.25 },
    );
    img.onload = () => io.observe(el);

    const ro = new ResizeObserver(() => {
      if (!started) return;
      prepare();
      if (!animate) draw(0);
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [src, cols, focus.x, focus.y, gap, build, scan, reduce, animate, zoom]);

  return (
    <div ref={host} className={className} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      <canvas
        ref={cv}
        className="block h-full w-full transition-opacity duration-500"
        style={animate ? undefined : { opacity: 0 }}
      />
    </div>
  );
}

/** The cast. Unsplash free licence; illustrative, not customers. */
export const PEOPLE = {
  hero: { src: "https://images.unsplash.com/photo-1663743629961-c6134ef1afc9", focus: { x: 0.52, y: 0.32 } },
  tuesday: { src: "https://images.unsplash.com/photo-1517940322679-2b003a168fd2", focus: { x: 0.45, y: 0.35 } },
  thursday: { src: "https://images.unsplash.com/photo-1595986630530-969786b19b4d", focus: { x: 0.5, y: 0.3 } },
  older: { src: "https://images.unsplash.com/photo-1788778055162-abfe0258c57e", focus: { x: 0.45, y: 0.3 } },
  street: { src: "https://images.unsplash.com/photo-1626063240213-c629ae4ef34c", focus: { x: 0.55, y: 0.45 } },
  walking: { src: "https://images.unsplash.com/photo-1707139051019-dee0b357f9dd", focus: { x: 0.5, y: 0.4 } },
  desk: { src: "https://images.unsplash.com/photo-1605568985653-3d8e43f4efa6", focus: { x: 0.5, y: 0.3 } },
  suit: { src: "https://images.unsplash.com/photo-1758525589111-eaba67028b36", focus: { x: 0.5, y: 0.38 } },
  rose: { src: "https://images.unsplash.com/photo-1734336037902-e8ffd46704cd", focus: { x: 0.6, y: 0.42 } },
  mira: { src: "https://images.unsplash.com/photo-1698891667770-c611cf57d82c", focus: { x: 0.5, y: 0.4 } },
  arjun: { src: "https://images.unsplash.com/photo-1659353221337-c67b04ed7f8c", focus: { x: 0.37, y: 0.28 } },
  priya: { src: "https://images.unsplash.com/photo-1733737272264-6af8f1aa41fc", focus: { x: 0.5, y: 0.32 } },
  ramesh: { src: "https://images.unsplash.com/photo-1569140733895-eabccf089fc3", focus: { x: 0.58, y: 0.3 } },
  ana: { src: "https://images.unsplash.com/photo-1686723726446-8b881f37ce62", focus: { x: 0.52, y: 0.3 } },
  lena: { src: "https://images.unsplash.com/photo-1758876201450-cf77ab8b95bc", focus: { x: 0.64, y: 0.38 } },
} as const;
