/**
 * Marks placeholder content in development builds only, so nothing
 * illustrative reaches production unnoticed. Renders nothing in production.
 */
export function Draft({ className = "" }: { className?: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className={`inline-block rounded-[5.4px] bg-fault-tint px-1.5 align-middle text-[9.45px] font-[500] text-[#a8411f] ${className}`}>
      placeholder
    </span>
  );
}
