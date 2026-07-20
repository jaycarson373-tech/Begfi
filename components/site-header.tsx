"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, Check, Copy, Home, Menu, Search, Trophy, UsersRound, WalletCards, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { powContractAddress, powDefaultBuyUrl, powXUrl } from "@/lib/pow-config";

const navigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "Work board", href: "/#campaigns", icon: BriefcaseBusiness },
  { label: "Workers", href: "/#leaderboard", icon: UsersRound },
  { label: "Payouts", href: "/#payouts", icon: WalletCards },
  { label: "Jobs", href: "/marketplace", icon: Trophy }
];

const buyUrl = process.env.NEXT_PUBLIC_BUY_URL || powDefaultBuyUrl;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyContractAddress() {
    await navigator.clipboard.writeText(powContractAddress);
    setCopied(true);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d8dee4] bg-white/95 backdrop-blur-xl">
      <div className="site-shell flex h-16 items-center gap-3">
        <Logo href="/" />
        <form action="/#campaigns" method="get" className="relative ml-1 hidden min-w-0 flex-1 md:block lg:max-w-[18rem]" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#62676d]" aria-hidden="true" />
          <label className="sr-only" htmlFor="site-campaign-search">Search WORK</label>
          <input id="site-campaign-search" name="campaign" className="h-10 w-full rounded-[5px] bg-[#edf3f8] pl-10 pr-10 text-sm text-[#1f2328] outline-none ring-[#0a66c2] placeholder:text-[#62676d] focus:ring-2" placeholder="Search funded campaigns" />
          <button type="submit" className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[4px] text-[#62676d] hover:bg-white hover:text-[#0a66c2]" aria-label="Search campaigns"><Search className="h-4 w-4" /></button>
        </form>

        <nav className="ml-auto hidden h-full items-stretch lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.href} href={item.href} className="group flex min-w-[74px] flex-col items-center justify-center gap-0.5 border-b-2 border-transparent px-2 text-[0.7rem] font-medium text-[#62676d] transition hover:border-[#1f2328] hover:text-[#1f2328]">
                <Icon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <button type="button" onClick={copyContractAddress} className="hidden h-9 items-center gap-2 rounded-full border border-[#0a66c2] px-3 text-xs font-bold text-[#0a66c2] transition hover:bg-[#eef6fd] sm:inline-flex" title={powContractAddress}>
            <span>CA</span>
            <span className="font-mono">{powContractAddress.slice(0, 4)}...{powContractAddress.slice(-4)}</span>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <a href={powXUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-[#aeb7c0] text-sm font-black text-[#1f2328] hover:bg-[#f3f2ef]" aria-label="WORK on X">X</a>
          <a href={buyUrl} target="_blank" rel="noreferrer" className="work-buy-button hidden h-9 items-center rounded-full bg-[#0a66c2] px-4 text-sm font-bold text-white hover:bg-[#004182] md:inline-flex">Buy $POW</a>
          <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full text-[#62676d] hover:bg-[#edf3f8] lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="border-t border-[#e3e7eb] bg-white px-3 py-3 shadow-lg lg:hidden" aria-label="Mobile navigation">
            <div className="site-shell grid gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-[#34383c] hover:bg-[#edf3f8]"><Icon className="h-5 w-5 text-[#62676d]" />{item.label}</a>;
              })}
              <a href={buyUrl} target="_blank" rel="noreferrer" className="button-primary mt-2 w-full">Buy $POW</a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
