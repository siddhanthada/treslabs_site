import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { Sampling } from "@/components/home/Sampling";
import { Loop } from "@/components/home/Loop";
import { Guardrails } from "@/components/home/Guardrails";
import { Scenarios } from "@/components/home/Scenarios";
import { FailureToFix } from "@/components/home/FailureToFix";
import { Incident } from "@/components/home/Incident";
import { Security } from "@/components/home/Security";
import { Partners } from "@/components/home/Partners";
import { Writing } from "@/components/home/Writing";
import { CTA } from "@/components/home/CTA";

/*
  The story, in order: a live call and its trace → why today's agents stall →
  the loop → how you define an agent (goals and guardrails) → hear it, or
  call it → one failure becomes a fix, and the caller it helps → what happens
  when it goes wrong → security → build it with us, and who "us" is → writing.
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
        <FailureToFix />
        <Incident />
        <Security />
        <Partners />
        <Writing />
      </main>
      {/* The last screen is exactly the call to action + footer; the nav sits over its dark top. */}
      <div className="flex min-h-svh flex-col bg-carbon">
        <CTA />
        <Footer />
      </div>
    </>
  );
}
