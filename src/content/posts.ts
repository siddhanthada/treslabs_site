/**
 * Blog posts. DEMO CONTENT: authors, dates and any figures are placeholders
 * until real posts are written. Covers are Unsplash (free licence), shown as
 * real photos with a small pixel signature, per the brand's editorial rule.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "quote"; text: string; by?: string }
  | { type: "callout"; title: string; text: string }
  | { type: "stats"; items: { v: string; k: string }[] }
  | { type: "list"; items: string[] }
  | { type: "transcript"; lines: { who: "caller" | "agent" | "system"; text: string }[] };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  category: "Manifesto" | "Evaluation" | "Operations" | "Product" | "Engineering" | "Design";
  date: string; // ISO
  minutes: number;
  author: { name: string; role: string };
  cover: { src: string; alt: string };
  featured?: boolean;
  body: Block[];
};

const u = (id: string) => `https://images.unsplash.com/${id}`;

export const posts: Post[] = [
  {
    slug: "todays-calls-are-tomorrows-tests",
    title: "Today’s calls are tomorrow’s tests",
    dek: "A production conversation shouldn’t disappear into a dashboard. It should become evidence for what the agent does better next. Why we’re building Treslabs.",
    category: "Manifesto",
    date: "2026-09-22",
    minutes: 7,
    author: { name: "The Treslabs team", role: "Founders" },
    cover: { src: u("photo-1626863905121-3b0c0ed7b94c"), alt: "Two customer service agents with headsets in a bright office" },
    featured: true,
    body: [
      {
        type: "p",
        text: "Every voice agent that goes live starts getting worse the same day. Not because the model degrades, but because the world moves: a carrier changes its API, a returns policy gets a new version, a caller asks the question nobody wrote a flow for. The agent keeps answering. Nobody is listening.",
      },
      {
        type: "p",
        text: "Most teams find out the way they always have: a complaint, a spike in transfers, a QA analyst who happened to pick the right call out of a thousand. By then the same failure has happened dozens of times.",
      },
      { type: "h2", text: "Analytics is where calls go to die", id: "analytics" },
      {
        type: "p",
        text: "The industry’s answer has been more dashboards. Resolution rate, average handle time, containment. They tell you something went wrong in aggregate. They rarely tell you which step broke, on which calls, and what to change — and they never close the loop by themselves.",
      },
      {
        type: "transcript",
        lines: [
          { who: "caller", text: "Hi — my rug was meant to come Saturday, and the tracking hasn’t moved." },
          { who: "system", text: "Carrier API · no answer in 1.2s" },
          { who: "agent", text: "I’m sorry, I can’t see an update right now. Would you like a callback?" },
          { who: "caller", text: "No — don’t worry. I’ll sort it out myself." },
        ],
      },
      {
        type: "p",
        text: "That call scores as ‘contained’ on most dashboards. The caller hung up without a transfer. In reality it was a failure, and the answer was sitting in the warehouse feed the whole time.",
      },
      { type: "h2", text: "The loop, closed", id: "loop" },
      {
        type: "p",
        text: "Treslabs treats every production conversation as evidence. Each call is evaluated the moment it ends — was it resolved, was policy followed, was the caller verified, did a tool fail, did silence cost us. Failures are grouped by cause, not by symptom.",
      },
      {
        type: "stats",
        items: [
          { v: "1", k: "call flagged" },
          { v: "73", k: "calls, same step" },
          { v: "1,273", k: "calls replayed" },
          { v: "0", k: "regressions" },
        ],
      },
      {
        type: "p",
        text: "From a cause we propose a change — in plain language, not a prompt diff — and replay it against the real calls that revealed the problem, plus a regression set of calls that already worked. Only then does a person see it.",
      },
      { type: "quote", text: "The lifecycle itself isn’t the differentiator. How tightly the loop closes is." },
      { type: "h2", text: "Why a person still says yes", id: "approval" },
      {
        type: "p",
        text: "We don’t believe in agents that quietly rewrite themselves. Every change carries its evidence: why it was proposed, what exactly changes, which calls revealed it, how many were replayed, whether a guardrail triggered, which KPI moved, and who approved it. Improvement you can audit, not magic.",
      },
      {
        type: "callout",
        title: "Autonomy, under policy",
        text: "Over time, low-risk changes can ship on their own — but only inside rules you set, and always explained after the fact.",
      },
      { type: "h2", text: "What we’re building", id: "building" },
      {
        type: "list",
        items: [
          "Agents defined by goals and guardrails, with explicit procedures only where order matters.",
          "Agents that act in your real systems — and know where their authority ends.",
          "Evaluation of every conversation, not a sample.",
          "Changes replayed on your history before anyone hears them.",
          "Rollouts that pause themselves, and rollbacks that take one step.",
        ],
      },
      {
        type: "p",
        text: "We’re building it with a small group of design partners before launch. If your team lives with a voice line that should be getting better, we’d like to hear one of your calls.",
      },
    ],
  },
  {
    slug: "the-two-hours-after-ai-goes-wrong",
    title: "The two hours after AI goes wrong",
    dek: "Reliability isn’t a promise that nothing breaks. It’s how fast you see it, how few callers it reaches, and how cleanly you get back.",
    category: "Operations",
    date: "2026-09-15",
    minutes: 5,
    author: { name: "The Treslabs team", role: "Engineering" },
    cover: { src: u("photo-1766066014237-00645c74e9c6"), alt: "A row of customer service agents wearing headsets at their desks" },
    body: [
      {
        type: "p",
        text: "Every enterprise buyer asks some version of the same question: what happens when it goes wrong? The honest answer is not ‘it won’t’. It’s a timeline.",
      },
      { type: "h2", text: "A Tuesday afternoon", id: "tuesday" },
      {
        type: "transcript",
        lines: [
          { who: "system", text: "14:00 · v16 starts rolling out to 10% of calls" },
          { who: "system", text: "14:07 · 6 of 41 calls quote the wrong returns window" },
          { who: "system", text: "14:07 · Rollout pauses itself — policy errors above 5%" },
          { who: "system", text: "14:12 · Rolled back to v15 in one step" },
          { who: "system", text: "14:20 · 6 affected customers receive a correction" },
        ],
      },
      {
        type: "p",
        text: "Nobody was paged to make those decisions. The limit made the first one; a person made the second, with the cause already in front of them.",
      },
      { type: "h2", text: "Four rules we build to", id: "rules" },
      {
        type: "list",
        items: [
          "Roll out gradually, and watch every call on the new version.",
          "Limits pause rollouts, not people.",
          "Keep the previous version warm, so rollback is one step.",
          "Find the customers it touched, and put it right.",
        ],
      },
      { type: "quote", text: "A fixed version is replayed before it’s allowed to try again." },
      {
        type: "p",
        text: "That last rule is the one that matters most. The fix for v16 was replayed on 1,279 real calls before it went back into review. The failure became a test; the test now runs on every build.",
      },
    ],
  },
  {
    slug: "why-we-evaluate-every-call",
    title: "Why we evaluate every call, not a sample",
    dek: "540 calls on a Tuesday. 36 went wrong. A 2% QA sample finds one of them. The maths of listening, and what changes when you listen to everything.",
    category: "Evaluation",
    date: "2026-09-08",
    minutes: 4,
    author: { name: "The Treslabs team", role: "Product" },
    cover: { src: u("photo-1560264280-88b68371db39"), alt: "A large open-plan office with rows of desks" },
    body: [
      {
        type: "p",
        text: "Manual QA was designed for human agents, where listening to 2% of calls told you something about the person. For AI agents, the 98% you didn’t hear is where the patterns live.",
      },
      {
        type: "stats",
        items: [
          { v: "540", k: "calls" },
          { v: "36", k: "went wrong" },
          { v: "2%", k: "sampled" },
          { v: "1", k: "found" },
        ],
      },
      { type: "h2", text: "What a check is", id: "checks" },
      {
        type: "p",
        text: "A check is one pass/fail question asked of a finished call. Was the issue resolved? Was the caller verified before anything was changed? Did the agent talk over them? Did a tool fail, and did the agent recover? Did it hand over when it should have?",
      },
      {
        type: "callout",
        title: "Checks come from your goals",
        text: "The goal and guardrails you define for an agent become the checks it’s evaluated against. Nothing to maintain twice.",
      },
      { type: "h2", text: "Causes, not symptoms", id: "causes" },
      {
        type: "p",
        text: "Thirty-six failures are rarely thirty-six problems. Grouped by the step where they broke, they’re usually three or four. That’s the difference between a report and a to-do list.",
      },
    ],
  },
  {
    slug: "goals-and-guardrails-not-flowcharts",
    title: "Goals and guardrails, not flowcharts",
    dek: "Teams shouldn’t have to draw every branch of a conversation. Tell the agent what to achieve and where to stop — and spell out steps only where order matters.",
    category: "Product",
    date: "2026-09-01",
    minutes: 5,
    author: { name: "The Treslabs team", role: "Product" },
    cover: { src: u("photo-1608610026254-da1c4f08ce9d"), alt: "Hands dialling a black rotary telephone" },
    body: [
      {
        type: "p",
        text: "Conversation trees were built for IVRs, where callers pressed buttons. People don’t follow branches. They interrupt, change their mind, and ask two things at once.",
      },
      { type: "h2", text: "The four things you define", id: "define" },
      {
        type: "list",
        items: [
          "The goal: the outcome the agent should achieve.",
          "Capabilities: what it may do, in which systems.",
          "Guardrails: what it must never do, and its limits of authority.",
          "Handovers: when a person takes over, with full context.",
        ],
      },
      { type: "quote", text: "It does the work. And it knows where to stop." },
      {
        type: "p",
        text: "Procedures still exist — a first notice of loss, a card freeze — where the order genuinely matters. They’re the exception, not the structure.",
      },
    ],
  },
  {
    slug: "what-test-calls-taught-us-about-silence",
    title: "What our test calls taught us about silence",
    dek: "Callers forgive a lot. They don’t forgive four seconds of nothing. Notes from our test calls on pauses, interruptions and what ‘fast enough’ feels like.",
    category: "Engineering",
    date: "2026-08-25",
    minutes: 4,
    author: { name: "The Treslabs team", role: "Engineering" },
    cover: { src: u("photo-1553775282-20af80779df7"), alt: "A headset beside a laptop" },
    body: [
      {
        type: "p",
        text: "We put every new version through real phone calls before anyone else hears it. The single strongest predictor of a caller giving up wasn’t a wrong answer. It was silence while a system was slow.",
      },
      { type: "h2", text: "Fill the gap honestly", id: "gap" },
      {
        type: "p",
        text: "The fix wasn’t to talk more. It was to fall back sooner — after 1.2 seconds, read the warehouse feed instead of waiting on the carrier — and to tell the caller what’s known.",
      },
      {
        type: "stats",
        items: [
          { v: "4.2s", k: "silence before hang-up" },
          { v: "1.2s", k: "new fallback limit" },
          { v: "−180ms", k: "median response" },
        ],
      },
    ],
  },
  {
    slug: "why-callers-speak-in-serif",
    title: "Why callers speak in serif",
    dek: "A small design note on the Treslabs system: people, the agent and the machine each get their own voice on the page.",
    category: "Design",
    date: "2026-08-18",
    minutes: 3,
    author: { name: "The Treslabs team", role: "Design" },
    cover: { src: u("photo-1520923642038-b4259acecbd7"), alt: "An orange rotary telephone on a wooden table" },
    body: [
      {
        type: "p",
        text: "On every Treslabs surface, who is speaking decides the typeface. Callers speak in Instrument Serif. The agent speaks in Instrument Sans. The system — labels, IDs, timestamps — speaks in IBM Plex Mono.",
      },
      {
        type: "transcript",
        lines: [
          { who: "caller", text: "My lamp was meant to come Monday." },
          { who: "agent", text: "It’s out for delivery — with you by six today." },
          { who: "system", text: "Warehouse · out for delivery · 6 of 6 checks" },
        ],
      },
      {
        type: "p",
        text: "It means you can read a transcript at a glance and always know whose words are whose — the person’s, the agent’s, or the evidence underneath.",
      },
    ],
  },
];

export const categories = ["All", "Manifesto", "Evaluation", "Operations", "Product", "Engineering", "Design"] as const;

export const bySlug = (slug: string) => posts.find((p) => p.slug === slug);

export const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
