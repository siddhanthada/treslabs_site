import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { ScrollTop } from "@/components/site/ScrollTop";

const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Treslabs — Voice agents that get better in production",
  description:
    "Treslabs runs your voice agents, evaluates every call, and turns what went wrong into tested changes your team approves.",
};

export const viewport: Viewport = {
  themeColor: "#f6f6f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next turns smooth scrolling off while it changes pages,
    // so a new page opens at the top instead of gliding there from the old scroll position.
    <html lang="en-GB" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        {/* one nav for every page, so it can animate as the page changes */}
        <Nav />
        {children}
        <ScrollTop />
      </body>
    </html>
  );
}
