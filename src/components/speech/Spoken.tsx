import type { Turn } from "@/content/scenario";
import { fmtTime } from "@/lib/motion";

/*
  Speech markup, written in scenario.ts:
    (um)      hesitation — lighter, it isn't content
    /         a pause — rendered as measured space, not punctuation
    _word_    emphasis — the word the speaker leans on
  A turn with `cut: true` was interrupted: it trails off and the next
  speaker's turn overlaps it in time.
*/

type Tok = { w: string; kind: "word" | "hes" | "emph" | "pause" };

export function tokenize(text: string): Tok[] {
  return text
    .split(" ")
    .filter(Boolean)
    .map((w): Tok => {
      if (w === "/") return { w: "", kind: "pause" };
      if (/^\(.*\)[,.]?$/.test(w)) return { w: w.replace(/[()]/g, ""), kind: "hes" };
      if (/^_.*_[,.?!]?$/.test(w)) return { w: w.replace(/_/g, ""), kind: "emph" };
      return { w, kind: "word" };
    });
}

/** Plain text for screen readers and anywhere markup shouldn't show. */
export const plain = (text: string) =>
  tokenize(text)
    .filter((t) => t.kind !== "pause")
    .map((t) => t.w)
    .join(" ");

export function SpokenWords({
  text,
  progress,
  ghost = 0,
  voice = "caller",
  cut = false,
}: {
  text: string;
  /** 0..1 through the turn */
  progress: number;
  /** Opacity for words not yet spoken (0 hides them but keeps their space). */
  ghost?: number;
  voice?: "caller" | "agent";
  cut?: boolean;
}) {
  const toks = tokenize(text);
  const spoken = toks.filter((t) => t.kind !== "pause").length;
  const shown = progress >= 1 ? spoken : Math.floor(progress * (spoken + 0.6));
  let k = 0;
  return (
    <span aria-label={plain(text)}>
      <span aria-hidden>
        {toks.map((t, i) => {
          // A pause widens the space before it; nothing renders for the token
          // itself, so a pause at a line break simply disappears.
          if (t.kind === "pause") return null;
          const idx = k++;
          const on = idx < shown;
          const last = idx === spoken - 1;
          const cls =
            t.kind === "hes"
              ? "opacity-45 italic"
              : t.kind === "emph"
                ? voice === "caller"
                  ? "italic"
                  : "font-[600]"
                : "";
          return (
            <span
              key={i}
              className={`word ${cls}`}
              style={{
                opacity: on ? (t.kind === "hes" ? 0.45 : cut && last ? 0.5 : 1) : ghost,
              }}
            >
              {t.w}
              {cut && last ? "—" : ""}
              {i < toks.length - 1 &&
                (toks[i + 1]?.kind === "pause" ? <span style={{ wordSpacing: "0.32em" }}> </span> : " ")}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export const turnProgress = (turn: Turn, t: number) =>
  t <= turn.t0 ? 0 : t >= turn.t1 ? 1 : (t - turn.t0) / (turn.t1 - turn.t0);

export function SpeakerLabel({
  turn,
  speaking,
  dark = false,
  name,
}: {
  turn: Turn;
  speaking: boolean;
  dark?: boolean;
  name?: string;
}) {
  const dim = dark ? "text-on-carbon-3" : "text-ink-3";
  return (
    <span className={`t-label ${dim} flex items-center gap-2`}>
      <span className="relative inline-flex h-[10px] w-[3px] items-center" aria-hidden>
        <span
          className={`absolute inset-0 rounded-full ${
            speaking ? "speaking-bar bg-signal" : dark ? "bg-on-carbon-3/60" : "bg-line-2"
          }`}
        />
      </span>
      <span>{turn.who === "caller" ? name ?? "Caller" : "Agent"}</span>
      <span className="opacity-70">{fmtTime(turn.t0)}</span>
    </span>
  );
}
