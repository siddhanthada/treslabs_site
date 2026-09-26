import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Eyebrow } from "@/components/brand/Frame";

/** One section rhythm for the whole light body: centred header, then content. */
export function Section({
  id,
  eyebrow,
  title,
  sub,
  children,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-24 md:py-32 ${className}`}>
      <div className="wrap">
        <div className="mx-auto max-w-[760px] text-center">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal as="h2" className="mt-5 text-[clamp(32px,4vw,54px)] font-[540] leading-[1.04] tracking-[-0.035em] text-balance" delay={0.05}>
            {title}
          </Reveal>
          {sub && (
            <Reveal as="p" className="mx-auto mt-5 max-w-[34rem] text-[17px] leading-[1.5] text-ink-2" delay={0.1}>
              {sub}
            </Reveal>
          )}
        </div>
        <div className="mt-14 md:mt-16">{children}</div>
      </div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[16px] border border-line bg-paper ${className}`}>
      {children}
    </div>
  );
}
