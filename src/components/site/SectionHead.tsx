import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Kicker + one claim + at most one supporting sentence. */
export function SectionHead({
  kicker,
  title,
  lead,
  tone = "light",
  className = "",
  titleClassName = "",
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  titleClassName?: string;
}) {
  const k = tone === "light" ? "text-ink-3" : "text-on-carbon-3";
  const l = tone === "light" ? "text-ink-2" : "text-on-carbon-2";
  return (
    <div className={className}>
      {kicker && (
        <Reveal>
          <span className={`t-kicker ${k} block mb-6`}>{kicker}</span>
        </Reveal>
      )}
      <Reveal as="h2" className={`t-h2 ${titleClassName}`} delay={0.05}>
        {title}
      </Reveal>
      {lead && (
        <Reveal as="p" className={`t-lead ${l} mt-6 max-w-[34rem]`} delay={0.12}>
          {lead}
        </Reveal>
      )}
    </div>
  );
}
