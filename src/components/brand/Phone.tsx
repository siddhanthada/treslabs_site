/** A handset: marks anything that is a call. */
export function Phone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M5.2 2.2 3.4 2.6c-.6.1-1 .7-.9 1.3.7 4.8 4.5 8.6 9.3 9.4.6.1 1.2-.3 1.3-.9l.4-1.8c.1-.5-.2-1-.7-1.2l-2-.8c-.4-.2-.9 0-1.2.3l-.7.9C7.6 9 6.3 7.7 5.4 6.2l.9-.7c.3-.3.5-.8.3-1.2l-.8-2c-.2-.5-.7-.8-1.2-.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
