"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Why POW", href: "#why-pow" },
  { label: "Marketplace (Beta)", href: "/marketplace" },
  { label: "FAQ", href: "#faq" }
];

const buyUrl = process.env.NEXT_PUBLIC_BUY_URL || "https://pump.fun";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled ? "border-b border-white/10 bg-[#05070c]/80 backdrop-blur-2xl" : "bg-transparent"
      }`}
    >
      <div className="site-shell flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/60 md:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={buyUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-extrabold text-[#05070c] transition hover:bg-[#dce8ff] sm:inline-flex"
          >
            Buy $POW
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-t border-white/10 bg-[#05070c]/95 px-4 pb-5 pt-3 backdrop-blur-2xl md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="site-shell grid gap-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={buyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-extrabold text-[#05070c]"
              >
                Buy $POW
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
