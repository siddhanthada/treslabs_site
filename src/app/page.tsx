import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { Sampling } from "@/components/home/Sampling";
import { Loop } from "@/components/home/Loop";
import { FailureToFix } from "@/components/home/FailureToFix";
import { Human } from "@/components/home/Human";
import { Actions } from "@/components/home/Actions";
import { Capabilities } from "@/components/home/Capabilities";
import { CTA } from "@/components/home/CTA";
import { Scenarios } from "@/components/home/Scenarios";
import { Security } from "@/components/home/Security";

/* Dark hero → one light body → dark close. */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Sampling />
        <Loop />
        <Scenarios />
        <FailureToFix />
        <Human />
        <Actions />
        <Capabilities />
        <Security />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
