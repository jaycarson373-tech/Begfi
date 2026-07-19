"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, UserRoundCheck, UsersRound } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { ContractAddress } from "@/components/contract-address";
import { powApplicationHashtag, powCommunityUrl } from "@/lib/pow-config";

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
            <Image src="/images/pow-logo.png" alt="Proof of Work logo" fill priority sizes="96px" className="object-cover" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="mb-5 text-sm font-bold uppercase text-[#8db3ff]"
        >
          Campaign rewards on Solana
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl text-[3.45rem] font-black leading-[0.94] text-white sm:text-[5.3rem] lg:text-[7.2rem]"
        >
          Reward the people growing your project.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mt-7 max-w-3xl text-lg leading-8 text-white/[0.58] sm:text-xl sm:leading-9"
        >
          Proof of Work ranks contributors by social performance and on-chain activity, then rewards the strongest workers with $POW.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-[#9fbdff] sm:text-base"
        >
          Hold 1M+ $POW to be eligible. Post {powApplicationHashtag} and your wallet in the official X Community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-9 grid w-full max-w-md gap-3 sm:flex sm:max-w-none sm:justify-center"
        >
          <a href="#campaigns" className="button-primary">
            Explore Campaigns
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/campaigns/create" className="button-secondary">
            Launch a Campaign
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-5 max-w-full"
        >
          <ContractAddress />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white/[0.48] transition hover:text-white">
            <UserRoundCheck className="h-4 w-4 text-[#7fa8ff]" aria-hidden="true" />
            Apply with {powApplicationHashtag}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white/[0.48] transition hover:text-white">
            <UsersRound className="h-4 w-4 text-[#7fa8ff]" aria-hidden="true" />
            Join X Community
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
