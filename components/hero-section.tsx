"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, ShieldCheck } from "lucide-react";

const statlets = [
  "Beg-To-Earn on Solana",
  "100% fees to community",
  "100K+ $BEG eligible"
];

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[88svh] items-center overflow-hidden pt-24"
    >
      <Image
        src="/images/begfi-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-[62%_50%] opacity-75"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,0,5,0.96)_0%,rgba(3,0,5,0.82)_38%,rgba(3,0,5,0.42)_68%,rgba(3,0,5,0.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-beg-black to-transparent" />
      <div className="noise-mask" />
      <span className="scanline left-[4%] top-[28%] animate-pulse-line" />
      <span className="scanline bottom-[24%] right-[10%] animate-pulse-line [animation-delay:1.4s]" />

      <div className="section-shell relative z-10 grid items-center gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="eyebrow">
            <ShieldCheck className="h-3.5 w-3.5 text-beg-lime" aria-hidden="true" />
            CT begging, systematized
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl md:text-7xl">
            Begging is the meta.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/[0.72] sm:text-xl">
            Ansem airdropped 10M. CT started begging for more. BegFi turns the
            airdrop chase into an hourly community payout system.
          </p>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-beg-lime">
            The first Beg-To-Earn protocol on Solana.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:bg-beg-lime focus:outline-none focus:ring-2 focus:ring-beg-lime/80"
            >
              Buy $BEG
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/[0.15] bg-white/[0.06] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-beg-purple/60 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-beg-purple/60"
            >
              View Dashboard
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-8 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
            {statlets.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3 text-sm font-semibold text-white/70 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          className="hidden justify-end lg:flex"
          aria-hidden="true"
        >
          <div className="glass-surface animate-float-slow rounded-lg p-4">
            <div className="grid w-[360px] gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.45]">
                  Fee split
                </span>
                <span className="text-xs font-bold text-beg-lime">50 / 50</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-white/[0.45]">Beg Pool</p>
                  <p className="mt-2 text-2xl font-black">50%</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-white/[0.45]">Holder Rewards</p>
                  <p className="mt-2 text-2xl font-black">50%</p>
                </div>
              </div>
              <div className="rounded-lg border border-beg-purple/[0.25] bg-beg-purple/10 p-4 text-sm leading-6 text-white/70">
                Post the beg. Hold enough $BEG. Let the community decide who
                gets the next hourly payout.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
