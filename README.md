# Treslabs — marketing site

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Motion · GSAP/ScrollTrigger. Fully static; deploys to Vercel as-is.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Structure

```
src/
  app/                 layout (fonts, metadata), page (section order), globals.css (brand tokens + type)
  content/scenario.ts  every name, call, number on the page — one coherent fictional scenario
  lib/
    tokens.ts          colour values for JS-driven animation (mirror of @theme in globals.css)
    motion.ts          springs/eases derived from the mark's physics, helpers, seeded PRNG
    useMediaQuery.ts
  components/
    brand/             Mark (live physics port of the brand-mark artifact), Logo lockup
    site/              Nav, Footer, Button, SectionHead, Reveal
    speech/            call clock + word-timed speech primitives (shared by hero and before/after)
    home/              one file per homepage section
```

## System rules worth keeping (current, open to revision)

- **Colour as behaviour.** Bone/paper/ink for the page, carbon for production moments. Ultramarine
  (`signal`) appears when the system acts, then cools to ink as things settle ("afterglow"). It is
  also the colour of the mark in motion: the spinning mark leaves an ultramarine trail and is ink at
  rest. Terracotta (`fault`) only means a customer was failed.
- **Three voices.** Instrument Sans (interface), Instrument Serif (only a caller's words), Plex Mono
  (data). Speech markup in `scenario.ts`: `(um)` hesitation, `/` pause (widened space), `_word_`
  emphasis, `cut: true` for an interrupted turn.
- **Motion from the mark.** Converge while working, release and settle exactly at rest. Used in:
  the mark itself (nav, hero "thinking", tool calls, replay, rollout pause, CTA), clusters converging
  then releasing, rules converging into the agent definition. A single **scan line** is the
  evaluation motif (400-call sweep, replay sweep).
- **Two GSAP pinned sequences** (400 calls, failure → review). Everything else is Motion.
  `useStickyProgress` measures live — Motion's `useScroll` caches offsets before GSAP pin spacers
  exist, so don't use it below a pinned section.
- **Data.** Every name and number lives in `content/scenario.ts`; the header comment lists the
  arithmetic that must stay consistent.
- **Reduced motion.** Every section renders its finished state; nothing pins.

## Two modes

**System mode** (product objects, evidence): page near-white `#f6f6f3`, white surfaces, ink,
ultramarine for activity, terracotta for failure. Cards, rows, strips, diffs.

**Expression mode** (people, consequence, brand): colour temperature carries meaning —
- *Night* (`carbon`, ultramarine-black): the living system; hero, failure story, operations.
- *Daylight* (`daylight`, `amber`, `umber`): people and the world. Callers speak in warm serif;
  consequences land on daylight fields.
- *Dawn* (`--dawn`): the one gradient, only on the leading edge of a consequence — the moment the
  system's work becomes something in the world. Implemented once in `brand/Consequence.tsx`.
- *The mark's geometry at scale*: `brand/BladeField.tsx` (blades release and settle as a section
  arrives) and the hero's cropped mark, which spins up only when the agent is thinking.

Rule of thumb: if it's something the product would show, it's system mode. If it's something a
customer would feel, it's expression mode.

## Before publishing

- `security` items in `scenario.ts` are **provisional** (`verified: false`) and render a visible
  "draft · confirm" marker. Confirm wording with whoever owns security/compliance, then flip the flag.
- `contact` hrefs in `scenario.ts` are **placeholders**.
- Audio: speech components are structured for synced playback; add consented or clearly-disclosed
  synthetic recordings only when they're good enough.
