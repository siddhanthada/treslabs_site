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
 * gap = 0.2× mark height. One solid colour for presence; "tres" 680 / "labs" 480
 * are separated by weight alone.
 */
export function Logo({ className = "", intro, spinning, tone = "ink" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-[6.3px] ${className}`}>
      <Mark intro={intro} spinning={spinning} maxSpeed={11} className="h-[29px] w-auto" />
      <span className={`text-[19.8px] leading-none tracking-[-0.035em] select-none ${tone === "ink" ? "text-ink" : "text-on-carbon"}`}>
        <span className="font-[680]">tres</span>
        <span className="font-[480]">labs</span>
      </span>
    </span>
  );
}
