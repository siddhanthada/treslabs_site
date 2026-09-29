import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { CTA } from "@/components/home/CTA";
import { Eyebrow } from "@/components/brand/Frame";
import { BlogIndex } from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Writing — Treslabs",
  description: "Notes from building Treslabs: evaluation, operations, guardrails and what we learn from every test call.",
};

export default function Blog() {
  return (
    <>
      <main className="pt-[var(--nav-h)]">
        <section className="wrap pb-24 pt-16 md:pb-32 md:pt-24">
          <div className="max-w-[760px]">
            <Eyebrow>Writing</Eyebrow>
            <h1 className="mt-5 text-[clamp(38px,5vw,68px)] font-[560] leading-[1] tracking-[-0.042em]">
              Notes from building Treslabs.
            </h1>
            <p className="mt-5 max-w-[34rem] text-[16.2px] leading-[1.5] text-ink-2">
              What we believe about voice agents, and what every test call teaches us.
            </p>
          </div>
          <BlogIndex />
        </section>
      </main>
      <div className="flex flex-col bg-carbon">
        <CTA />
        <Footer />
      </div>
    </>
  );
}
