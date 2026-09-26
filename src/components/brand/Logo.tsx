import { Mark } from "./Mark";

type LogoProps = {
  className?: string;
  /** Mark spins up and brakes to rest once on mount. */
  intro?: boolean;
  spinning?: boolean;
  tone?: "ink" | "bone";
};

/**
 * Lockup per the brand spec: mark ink height ≈ 2.2× the wordmark ascender,
 * gap = 0.2× mark height, "tres" 600 / "labs" 425 separated by weight and tone.
 */
export function Logo({ className = "", intro, spinning, tone = "ink" }: LogoProps) {
  const dim = tone === "ink" ? "text-ink-3" : "text-on-carbon-3";
  return (
    <span className={`inline-flex items-center gap-[5.4px] ${className}`}>
      <Mark intro={intro} spinning={spinning} maxSpeed={11} className="h-[25.2px] w-auto" />
      <span className="text-[17.1px] leading-none tracking-[-0.035em] select-none">
        <span className="font-[600]">tres</span>
        <span className={`font-[425] ${dim}`}>labs</span>
      </span>
    </span>
  );
}
