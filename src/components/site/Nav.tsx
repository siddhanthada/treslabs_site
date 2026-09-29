"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ease } from "@/lib/motion";

export const navLinks = [
  { href: "/#how", label: "How it works" },
  { href: "/#guardrails", label: "Guardrails" },
  { href: "/#security", label: "Security" },
  { href: "/blog", label: "Writing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // The page opens on the light hero, so start light (starting dark flashed black on load).
  const [dark, setDark] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // While a nav click is scrolling the page, the nav stays put.
  const pinned = useRef(false);
  const pin = () => {
    pinned.current = true;
    setHidden(false);
    // Release once the smooth scroll has settled (no scroll events for a moment).
    let quiet = 0;
    const release = () => {
      pinned.current = false;
      window.clearTimeout(quiet);
      window.removeEventListener("scroll", wait);
    };
    const wait = () => {
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, 200);
    };
    window.addEventListener("scroll", wait, { passive: true });
    wait();
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const on = () => {
      const y0 = window.scrollY;
      setScrolled(y0 > 8);
      // Slide away while reading down; come back the moment the reader scrolls up.
      if (y0 < 120 || pinned.current) setHidden(false);
      else if (y0 > lastY + 4) setHidden(true);
      else if (y0 < lastY - 4) setHidden(false);
      if (Math.abs(y0 - lastY) > 4) lastY = y0;
      // Which section is being read.
      const mid = window.innerHeight * 0.4;
      const current = navLinks.find((l) => {
        const id = l.href.split("#")[1];
        const r = id ? document.getElementById(id)?.getBoundingClientRect() : undefined;
        return r && r.top <= mid && r.bottom > mid;
      });
      setActive(current?.href ?? (window.location.pathname.startsWith("/blog") ? "/blog" : null));
      // Take the tone of whatever section sits under the nav.
      const y = 32;
      const under = [
        ...document.querySelectorAll<HTMLElement>("[data-nav='dark']"),
      ].some((el) => {
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
    <motion.header
      initial={false}
      animate={{ y: hidden && !open ? "-100%" : "0%" }}
      transition={{
        duration: hidden && !open ? 0.35 : 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] backdrop-blur-[5.4px] transition-[background-color,box-shadow,color] duration-500 ${
        dark ? "bg-carbon/80 text-on-carbon" : "bg-bone/92 text-ink"
      } ${scrolled ? (dark ? "shadow-[0_1px_0_var(--color-carbon-line)]" : "shadow-[0_1px_0_var(--color-line)]") : ""}`}
    >
      <nav
        className="wrap flex h-full items-center justify-between"
        aria-label="Main"
      >
        <Link
          href="/"
          onClick={pin}
          aria-label="Treslabs home"
          className="-m-2 p-2"
        >
          <Logo intro tone={dark ? "bone" : "ink"} />
        </Link>

        <ul
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHover(null)}
        >
          {navLinks.map((l) => {
            const on = active === l.href;
            return (
              <li key={l.href} className="relative">
                <a
                  href={l.href}
                  onClick={pin}
                  onMouseEnter={() => setHover(l.href)}
                  onFocus={() => setHover(l.href)}
                  onBlur={() => setHover(null)}
                  aria-current={on ? "location" : undefined}
                  className={`relative isolate block rounded-[8px] px-3.5 py-2 text-[14.4px] transition-colors duration-200 ${
                    dark
                      ? on || hover === l.href
                        ? "text-on-carbon"
                        : "text-on-carbon-2"
                      : on || hover === l.href
                        ? "text-ink"
                        : "text-ink-2"
                  }`}
                >
                  {hover === l.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className={`absolute inset-0 -z-10 rounded-[8px] ${dark ? "bg-on-carbon/10" : "bg-ink/[0.055]"}`}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 40,
                      }}
                    />
                  )}
                  {l.label}
                </a>
                <AnimatePresence>
                  {on && (
                    <motion.span
                      layoutId="nav-active"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute -bottom-[7px] left-[calc(50%-3px)] h-[6px] w-[6px] rounded-[1.8px] bg-lime"
                      aria-hidden
                    />
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/#partners"
            onClick={pin}
            className="btn btn-lime hidden md:inline-flex"
          >
            Become a design partner
          </Link>
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
                  transition={{
                    duration: 0.5,
                    ease: ease.out,
                    delay: 0.04 * i,
                  }}
                  className="border-b border-line"
                >
                  <a
                    href={l.href}
                    onClick={() => {
                      pin();
                      setOpen(false);
                    }}
                    className="flex items-baseline justify-between py-5 text-[27px] tracking-[-0.03em]"
                  >
                    {l.label}
                    <span className="t-label text-ink-3">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="wrap mt-8">
              <Link
                href="/#partners"
                onClick={() => {
                  pin();
                  setOpen(false);
                }}
                className="btn btn-ink w-full"
              >
                Become a design partner
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
