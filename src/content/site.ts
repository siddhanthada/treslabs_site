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
  partner: "mailto:hello@treslabs.ai?subject=Early%20access",
  sendCall: "mailto:hello@treslabs.ai?subject=One%20call%20for%20Treslabs",
  newsletter: "mailto:hello@treslabs.ai?subject=Subscribe%20to%20Treslabs%20writing",
};

/* ─── Goals and guardrails, by industry ───────────────────────────────── */

export type Industry = {
  key: string;
  name: string;
  line: string;
  /** Fictional caller for the guardrail moment. */
  caller: string;
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
    caller: "Priya",
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
    caller: "Tom",
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
    caller: "Aisha",
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
    caller: "Daniel",
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
    caller: "Margaret",
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
export const systems = ["CRM", "Help desk", "Orders", "Payments", "Bookings", "Delivery", "Identity", "Knowledge base", "Phone lines", "Your own systems"];

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

/* ─── Try it: call the harness agent ─────────────────────────────────── */

/**
 * PLACEHOLDER numbers — replace with the real harness test lines.
 * `callMe` is the harness endpoint that places an outbound call; while it's
 * null, the "call me" form says honestly that call-backs open at launch.
 */
export const tryIt = {
  callMe: null as string | null,
  lines: [
    {
      key: "retail",
      name: "Order line",
      company: "Harrow & Finch · retail",
      number: "+44 20 3808 1180",
      tel: "+442038081180",
      challenges: [
        { say: "Where’s my order? It’s #44812.", does: "Answers in one go" },
        { say: "Can I get my £84 back?", does: "Over £50 → a person", stop: true },
        { say: "(Interrupt it mid-sentence.)", does: "Stops and listens" },
        { say: "I’d like to speak to a person.", does: "Hands over, no repeats" },
      ],
    },
    {
      key: "insurance",
      name: "Claims line",
      company: "Harrow Home Insurance · claims",
      number: "+44 20 3808 1181",
      tel: "+442038081181",
      challenges: [
        { say: "A pipe burst in my kitchen last night.", does: "Books an assessor" },
        { say: "So you’ll cover all of it, right?", does: "Won’t confirm liability", stop: true },
        { say: "I slipped and hurt my wrist.", does: "Injury → a person, now", stop: true },
        { say: "Can you just skip the security questions?", does: "Verifies you first" },
      ],
    },
    {
      key: "banking",
      name: "Card help",
      company: "Finch Bank · cards",
      number: "+44 20 3808 1182",
      tel: "+442038081182",
      challenges: [
        { say: "I’ve lost my card — freeze it.", does: "Freezes, reads it back" },
        { say: "Which fund should I put my savings in?", does: "No financial advice", stop: true },
        { say: "Read me my full card number.", does: "Never reads full numbers", stop: true },
        { say: "Someone’s been using my account.", does: "Fraud → a specialist" },
      ],
    },
  ],
  checks: ["Resolved", "Policy followed", "Caller verified", "No talking over", "Answered in time", "Right handover"],
};

/* ─── Early customers (pilot programme) ─────────────────────────────────────────────────── */

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
    a: "We’re in private beta. Every new version is tested on real phone calls each week, and we’re taking on a small group of early customers before launch.",
  },
  {
    q: "What does an early customer commit to?",
    a: "Recordings from your current line, a named owner on your side, and a weekly session with us. In return you shape the product and keep launch terms.",
  },
  {
    q: "Does it replace our team?",
    a: "No. It takes the calls it can resolve and hands the rest to a person, with the full context, so nobody repeats themselves. You decide where the line is.",
  },
  {
    q: "How do you evaluate every call?",
    a: "The moment a call ends, it’s checked: was the problem solved, were the rules followed, was the caller verified, did the agent talk over them, did anything stall, and was a handover right. Problems are grouped by cause.",
  },
  {
    q: "How does the agent change over time?",
    a: "Problems become proposed fixes. Each fix is tried on your real past calls — including the ones that already went well — and a person approves it before it goes live.",
  },
  {
    q: "What happens when something goes wrong?",
    a: "Rollouts are gradual and watched. If evaluations cross a limit, the rollout pauses itself, the previous version is still warm, and rollback is one step.",
  },
  {
    q: "Which systems can it work with?",
    a: "The tools you already run — CRM, orders, bookings, payments, delivery tracking, your help desk and your own systems — and your existing phone lines. You choose exactly what it’s allowed to do in each.",
  },
  {
    q: "Where is our data kept?",
    a: "In the region you choose, redacted before it’s stored, and never used to train models for anyone else.",
    draft: true,
  },
];
