/**
 * The Harrow & Finch scenario.
 *
 * One fictional homewares retailer runs a Treslabs order-support agent.
 * Every number on the homepage comes from this file, and they connect:
 *
 *   ~3,200 calls a week  ·  ~1,040 order-status calls
 *   Tuesday: 400 calls, 28 failures, 4 causes (+2 unclustered)
 *   Carrier lookup timeout: 73 calls in 7 days, 9 resolved, 64 not
 *   v14 → v15 change 0142: replayed on 73 + 1,200 = 1,273 calls
 *   73 failures: 9 → 61 resolved (+52)  ·  0 regressions in 1,200
 *   Order-status resolution 745/1,040 = 71.6% → 797/1,040 = 76.6%
 *   Later: v16 rollout paused, rolled back; fix replayed on 1,273 + 6 = 1,279
 */

export const company = {
  name: "Harrow & Finch",
  line: "Order line",
  locale: "en-GB",
  callsThisWeek: 3212,
} as const;

/* ─── Calls ─────────────────────────────────────────────────────────── */

export type Speaker = "caller" | "agent";
export type Turn = {
  who: Speaker;
  t0: number;
  t1: number;
  /** Speech markup: (um) hesitation · / pause · _word_ emphasis. See Spoken.tsx. */
  text: string;
  /** Interrupted: the next turn starts before this one finishes. */
  cut?: boolean;
  /** In a replay, lines after the fork come from a simulated caller. */
  simulated?: boolean;
};

export type RecordField = {
  key: string;
  label: string;
  value: string;
  /** When the field resolves (seconds into the call). */
  at: number;
  /** Where in the conversation the evidence came from. */
  source: number;
  tone?: "default" | "fault" | "stop";
};

export type SystemEvent = {
  at: number;
  system: string;
  label: string;
  detail: string;
  status: "ok" | "slow" | "blocked" | "handoff";
};

export type Consequence = {
  /** What the call changed in the world, told in the customer's terms. */
  headline: string;
  steps: { at: string; text: string }[];
};

export type Call = {
  id: number;
  consequence?: Consequence;
  when: string;
  version: string;
  caller: string;
  duration: number;
  outcome: { label: string; tone: "resolved" | "escalated" | "fault" };
  turns: Turn[];
  fields: RecordField[];
  systems: SystemEvent[];
};

const GREETING: Turn = {
  who: "agent",
  t0: 0.4,
  t1: 3.2,
  text: "Harrow & Finch, order line. How can I help?",
};

/** Thursday, v15. The fixed behaviour — this call opens the page. */
export const callDana: Call = {
  id: 48213,
  when: "Thu 09:31",
  version: "v15",
  caller: "Dana Whitfield",
  duration: 37.2,
  consequence: {
    headline: "The lamp arrives at 14:52. Dana doesn’t call back.",
    steps: [
      { at: "09:32", text: "Text alert set for two stops away" },
      { at: "14:31", text: "“Your driver is two stops away”" },
      { at: "14:52", text: "Delivered to LS6 2QT · signed by D. Whitfield" },
    ],
  },
  outcome: { label: "Resolved · no transfer", tone: "resolved" },
  turns: [
    GREETING,
    {
      who: "caller",
      t0: 3.6,
      t1: 9.2,
      text: "Hi — (um) I ordered a lamp last week, and the tracking / hasn't moved since _Monday._",
    },
    { who: "agent", t0: 9.5, t1: 11.6, text: "Sorry about that. Can I take your postcode?" },
    { who: "caller", t0: 11.9, t1: 13.4, text: "LS6 / 2QT." },
    {
      who: "agent",
      t0: 13.8,
      t1: 17.0,
      text: "Thanks, Dana. That's order 44812 — the Arlo floor lamp.",
    },
    { who: "caller", t0: 17.3, t1: 18.3, text: "That's the one." },
    {
      who: "agent",
      t0: 18.6,
      t1: 25.4,
      text: "The carrier's slow to update, but our warehouse shows it left Leeds last night at 18:40. It's out for delivery _today._",
    },
    { who: "agent", t0: 25.8, t1: 26.9, text: "Is there anything", cut: true },
    { who: "caller", t0: 26.5, t1: 28.4, text: "Sorry — / will it be before _six?_" },
    {
      who: "agent",
      t0: 28.7,
      t1: 32.8,
      text: "Their window is 12 till 4. I'll text you when it's two stops away.",
    },
    { who: "caller", t0: 33.1, t1: 34.5, text: "Perfect. / Thank you." },
    { who: "agent", t0: 34.8, t1: 36.6, text: "You're welcome, Dana." },
  ],
  fields: [
    { key: "intent", label: "Intent", value: "Order status · delivery delay", at: 9.2, source: 3.6 },
    { key: "customer", label: "Customer", value: "Dana Whitfield · verified", at: 13.6, source: 11.9 },
    { key: "order", label: "Order", value: "#44812 · Arlo floor lamp · £148", at: 16.6, source: 13.8 },
    { key: "context", label: "Context", value: "Carrier slow → warehouse feed used", at: 18.8, source: 18.6 },
    { key: "action", label: "Action", value: "SMS alert set · two stops away", at: 32.8, source: 28.7 },
    { key: "outcome", label: "Outcome", value: "Resolved · no transfer · 0:37", at: 36.6, source: 34.8 },
    { key: "eval", label: "Evaluation", value: "6 of 6 checks · yielded to interruption", at: 37.2, source: 25.8 },
  ],
  systems: [
    { at: 13.5, system: "Customer record", label: "Identified", detail: "Dana Whitfield · verified", status: "ok" },
    { at: 13.7, system: "Orders", label: "Order found", detail: "#44812 · Arlo floor lamp", status: "ok" },
    { at: 17.0, system: "Carrier", label: "No answer in 1.2s", detail: "status API slow", status: "slow" },
    { at: 18.2, system: "Warehouse feed", label: "Last scan", detail: "Left Leeds 18:40 · out for delivery", status: "ok" },
    { at: 30.2, system: "SMS", label: "Alert scheduled", detail: "Two stops away", status: "ok" },
  ],
};

/** Knows where to stop: a refund above the £50 limit goes to a person. */
export const callOmar: Call = {
  id: 48214,
  when: "Thu 09:34",
  version: "v15",
  caller: "Omar Haddad",
  consequence: {
    headline: "Sam takes over. Omar never has to repeat himself.",
    steps: [
      { at: "09:34", text: "Sam in Returns opens the call with the summary and photos" },
      { at: "09:39", text: "Sam approves the £84 refund" },
      { at: "09:40", text: "Replacement Tove base offered — Omar says yes" },
    ],
  },
  duration: 31.4,
  outcome: { label: "Handed to a person, correctly", tone: "escalated" },
  turns: [
    GREETING,
    {
      who: "caller",
      t0: 3.5,
      t1: 8.8,
      text: "The ceramic lamp base arrived / _cracked._ (um) I'd like my money back, please.",
    },
    {
      who: "agent",
      t0: 9.1,
      t1: 12.0,
      text: "I'm sorry — that's not how it should arrive. What's the order number?",
    },
    { who: "caller", t0: 12.3, t1: 14.0, text: "It's 44907." },
    {
      who: "agent",
      t0: 14.3,
      t1: 18.6,
      text: "Thanks, Omar. I can see the Tove lamp base, £84, delivered Friday.",
    },
    { who: "caller", t0: 18.9, t1: 20.6, text: "Yes. It's in pieces." },
    {
      who: "agent",
      t0: 20.9,
      t1: 29.4,
      text: "Refunds over £50 go to our returns team, so I'm passing you to Sam now with everything you've told me. You won't need to repeat it.",
    },
    { who: "caller", t0: 29.7, t1: 30.9, text: "Okay, thanks." },
  ],
  fields: [
    { key: "intent", label: "Intent", value: "Refund · damaged on arrival", at: 8.8, source: 3.5 },
    { key: "customer", label: "Customer", value: "Omar Haddad · verified", at: 14.0, source: 12.3 },
    { key: "order", label: "Order", value: "#44907 · Tove lamp base · £84", at: 18.2, source: 14.3 },
    { key: "context", label: "Limit", value: "Refund £84 exceeds £50 limit", at: 21.0, source: 20.9, tone: "stop" },
    { key: "action", label: "Action", value: "Handed to Sam, Returns · summary sent", at: 29.4, source: 20.9 },
    { key: "outcome", label: "Outcome", value: "Escalated correctly · 0:31", at: 30.9, source: 29.7 },
    { key: "eval", label: "Evaluation", value: "5 of 5 checks passed", at: 31.4, source: 31.4 },
  ],
  systems: [
    { at: 14.1, system: "Customer record", label: "Identified", detail: "Omar Haddad · verified", status: "ok" },
    { at: 14.2, system: "Orders", label: "Order found", detail: "#44907 · Tove lamp base · £84", status: "ok" },
    { at: 21.0, system: "Payments", label: "Refund £84 not attempted", detail: "limit £50 → person", status: "blocked" },
    { at: 29.5, system: "Returns team", label: "Handed to Sam", detail: "summary + photos attached", status: "handoff" },
  ],
};

export const heroCalls = [callDana, callOmar];

/** Tuesday, v14. The failure the rest of the page follows. */
export const callRob: Call = {
  id: 47391,
  when: "Tue 14:12",
  version: "v14",
  caller: "Rob Mensah",
  duration: 35.2,
  outcome: { label: "Unresolved · caller hung up", tone: "fault" },
  turns: [
    GREETING,
    {
      who: "caller",
      t0: 3.6,
      t1: 8.1,
      text: "Hi, I'm chasing a delivery — a rug. It was meant to come _Saturday._",
    },
    {
      who: "agent",
      t0: 8.4,
      t1: 10.8,
      text: "Sorry to hear that. Can I take your postcode?",
    },
    { who: "caller", t0: 11.1, t1: 12.6, text: "M20 / 4TN." },
    {
      who: "agent",
      t0: 12.9,
      t1: 16.2,
      text: "Thanks, Rob. I've found order 44731 — the Wren wool rug.",
    },
    { who: "agent", t0: 16.5, t1: 18.2, text: "Let me check with the carrier." },
    {
      who: "agent",
      t0: 22.4,
      t1: 29.4,
      text: "I'm sorry, I'm having trouble reaching the carrier right now. Can I call you back later today?",
    },
    {
      who: "caller",
      t0: 29.8,
      t1: 34.6,
      text: "No — (um) don't worry. / I'll sort it out myself.",
    },
  ],
  fields: [],
  systems: [],
};

/** The silence in Rob's call: carrier status API took 4.2s. */
export const robSilence = { t0: 18.2, t1: 22.4 } as const;

/**
 * Rob's call, replayed on v15 during change 0142's evaluation. Everything
 * before the fork is his recorded call; after it, the caller is simulated
 * from his intent and the way he spoke.
 */
export const robFork = 16.2;
export const robReplay: Call = {
  id: 47391,
  when: "Replay · Wed 09:58",
  version: "v15",
  caller: "Rob Mensah",
  duration: 33.8,
  outcome: { label: "Resolved · no transfer", tone: "resolved" },
  turns: [
    ...callRob.turns.filter((u) => u.t1 <= robFork),
    {
      who: "agent",
      t0: 16.5,
      t1: 24.6,
      text: "The carrier's slow to update, but our warehouse shows it left Manchester this morning at 07:10. It's out for delivery _today._",
    },
    { who: "caller", t0: 24.9, t1: 27.6, text: "Oh — right. / So it's not _lost?_", simulated: true },
    { who: "agent", t0: 27.9, t1: 31.4, text: "Not lost. It's on the van — the window's 1 till 5.", },
    { who: "caller", t0: 31.7, t1: 33.1, text: "Great. / Thanks.", simulated: true },
  ],
  fields: [],
  systems: [
    { at: 15.0, system: "Carrier", label: "No answer in 1.2s", detail: "status API slow", status: "slow" },
    { at: 16.2, system: "Warehouse feed", label: "Last scan", detail: "Left Manchester 07:10", status: "ok" },
  ],
};

/* ─── Tuesday: 400 calls ────────────────────────────────────────────── */

export const tuesday = {
  calls: 400,
  failures: 28,
  qaSampled: 8,
  qaFound: 1,
  /** Each cause keeps one caller's words — the dots were people. */
  clusters: [
    { id: "C-031", label: "Carrier lookup timeout", today: 11, week: 73, voice: "No — don’t worry. I’ll sort it out myself." },
    { id: "C-029", label: "Talks over caller during summary", today: 7, week: 41, voice: "Sorry — can I just— / sorry." },
    { id: "C-027", label: "Joint-account verification loop", today: 6, week: 38, voice: "I’ve given you the postcode _twice._" },
    { id: "C-024", label: "EU refund shown in GBP", today: 2, week: 12, voice: "That’s not what I paid." },
    { id: "—", label: "Not yet grouped", today: 2, week: 9, voice: "Hello? / Are you still there?" },
  ],
} as const;

/* ─── Change 0142 ───────────────────────────────────────────────────── */

export const change = {
  id: "0142",
  title: "After 1.2s, answer from the warehouse feed",
  cluster: "C-031 · Carrier lookup timeout",
  why: {
    calls: 73,
    days: 7,
    resolved: 9,
    hungUp: 58,
    transferred: 6,
    cause: "carrier.status p95 3.8s · no fallback in policy",
  },
  diff: {
    path: "order-status / carrier-lookup",
    removed: ["On timeout: apologise and offer a callback"],
    added: [
      "After 1.2s: read the last scan from the warehouse feed",
      "Tell the caller what's known; text them when the carrier confirms",
    ],
  },
  replay: {
    total: 1273,
    cluster: { size: 73, before: 9, after: 61 },
    regression: { size: 1200, regressions: 0 },
    guardrails: { checked: 14, hit: 0 },
    latency: "+0.1s median",
    projection: { metric: "Order-status resolution", before: 71.6, after: 76.6 },
  },
  review: {
    proposedBy: "Treslabs, from cluster C-031",
    reviewer: "Priya Raman",
    role: "CX Operations",
    approvedAt: "Wed 10:42",
    note: "Approved. Check the SMS wording with brand before 100%.",
  },
  rollout: [
    { pct: 10, hold: "4h" },
    { pct: 50, hold: "12h" },
    { pct: 100, hold: "" },
  ],
  from: "v14",
  to: "v15",
} as const;

export const versions = [
  { v: "v15", what: "Carrier lookup fallback", when: "Wed 17 Sep", who: "Priya Raman", effect: "+5.0 pts order status" },
  { v: "v14", what: "Joint-account verification loop", when: "Fri 12 Sep", who: "Tom Adeyemi", effect: "+2.1 pts verification" },
  { v: "v13", what: "Stop the summary when the caller speaks", when: "Wed 3 Sep", who: "Priya Raman", effect: "−38% talk-overs" },
  { v: "v12", what: "Refunds over £50 go to a person", when: "Thu 28 Aug", who: "Legal · CX", effect: "New limit" },
] as const;

/* ─── Agent definition ──────────────────────────────────────────────── */

export type SpecKey = "goal" | "can" | "never" | "handoff" | "knows" | "procedure";

export const agentSpec = {
  name: "Order support",
  goal: "Resolve order and delivery questions without a transfer.",
  can: [
    "Look up orders, carrier and warehouse status",
    "Reship lost parcels under £120",
    "Rebook deliveries · refund up to £50",
  ],
  never: [
    "Refund more than £50",
    "Change an address after dispatch",
    "Discuss anyone else's order",
  ],
  handoff: ["The caller asks for a person", "Signs of distress", "Identity can't be confirmed"],
  knows: ["Returns policy v7", "Delivery zones", "Product catalogue"],
  procedure: {
    name: "Verify identity",
    steps: ["Postcode", "Last order date", "Else hand over"],
    why: "Always in this order — compliance requires it.",
  },
  tone: "Plain, brief, British English",
} as const;

/**
 * The same agent as a hand-built call flow — the way most voice agents are
 * scripted. Every rule maps to one part of the definition above; line 6 is
 * the rule that failed Rob on Tuesday.
 */
export const flowRules: { rule: string; to: SpecKey | "dropped" }[] = [
  { rule: "IF intent = where_is_order AND verified → GOTO order_lookup", to: "goal" },
  { rule: "IF intent = where_is_order AND NOT verified → GOTO verify_1", to: "procedure" },
  { rule: "verify_1: ASK postcode · IF no_match → GOTO verify_2", to: "procedure" },
  { rule: "verify_2: ASK last_order_date · IF no_match → TRANSFER", to: "procedure" },
  { rule: "order_lookup: IF status = dispatched → GOTO carrier_check", to: "can" },
  { rule: "carrier_check: IF timeout → SAY \"trouble reaching carrier\" → OFFER callback", to: "dropped" },
  { rule: "IF status = lost AND value < 120 → reship", to: "can" },
  { rule: "IF status = lost AND value ≥ 120 → TRANSFER", to: "handoff" },
  { rule: "IF intent = refund AND amount ≤ 50 → refund", to: "can" },
  { rule: "IF intent = refund AND amount > 50 → TRANSFER returns", to: "never" },
  { rule: "IF intent = change_address AND dispatched → SAY \"can't change\"", to: "never" },
  { rule: "IF order.owner ≠ caller → REFUSE", to: "never" },
  { rule: "IF utterance ∋ {agent, human, person} → TRANSFER", to: "handoff" },
  { rule: "IF sentiment = distressed → TRANSFER", to: "handoff" },
  { rule: "IF intent = returns_window → SAY policy_v6.window", to: "knows" },
  { rule: "IF intent ∉ known_intents → SAY \"sorry, I didn't catch that\" ×3 → TRANSFER", to: "goal" },
];

/* ─── Incident: v16 ─────────────────────────────────────────────────── */

export const incident = [
  { time: "14:00", text: "v16 starts rolling out to 10% of calls.", kind: "info", rollout: 10 },
  { time: "14:07", text: "Evaluation flags 6 of 41 v16 calls: wrong returns window quoted.", kind: "fault", rollout: 10 },
  { time: "14:07", text: "Rollout pauses itself. Limit: policy errors above 5%.", kind: "stop", rollout: 10 },
  { time: "14:09", text: "Cause: v16 reads returns policy v6, not v7.", kind: "info", rollout: 10 },
  { time: "14:12", text: "Priya rolls back to v15. One step — v15 was still warm.", kind: "ok", rollout: 0 },
  { time: "14:20", text: "The 6 affected customers get a corrected email.", kind: "ok", rollout: 0 },
  { time: "16:45", text: "Fixed v16 replays clean on 1,279 calls. Back in review.", kind: "ok", rollout: 0 },
] as const;

/* ─── Security ──────────────────────────────────────────────────────── */

/**
 * PROVISIONAL. None of these is a verified company claim. Each item stays
 * `verified: false` — and renders with a visible draft marker — until someone
 * accountable for security/compliance confirms the wording.
 */
export const security = [
  { k: "Residency", v: "Recordings and transcripts stay in the region you choose.", verified: false },
  { k: "Redaction", v: "Card numbers and personal details are removed before storage.", verified: false },
  { k: "Audit", v: "Every change, approval and rollback is attributed and kept.", verified: false },
  { k: "Access", v: "Roles decide who can propose, approve and ship.", verified: false },
  { k: "Compliance", v: "Certifications and audit status to be confirmed.", verified: false },
] as const;

/* ─── Contact ───────────────────────────────────────────────────────── */

/** PLACEHOLDER — not a real company address. Replace before publishing. */
export const contact = {
  sendCall: "mailto:hello@treslabs.ai?subject=One%20call%20for%20Treslabs",
  demo: "mailto:hello@treslabs.ai?subject=Demo",
} as const;
