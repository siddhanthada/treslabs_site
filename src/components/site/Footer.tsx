import { Logo } from "@/components/brand/Logo";

const cols = [
  { h: "Platform", l: ["Evaluation", "Improvement", "Actions", "Agent definitions"] },
  { h: "Company", l: ["About", "Careers", "Contact"] },
  { h: "Trust", l: ["Security", "Privacy", "Status"] },
];

export function Footer() {
  return (
    <footer data-nav="dark" className="bg-carbon text-on-carbon">
      <div className="wrap border-t border-carbon-line pb-10 pt-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo tone="bone" />
            <p className="mt-5 max-w-[30ch] text-[14.5px] leading-[1.5] text-on-carbon-2">
              Voice agents that get better in production.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h} className="md:col-span-2">
              <div className="t-label text-on-carbon-3">{c.h}</div>
              <ul className="mt-4 space-y-2.5">
                {c.l.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14.5px] text-on-carbon-2 transition-colors hover:text-on-carbon">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="t-label mt-16 flex flex-col gap-2 text-on-carbon-3 md:flex-row md:justify-between">
          <span>© 2026 Treslabs</span>
          <span className="max-w-[70ch]">
            Harrow &amp; Finch, its callers, staff and every number on this page are fictional,
            used to show how Treslabs works.
          </span>
        </div>
      </div>
    </footer>
  );
}
