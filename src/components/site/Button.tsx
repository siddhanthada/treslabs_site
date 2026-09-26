import type { ReactNode } from "react";

type Variant = "ink" | "line" | "bone" | "ghost-dark" | "lime";

export function Button({
  href,
  children,
  variant = "ink",
  arrow = false,
  className = "",
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <a
      href={href}
      className={`btn btn-${variant} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
      {arrow && (
        <span aria-hidden className="arrow">
          →
        </span>
      )}
    </a>
  );
}
