"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, ChartNoAxesColumnIncreasing, Map, Menu, PanelsTopLeft, Store, X } from "lucide-react";
import { Logo } from "@/components/logo";

const navigation = [
  { label: "Campaigns", href: "/#campaigns", icon: PanelsTopLeft },
  { label: "Leaderboard", href: "/#leaderboard", icon: ChartNoAxesColumnIncreasing },
  { label: "Launch", href: "/campaigns/create", icon: BriefcaseBusiness },
  { label: "Roadmap", href: "/#roadmap", icon: Map },
  { label: "Marketplace", href: "/marketplace", icon: Store },
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
        scrolled ? "border-b border-white/10 bg-[#07111b]/90 backdrop-blur-2xl" : "bg-transparent"
      }`}
    >
      <div className="site-shell flex h-20 items-center justify-between">
        <Logo href="/" />

        <nav className="hidden h-full items-stretch text-[0.72rem] font-semibold text-white/55 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
            <a
              key={item.href}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex min-w-[76px] flex-col items-center justify-center gap-1 border-b-2 border-transparent px-2 transition hover:border-[#46a2fa] hover:text-white"
            >
              <Icon className="h-[1.15rem] w-[1.15rem] transition group-hover:text-[#69adf0]" aria-hidden="true" />
              {item.label}
            </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={buyUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-[#69adf0] px-4 py-2 text-sm font-extrabold text-[#8ac5ff] transition hover:bg-[#0a66c2]/15 sm:inline-flex"
          >
            Buy $POW
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white lg:hidden"
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
            className="border-t border-white/10 bg-[#07111b]/95 px-4 pb-5 pt-3 backdrop-blur-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="site-shell grid gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon className="h-5 w-5 text-[#69adf0]" aria-hidden="true" />
                  {item.label}
                </a>
                );
              })}
              <a
                href={buyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0a66c2] px-4 text-sm font-extrabold text-white"
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
