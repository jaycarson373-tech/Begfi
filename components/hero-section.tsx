"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, ShieldCheck } from "lucide-react";

const statlets = [
  "Wallet-linked X accounts",
  "Automatic PoW scanner",
  "100% SOL fee flywheel"
];

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[88svh] items-center overflow-hidden pt-24"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_24%,rgba(20,104,255,0.44),transparent_30rem),radial-gradient(circle_at_46%_72%,rgba(74,162,255,0.22),transparent_24rem),linear-gradient(135deg,#01081f_0%,#02133d_54%,#01081f_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(1,8,31,0.96)_0%,rgba(1,12,44,0.82)_42%,rgba(3,39,118,0.54)_74%,rgba(1,8,31,0.92)_100%)]" />
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
            Attention flywheel for CT
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl md:text-7xl">
            Proof of Work.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/[0.72] sm:text-xl">
            Ansem asked CT for a better work tool. POW turns that prompt into
            an attention flywheel: link wallet to X, post with $POW, let the
            automatic scanner measure wallet activity and engagement, and earn
            SOL from creator fees.
          </p>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-beg-lime">
            Independent project. No official partnership implied.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:bg-beg-lime focus:outline-none focus:ring-2 focus:ring-beg-lime/80"
            >
              Buy $POW
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/[0.15] bg-white/[0.06] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-beg-purple/60 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-beg-purple/60"
            >
              View Leaderboard
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
          className="justify-end"
        >
          <div className="glass-surface rounded-lg p-3 sm:p-4">
            <div className="grid gap-3 lg:w-[430px]">
              <div className="pow-banner-frame relative aspect-[1280/426] overflow-hidden rounded-lg border border-white/10 bg-black/40">
                <motion.div
                  className="absolute inset-0"
                  animate={{ y: [0, -1.5, 0, 0.8, 0], rotate: [0, -0.12, 0.08, 0] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/images/pow-banner.png"
                    alt="Proof of Work banner"
                    fill
                    priority
                    sizes="(min-width: 1024px) 430px, calc(100vw - 56px)"
                    className="object-cover"
                  />
                </motion.div>
                <span className="pow-impact-flash" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.45]">
                  Attention flywheel
                </span>
                <span className="text-xs font-bold text-beg-lime">100%</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/[0.42]">
                  POW
                </p>
                <p className="mt-3 text-4xl font-black leading-none text-white">
                  Mine attention. Get paid.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-white/[0.45]">Creator Fees</p>
                  <p className="mt-2 text-2xl font-black">100%</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-white/[0.45]">Paid In</p>
                  <p className="mt-2 text-2xl font-black">SOL</p>
                </div>
              </div>
              <div className="rounded-lg border border-beg-purple/[0.25] bg-beg-purple/10 p-4 text-sm leading-6 text-white/70">
                The scanner tracks current wallet behavior and public $POW
                engagement. Stronger output builds score. Stronger score earns
                more SOL payroll.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
