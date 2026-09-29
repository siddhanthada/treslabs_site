import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { Sampling } from "@/components/home/Sampling";
import { Loop } from "@/components/home/Loop";
import { Guardrails } from "@/components/home/Guardrails";
import { Scenarios } from "@/components/home/Scenarios";
import { FailureToFix } from "@/components/home/FailureToFix";
import { Human } from "@/components/home/Human";
import { Incident } from "@/components/home/Incident";
import { Try } from "@/components/home/Try";
import { Security } from "@/components/home/Security";
import { Partners } from "@/components/home/Partners";
import { Writing } from "@/components/home/Writing";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";

/*
  The story, in order: a live call → why today's agents stall → the loop →
  how you define an agent (goals and guardrails) → hear it → call it
  yourself → one failure becomes a fix → the person it helps → what happens
  when it goes wrong → security → build it with us → writing → questions.
  One light body, dark close.
*/
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Sampling />
        <Loop />
        <Guardrails />
        <Scenarios />
        <Try />
        <FailureToFix />
        <Human />
        <Incident />
        <Security />
        <Partners />
        <Writing />
        <FAQ />
      </main>
      {/* The last screen is exactly the call to action + footer; the nav sits over its dark top. */}
      <div className="flex min-h-svh flex-col bg-carbon">
        <CTA />
        <Footer />
      </div>
    </>
  );
}
