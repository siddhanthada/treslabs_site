"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { contact } from "@/content/scenario";
import { Button } from "@/components/site/Button";
import { SignalField, PHASES } from "./SignalField";

/**
 * One idea: production as a living signal that gets better.
 * The detail — calls, records, replays — starts in the next section.
 */
export function Hero() {
  const [phase, setPhase] = useState(0);
  return (
    <section
      id="top"
      data-nav="dark"
      className="relative flex min-h-svh flex-col overflow-hidden bg-carbon pt-[var(--nav-h)] text-on-carbon"
    >
      <SignalField onPhase={setPhase} />

      <div className="wrap relative grid flex-1 items-center py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="t-display max-w-[11ch] !text-[clamp(46px,6.3vw,100px)]">
            Voice agents that get better in production.
          </h1>
          <p className="t-lead mt-7 max-w-[26rem] text-on-carbon-2">
            Every call is evaluated. What goes wrong becomes a tested change your team approves.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={contact.sendCall} variant="bone" arrow>
              Send us a call
            </Button>
            <Button href={contact.demo} variant="ghost-dark">
              Book a demo
            </Button>
          </div>
        </div>
      </div>

      <div className="wrap relative pb-10">
        <ol className="t-label flex justify-end gap-8" aria-label="Production, detection, intelligence, improvement">
          {PHASES.map((p, i) => (
            <li key={p} className="flex items-center gap-2.5">
              <motion.span
                className="h-[5px] w-[5px] rounded-full"
                animate={{
                  backgroundColor: i === phase ? (i === 3 ? "#8c8cff" : "#eef0fa") : "rgba(238,240,250,0.2)",
                  scale: i === phase ? 1.3 : 1,
                }}
                transition={{ type: "spring", stiffness: 165, damping: 17.5 }}
              />
              <motion.span animate={{ color: i === phase ? "#eef0fa" : "#6b6f96" }} transition={{ duration: 0.5 }}>
                {p}
              </motion.span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
