import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Eyebrow } from "@/components/brand/Frame";

/**
 * One section rhythm for the whole light body. Two header shapes, so the page
 * doesn't read as one header repeated: centred, or left-aligned (eyebrow,
 * claim, then the supporting line directly beneath it).
 */
export function Section({
  id,
  eyebrow,
  title,
  sub,
  aside,
  align = "center",
  children,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  /** A control shown under the header. */
  aside?: ReactNode;
  align?: "center" | "left";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-24 md:py-32 ${className}`}>
      <div className="wrap">
        {align === "center" ? (
          <div className="mx-auto max-w-[684px] text-center">
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
            <Reveal as="h2" className="mt-5 text-[clamp(28.8px,3.6vw,48.6px)] font-[540] leading-[1.04] tracking-[-0.035em] text-balance" delay={0.05}>
              {title}
            </Reveal>
            {sub && (
              <Reveal as="p" className="mx-auto mt-5 max-w-[34rem] text-[15.3px] leading-[1.5] text-ink-2" delay={0.1}>
                {sub}
              </Reveal>
            )}
            {aside && (
              <Reveal className="mt-8 flex justify-center" delay={0.14}>
                {aside}
              </Reveal>
            )}
          </div>
        ) : (
          <div className="max-w-[720px]">
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
            <Reveal as="h2" className="mt-5 max-w-[18ch] text-[clamp(28.8px,3.6vw,48.6px)] font-[540] leading-[1.04] tracking-[-0.035em] text-balance" delay={0.05}>
              {title}
            </Reveal>
            {sub && (
              <Reveal as="p" className="mt-5 max-w-[34rem] text-[15.3px] leading-[1.5] text-ink-2" delay={0.1}>
                {sub}
              </Reveal>
            )}
            {aside && (
              <Reveal className="mt-8" delay={0.14}>
                {aside}
              </Reveal>
            )}
          </div>
        )}
        <div className="mt-14 md:mt-16">{children}</div>
      </div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[14.4px] border border-line bg-paper ${className}`}>
      {children}
    </div>
  );
}
