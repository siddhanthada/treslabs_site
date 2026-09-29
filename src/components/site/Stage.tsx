import type { ReactNode } from "react";

/**
 * A stage: a large, softly textured colour panel that holds a product moment.
 * Used to vary the page's rhythm — the visual carries the section, not copy.
 */
const TONES = {
  lime: { bg: "bg-[#eef6d2]", dot: "rgba(86,114,10,.14)" },
  sand: { bg: "bg-[#ecebe4]", dot: "rgba(17,18,24,.07)" },
  carbon: { bg: "bg-carbon text-on-carbon", dot: "rgba(255,255,255,.055)" },
} as const;

export function Stage({
  tone = "lime",
  className = "",
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-[26px] ${t.bg} ${className}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${t.dot} 1px, transparent 1.2px)`,
          backgroundSize: "18px 18px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 100%)",
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** A small dark voice pill: who is speaking, and their voice. */
export function VoicePill({ name, role, initial, active = true }: { name: string; role: string; initial: string; active?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-[16px] bg-ink py-2 pl-2 pr-4 text-bone shadow-[0_14px_34px_-18px_rgba(17,18,24,.7)]">
      <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#2a2c31] text-[13.5px] font-[540] text-lime">{initial}</span>
      <span className="leading-tight">
        <span className="block text-[13.5px] font-[540]">{name}</span>
        <span className="block text-[11.7px] text-on-carbon-3">{role}</span>
      </span>
      <Bars active={active} />
    </div>
  );
}

function Bars({ active }: { active: boolean }) {
  const H = [0.35, 0.6, 0.9, 0.5, 1, 0.7, 0.45, 0.85, 0.55, 0.3, 0.65, 0.4];
  return (
    <span className="ml-1 flex h-5 items-center gap-[3px]" aria-hidden>
      {H.map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full bg-lime ${active ? "animate-[voice_1.1s_ease-in-out_infinite]" : ""}`}
          style={{ height: `${h * 100}%`, animationDelay: `${(i % 6) * 0.09}s`, opacity: active ? 1 : 0.35 }}
        />
      ))}
    </span>
  );
}
