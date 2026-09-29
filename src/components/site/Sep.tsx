/**
 * A middle-dot separator drawn to sit on the lowercase middle of the text.
 * The typeface's own "·" sits too high next to lowercase words.
 */
export function Sep() {
  return <span className="mx-[0.5em] inline-block h-[3px] w-[3px] shrink-0 translate-y-[1px] rounded-full bg-current opacity-70" aria-hidden />;
}
