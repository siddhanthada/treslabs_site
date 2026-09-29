import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/* PLACEHOLDER links (#) are pages that don't exist yet. */
const cols = [
  {
    h: "Product",
    l: [
      { t: "How it works", href: "/#how" },
      { t: "Goals and guardrails", href: "/#guardrails" },
      { t: "Evaluation", href: "/#every-call" },
      { t: "When AI goes wrong", href: "/#incidents" },
      { t: "Security", href: "/#security" },
    ],
  },
  {
    h: "Company",
    l: [
      { t: "Manifesto", href: "/blog/todays-calls-are-tomorrows-tests" },
      { t: "Writing", href: "/blog" },
      { t: "Early access", href: "/#partners" },
      { t: "Careers", href: "#" },
      { t: "Contact", href: "mailto:hello@treslabs.ai" },
    ],
  },
  {
    h: "Legal",
    l: [
      { t: "Privacy", href: "#" },
      { t: "Terms", href: "#" },
      { t: "Subprocessors", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer data-nav="dark" className="bg-carbon text-on-carbon">
      <div className="wrap pb-8">
        <div className="border-t border-carbon-line pt-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Logo tone="bone" />
              <p className="mt-5 max-w-[30ch] text-[13.05px] leading-[1.5] text-on-carbon-2">
                Voice agents that get better in production.
              </p>
              <div className="mt-6 inline-flex items-center gap-2.5 text-[12.15px] text-on-carbon-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-lime/60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-lime" />
                </span>
                Private beta · taking on early customers
              </div>
            </div>
            {cols.map((c, i) => (
              <div key={c.h} className={`md:col-span-2 ${i === 0 ? "md:col-start-7" : ""}`}>
                <div className="t-label text-on-carbon-3">{c.h}</div>
                <ul className="mt-4 space-y-2.5">
                  {c.l.map((l) => (
                    <li key={l.t}>
                      <Link href={l.href} className="text-[13.05px] text-on-carbon-2 transition-colors hover:text-on-carbon">
                        {l.t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="t-label mt-10 flex flex-col gap-2 text-on-carbon-3 md:flex-row md:justify-between">
            <span>© 2026 Treslabs</span>
            <span className="max-w-[70ch]">Examples use Harrow &amp; Finch, a fictional retailer, to show how Treslabs works.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
