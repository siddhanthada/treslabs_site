import type { Turn } from "./scenario";
import { callOmar } from "./scenario";

/**
 * Playable scenarios for the "hear it" section. Fictional callers for
 * Harrow & Finch; scripts use the same speech markup as scenario.ts.
 */

export type Act = { at: number; system: string; text: string; tone?: "ok" | "slow" | "stop" };

export type Scenario = {
  key: string;
  title: string;
  caller: string;
  person: "street" | "desk" | "walking" | "older";
  hard: string;
  duration: number;
  turns: Turn[];
  acts: Act[];
  outcome: { label: string; checks: string };
};

const GREETING: Turn = { who: "agent", t0: 0.3, t1: 2.8, text: "Harrow & Finch, order line. How can I help?" };

export const scenarios: Scenario[] = [
  {
    key: "order",
    title: "Where’s my order?",
    caller: "Marcus",
    person: "street",
    hard: "A carrier system that won’t answer",
    duration: 30.6,
    turns: [
      GREETING,
      { who: "caller", t0: 3.1, t1: 7.6, text: "Hi — my rug was meant to come _Saturday_, and the tracking hasn’t moved." },
      { who: "agent", t0: 7.9, t1: 10.2, text: "Sorry about that. Can I take your postcode?" },
      { who: "caller", t0: 10.5, t1: 11.9, text: "M20 / 4TN." },
      { who: "agent", t0: 12.2, t1: 15.4, text: "Thanks, Marcus. That’s order 44731 — the Wren wool rug." },
      {
        who: "agent",
        t0: 15.8,
        t1: 22.6,
        text: "The carrier’s slow to update, but our warehouse shows it left Manchester this morning. It’s out for delivery _today._",
      },
      { who: "caller", t0: 22.9, t1: 24.6, text: "Oh — right. / Great." },
      { who: "agent", t0: 24.9, t1: 28.8, text: "I’ll text you when it’s two stops away. Anything else?" },
      { who: "caller", t0: 29.1, t1: 30.3, text: "No, that’s it. Thanks." },
    ],
    acts: [
      { at: 11.9, system: "Customer record", text: "Caller verified" },
      { at: 12.1, system: "Orders", text: "#44731 · Wren wool rug" },
      { at: 14.2, system: "Carrier", text: "No answer in 1.2s — falling back", tone: "slow" },
      { at: 15.4, system: "Warehouse", text: "Out for delivery today" },
      { at: 27.6, system: "SMS", text: "Alert set · two stops away" },
    ],
    outcome: { label: "Resolved · no transfer", checks: "6 of 6 checks" },
  },
  {
    key: "refund",
    title: "A refund over the limit",
    caller: "Omar",
    person: "desk",
    hard: "Knowing where to stop",
    duration: callOmar.duration,
    turns: callOmar.turns,
    acts: [
      { at: 14.1, system: "Customer record", text: "Caller verified" },
      { at: 14.2, system: "Orders", text: "#44907 · Tove lamp base · £84" },
      { at: 21.0, system: "Guardrail", text: "£84 is over the £50 refund limit", tone: "stop" },
      { at: 29.5, system: "Returns team", text: "Handed to Sam · summary + photos" },
    ],
    outcome: { label: "Handed to a person, correctly", checks: "5 of 5 checks" },
  },
  {
    key: "rebook",
    title: "Moving a delivery",
    caller: "Theo",
    person: "walking",
    hard: "A caller who talks over the agent",
    duration: 24.2,
    turns: [
      GREETING,
      { who: "caller", t0: 3.1, t1: 6.9, text: "I need to move my delivery — I won’t be in on _Friday._" },
      { who: "agent", t0: 7.2, t1: 9.4, text: "No problem. Can I take your order number?" },
      { who: "caller", t0: 9.7, t1: 11.4, text: "It’s 45102." },
      {
        who: "agent",
        t0: 11.7,
        t1: 16.4,
        text: "Thanks, Theo. I can see the Hale sideboard. The next slots are Monday morning or Tuesday",
        cut: true,
      },
      { who: "caller", t0: 16.0, t1: 18.3, text: "Monday. / Monday morning’s _perfect._" },
      { who: "agent", t0: 18.6, t1: 22.4, text: "Done — Monday, 8 till 12. I’ve sent you a confirmation." },
      { who: "caller", t0: 22.7, t1: 23.9, text: "Brilliant, cheers." },
    ],
    acts: [
      { at: 11.5, system: "Orders", text: "#45102 · Hale sideboard" },
      { at: 12.0, system: "Bookings", text: "Slots: Mon AM · Tue PM" },
      { at: 16.1, system: "Conversation", text: "Caller spoke — agent yielded" },
      { at: 19.0, system: "Bookings", text: "Moved to Monday 8–12" },
      { at: 21.6, system: "Email", text: "Confirmation sent" },
    ],
    outcome: { label: "Rebooked · no transfer", checks: "5 of 5 checks" },
  },
  {
    key: "person",
    title: "“Can I speak to a person?”",
    caller: "Graham",
    person: "older",
    hard: "Someone else’s order, and a clear request",
    duration: 19.4,
    turns: [
      GREETING,
      {
        who: "caller",
        t0: 3.2,
        t1: 9.0,
        text: "Hello. / (um) I’d rather speak to a _person_, if that’s all right. It’s about my wife’s order.",
      },
      {
        who: "agent",
        t0: 9.3,
        t1: 14.1,
        text: "Of course. I’ll put you through to Jess now, and pass on what you’ve told me so far.",
      },
      { who: "caller", t0: 14.4, t1: 15.6, text: "Thank you, love." },
      { who: "agent", t0: 15.9, t1: 19.1, text: "You’re welcome. Connecting you now — about a minute." },
    ],
    acts: [
      { at: 9.0, system: "Policy", text: "Caller asked for a person" },
      { at: 9.2, system: "Guardrail", text: "Another customer’s order → person", tone: "stop" },
      { at: 14.0, system: "Handover", text: "Jess · summary attached" },
    ],
    outcome: { label: "Handed over, as asked", checks: "4 of 4 checks" },
  },
];
