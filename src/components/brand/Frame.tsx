import type { ReactNode } from "react";

/*
  One surface language for the whole site: soft 16px cards with a hairline
  border on white, 10px/8px radii inside them. Nothing sharp, nothing glossy.
*/

/** Section and hero label: plain text, a small amber square. */
export function Eyebrow({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "light" }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[13.5px] font-[480] tracking-[-0.005em] ${
        tone === "ink" ? "text-ink-2" : "text-on-carbon-2"
      }`}
    >
      <span className="h-[8px] w-[8px] rounded-[2px] bg-lime ring-1 ring-lime-deep/40" aria-hidden />
      {children}
    </span>
  );
}

export function Surface({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative rounded-[16px] border border-line bg-paper ${className}`}>
      {label && <div className="t-label px-5 pt-4 text-ink-3">{label}</div>}
      {children}
    </div>
  );
}
