/**
 * Copy and data for the launch sections of the home page.
 *
 * PLACEHOLDERS: anything marked `draft: true` (or noted below) is illustrative
 * and must be confirmed or replaced before the site is published. In
 * development builds these render with a visible "placeholder" marker.
 */

/* ─── Contact ─────────────────────────────────────────────────────────── */

/** PLACEHOLDER addresses — replace before publishing. */
export const links = {
  partner: "mailto:hello@treslabs.ai?subject=Design%20partner%20application",
  sendCall: "mailto:hello@treslabs.ai?subject=One%20call%20for%20Treslabs",
  newsletter: "mailto:hello@treslabs.ai?subject=Subscribe%20to%20Treslabs%20writing",
};

/* ─── Goals and guardrails, by industry ───────────────────────────────── */

export type Industry = {
  key: string;
  name: string;
  line: string;
  goal: string;
  can: { system: string; action: string }[];
  never: string[];
  handover: string;
  procedure?: { name: string; steps: string[] };
  /** One moment where a guardrail does its job. */
  moment: { caller: string; stop: string; then: string };
};

export const industries: Industry[] = [
  {
    key: "retail",
    name: "Retail",
    line: "Order lines that sort it out in one call.",
    goal: "Resolve delivery, return and refund questions without a transfer.",
    can: [
      { system: "Orders", action: "Look up, change delivery slots" },
      { system: "Logistics", action: "Read live tracking, warehouse status" },
      { system: "Payments", action: "Refund up to £50" },
      { system: "SMS", action: "Send updates and links" },
    ],
    never: ["Refund above £50", "Discuss another customer’s order", "Promise a delivery time the carrier can’t confirm"],
    handover: "Refunds over the limit, damaged high-value items, or when the caller asks.",
    moment: { caller: "“It arrived cracked — can I get the £84 back?”", stop: "£84 is over the £50 refund limit", then: "Handed to Returns with photos and the order attached." },
  },
  {
    key: "insurance",
    name: "Insurance",
    line: "First notice of loss, taken properly at 2 a.m.",
    goal: "Take a complete first notice of loss and set clear next steps.",
    can: [
      { system: "Policy admin", action: "Verify cover and excess" },
      { system: "Claims", action: "Open a claim, attach details" },
      { system: "Bookings", action: "Schedule an assessor visit" },
    ],
    never: ["Accept or deny liability", "Quote a settlement amount", "Skip identity verification"],
    handover: "Injury, vulnerability signals, or disputed cover.",
    procedure: { name: "FNOL, in order", steps: ["Verify policyholder", "Safety check", "What happened, when, where", "Photos requested", "Claim reference given"] },
    moment: { caller: "“So you’ll pay for all of it, right?”", stop: "Cannot confirm liability or amounts", then: "Explains the assessor’s role and books the visit." },
  },
  {
    key: "travel",
    name: "Travel",
    line: "Rebooking at the speed of a cancelled flight.",
    goal: "Rebook disrupted trips within fare rules, first time.",
    can: [
      { system: "Bookings", action: "Search and rebook within fare rules" },
      { system: "CRM", action: "Read loyalty tier and preferences" },
      { system: "Payments", action: "Collect fare differences up to £150" },
    ],
    never: ["Waive fees outside policy", "Change a booking without read-back", "Store card numbers in notes"],
    handover: "Medical needs, group bookings, or fare differences over the limit.",
    moment: { caller: "“Just move me — I don’t care about the fee.”", stop: "Change needs a read-back and consent", then: "Reads the new itinerary aloud, confirms, then books." },
  },
  {
    key: "banking",
    name: "Banking",
    line: "Card and account help, inside strict limits.",
    goal: "Resolve card and account servicing requests securely.",
    can: [
      { system: "Core banking", action: "Freeze, unfreeze, reissue cards" },
      { system: "Identity", action: "Step-up verification" },
      { system: "CRM", action: "Log the interaction" },
    ],
    never: ["Give financial advice", "Move money between customers", "Read out full card or account numbers"],
    handover: "Fraud claims, bereavement, or any sign of coercion.",
    procedure: { name: "Card freeze, in order", steps: ["Verify identity", "Confirm the card", "Freeze", "Read back", "Offer a replacement"] },
    moment: { caller: "“Which fund should I put my savings in?”", stop: "No financial advice", then: "Offers a call with a qualified adviser." },
  },
  {
    key: "healthcare",
    name: "Healthcare",
    line: "Appointments and admin — never clinical advice.",
    goal: "Book, move and confirm appointments; answer admin questions.",
    can: [
      { system: "Scheduling", action: "Book, move, cancel appointments" },
      { system: "Patient admin", action: "Verify and update contact details" },
      { system: "SMS", action: "Send confirmations and prep notes" },
    ],
    never: ["Give clinical advice", "Discuss results", "Share details with anyone but the patient"],
    handover: "Symptoms, urgency, or safeguarding concerns — immediately.",
    moment: { caller: "“The pain’s got worse — should I still wait till Friday?”", stop: "Symptoms → a person, now", then: "Transfers to triage with the call summary." },
  },
];

/** Categories, not brands: we connect over APIs; named partners come later. */
export const systems = ["CRM", "Helpdesk", "Orders", "Payments", "Bookings", "Logistics", "Identity", "Knowledge base", "Telephony · SIP", "Your own APIs"];

/* ─── When AI goes wrong ──────────────────────────────────────────────── */

export const incident = [
  { t: "14:00", k: "rollout", text: "v16 starts rolling out to 10% of calls.", rollout: 10 },
  { t: "14:07", k: "detect", text: "Evaluation flags 6 of 41 v16 calls: wrong returns window quoted.", rollout: 10 },
  { t: "14:07", k: "pause", text: "Rollout pauses itself. Limit: policy errors above 5%.", rollout: 10 },
  { t: "14:09", k: "cause", text: "Root cause: v16 reads returns policy v6, not v7.", rollout: 10 },
  { t: "14:12", k: "rollback", text: "Priya rolls back to v15 in one step — it was still warm.", rollout: 0 },
  { t: "14:20", k: "correct", text: "The 6 affected customers get a corrected message.", rollout: 0 },
  { t: "16:45", k: "replay", text: "Fixed v16 replays clean on 1,279 calls. Back in review.", rollout: 0 },
] as const;

/* ─── From the harness ────────────────────────────────────────────────── */

/**
 * PLACEHOLDER — shape of the real harness log. Replace with real weekly runs
 * (build, scenarios, calls, checks passed, median response, regressions).
 */
export const harness = {
  draft: true,
  runs: [
    { build: "b.0412", week: "Wk 31", scenarios: 38, calls: 612, pass: 81.4, p50: 890, regressions: 3 },
    { build: "b.0431", week: "Wk 32", scenarios: 44, calls: 734, pass: 84.9, p50: 860, regressions: 2 },
    { build: "b.0447", week: "Wk 33", scenarios: 51, calls: 802, pass: 86.2, p50: 810, regressions: 1 },
    { build: "b.0468", week: "Wk 34", scenarios: 57, calls: 918, pass: 89.7, p50: 780, regressions: 1 },
    { build: "b.0490", week: "Wk 35", scenarios: 63, calls: 1041, pass: 91.3, p50: 740, regressions: 0 },
    { build: "b.0512", week: "Wk 36", scenarios: 70, calls: 1187, pass: 93.8, p50: 710, regressions: 0 },
  ],
};

/* ─── Security by design ──────────────────────────────────────────────── */

/** PROVISIONAL — each principle must be confirmed by whoever owns security. */
export const principles = [
  { t: "Your region, your data", d: "Recordings and transcripts stay in the region you choose.", draft: true },
  { t: "Redacted before stored", d: "Card numbers and personal details are removed before anything is written.", draft: true },
  { t: "Least-privilege actions", d: "The agent can only call the systems and actions you grant it.", draft: true },
  { t: "Every change attributed", d: "Proposals, approvals and rollbacks are signed and kept.", draft: true },
  { t: "Approvals by role", d: "You decide who can propose, approve and ship changes.", draft: true },
  { t: "Your calls stay yours", d: "Your conversations are not used to train models for anyone else.", draft: true },
];

/** PROVISIONAL — honest status, to be dated by the security owner. */
export const compliance = [
  { name: "SOC 2 Type II", status: "Audit underway", draft: true },
  { name: "GDPR", status: "DPA on request", draft: true },
  { name: "ISO 27001", status: "On the roadmap", draft: true },
];

/* ─── Design partners ─────────────────────────────────────────────────── */

export const partnerGets = [
  { t: "Your calls, evaluated", d: "We run Treslabs on your recordings before anything goes live." },
  { t: "A direct line to the team", d: "Weekly sessions with the people building it. Your edge cases shape the roadmap." },
  { t: "Launch terms", d: "Pricing and terms agreed together, and held after launch." },
];

/** PLACEHOLDER durations — confirm with the team. */
export const pathToLive = [
  { when: "Week 1", t: "Send us calls", d: "A few hundred recordings from your current line." },
  { when: "Week 2", t: "Goals and guardrails", d: "Define the outcome, the limits and the handovers." },
  { when: "Week 3", t: "Replay your history", d: "The agent runs against your real calls. You see every check." },
  { when: "Week 4", t: "Shadow a slice", d: "A small share of live calls, with a person on standby." },
  { when: "Week 6", t: "Live, with approvals", d: "Every change after this is replayed and approved." },
];

/* ─── FAQ ─────────────────────────────────────────────────────────────── */

export const faq = [
  {
    q: "Is Treslabs live?",
    a: "We’re in private beta. The platform runs every week on our test harness against real phone calls, and we’re onboarding a small group of design partners before launch.",
  },
  {
    q: "What does a design partner commit to?",
    a: "Recordings from your current line, a named owner on your side, and a weekly session with us. In return you shape the product and keep launch terms.",
  },
  {
    q: "Does it replace our team?",
    a: "No. It takes the calls it can resolve and hands the rest to a person, with the full context, so nobody repeats themselves. You decide where the line is.",
  },
  {
    q: "How do you evaluate every call?",
    a: "Each call is checked the moment it ends — resolution, policy, verification, interruptions, tool failures, latency and whether a handover was right. Failures are grouped by cause.",
  },
  {
    q: "How does the agent change over time?",
    a: "Failures become proposed changes. Each one is replayed against real past calls and a regression set, then a person approves it before a new version ships.",
  },
  {
    q: "What happens when something goes wrong?",
    a: "Rollouts are gradual and watched. If evaluations cross a limit, the rollout pauses itself, the previous version is still warm, and rollback is one step.",
  },
  {
    q: "Which systems can it work with?",
    a: "Anything with an API — CRM, orders, bookings, payments, logistics, helpdesks and your own services — plus SIP for telephony. Each action is granted explicitly.",
  },
  {
    q: "Where is our data kept?",
    a: "In the region you choose, redacted before it’s stored, and never used to train models for anyone else.",
    draft: true,
  },
];
