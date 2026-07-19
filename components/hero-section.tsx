"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";

const buyUrl = process.env.NEXT_PUBLIC_BUY_URL || "https://pump.fun";

const line = [
  "Link your X account.",
  "Post.",
  "Climb the leaderboard.",
  "Earn SOL."
];

export function HeroSection() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <AmbientBackground />
      <div className="site-shell relative z-10 flex flex-col items-center pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 scale-[1.8] rounded-full bg-[#1e5eff]/20 blur-3xl" />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/20 bg-[#0a37a4] shadow-[0_0_70px_rgba(30,94,255,0.46)] sm:h-24 sm:w-24"
          >
            <Image
              src="/images/pow-logo.png"
              alt="Proof of Work logo"
              fill
              priority
              sizes="96px"
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="mb-5 text-sm font-bold uppercase text-[#8db3ff]"
        >
          Social mining on Solana
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl text-[3.7rem] font-black leading-[0.92] text-white sm:text-[5.6rem] lg:text-[8.4rem]"
        >
          Proof of Work
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-7 max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-4xl"
        >
          Get paid for posting on CT.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.27 }}
          className="mt-6 max-w-2xl text-base leading-7 text-white/[0.58] sm:text-lg sm:leading-8"
        >
          Crypto runs on attention. Proof of Work rewards the people creating it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-7 flex max-w-3xl flex-wrap justify-center gap-x-3 gap-y-2 text-sm font-semibold text-white/[0.45] sm:text-base"
        >
          {line.map((item, index) => (
            <span key={item} className="flex items-center gap-3">
              {item}
              {index < line.length - 1 && <span className="text-[#3b82f6]">/</span>}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="mt-9 grid w-full max-w-md gap-3 sm:flex sm:max-w-none sm:justify-center"
        >
          <a href={buyUrl} target="_blank" rel="noreferrer" className="button-primary">
            Buy $POW
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#leaderboard" className="button-secondary">
            View Leaderboard
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>

        <motion.a
          href="#how-it-works"
          aria-label="See how Proof of Work works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 7, 0] }}
          transition={{ opacity: { delay: 0.9 }, y: { duration: 2.6, repeat: Infinity } }}
          className="mt-16 grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/[0.45] transition hover:border-white/25 hover:text-white"
        >
          <ArrowDown className="h-4 w-4" />
        </motion.a>
      </div>
    </section>
  );
}
