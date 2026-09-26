"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/brand/Logo";
import { ease } from "@/lib/motion";

export const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#improve", label: "Improvement" },
  { href: "#actions", label: "Actions" },
  { href: "#every-call", label: "Why Treslabs" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 8);
      // Take the tone of whatever section sits under the nav.
      const y = 32;
      const under = [...document.querySelectorAll<HTMLElement>("[data-nav='dark']")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom >= y;
      });
      setDark(under);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] backdrop-blur-[5.4px] transition-[background-color,box-shadow,color] duration-500 ${
        dark ? "bg-carbon/80 text-on-carbon" : "bg-bone/92 text-ink"
      } ${scrolled ? (dark ? "shadow-[0_1px_0_var(--color-carbon-line)]" : "shadow-[0_1px_0_var(--color-line)]") : ""}`}
    >
      <nav className="wrap flex h-full items-center justify-between" aria-label="Main">
        <a href="#top" aria-label="Treslabs home" className="-m-2 p-2">
          <Logo intro tone={dark ? "bone" : "ink"} />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-[13.05px] transition-colors ${dark ? "text-on-carbon-2 hover:text-on-carbon" : "text-ink-2 hover:text-ink"}`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="#contact" className="btn btn-lime hidden !h-[34.2px] !px-4 !text-[12.6px] md:inline-flex">
            Book a demo
          </a>
          <button
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`absolute h-[1.35px] w-[16.2px] bg-ink transition-transform duration-300 ${
                open ? "rotate-45" : "-translate-y-[3.6px]"
              }`}
            />
            <span
              className={`absolute h-[1.35px] w-[16.2px] bg-ink transition-transform duration-300 ${
                open ? "-rotate-45" : "translate-y-[3.6px]"
              }`}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] bg-bone md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="wrap flex flex-col pt-6">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: ease.out, delay: 0.04 * i }}
                  className="border-b border-line"
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between py-5 text-[27px] tracking-[-0.03em]"
                  >
                    {l.label}
                    <span className="t-label text-ink-3">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="wrap mt-8">
              <a href="#contact" onClick={() => setOpen(false)} className="btn btn-ink w-full">
                Book a demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
