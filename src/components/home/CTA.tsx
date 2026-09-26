import { Button } from "@/components/site/Button";
import { Reveal } from "@/components/site/Reveal";
import { contact } from "@/content/scenario";

export function CTA() {
  return (
    <section id="contact" data-nav="dark" className="flex flex-1 items-center bg-carbon text-on-carbon">
      {/* The nav overlaps this section, so its height is added on top; the text always starts below it. */}
      <div className="wrap pb-12 pt-[calc(var(--nav-h)+3rem)] text-center [@media(min-height:820px)]:pb-20 [@media(min-height:820px)]:pt-[calc(var(--nav-h)+5rem)]">
        <Reveal as="h2" className="mx-auto max-w-[14ch] text-[clamp(36px,4.86vw,68.4px)] font-[560] leading-[1] tracking-[-0.045em]">
          Send us one call. See what Treslabs finds.
        </Reveal>
        <Reveal as="p" className="mx-auto mt-6 max-w-[30rem] text-[16.2px] leading-[1.5] text-on-carbon-2" delay={0.08}>
          Share a recording from your current setup. We’ll show you what we’d flag, and what we’d change.
        </Reveal>
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3" delay={0.14}>
          <Button href={contact.sendCall} variant="lime" arrow>
            Send a recording
          </Button>
          <Button href={contact.demo} variant="ghost-dark">
            Book a demo
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
