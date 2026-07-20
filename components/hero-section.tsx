"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  UserRoundCheck
} from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { ContractAddress } from "@/components/contract-address";
import { FeeRoutingModule } from "@/components/fee-routing-module";
import { WorkerOnboarding } from "@/components/worker-onboarding/worker-onboarding";
import { powApplicationHashtag, powCommunityUrl, powMinimumHoldingLabel } from "@/lib/pow-config";

const profileSignals = [
  { icon: BriefcaseBusiness, label: "Campaign work", detail: "Tracked by campaign" },
  { icon: BarChart3, label: "Reputation", detail: "Built from real impact" },
  { icon: BadgeCheck, label: "Eligibility", detail: "Verified on-chain" }
];

export function HeroSection({ workerOnboardingEnabled }: { workerOnboardingEnabled: boolean }) {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden border-b border-white/[0.08] pt-20">
      <AmbientBackground />
      <div className="site-shell relative z-10 grid min-h-[calc(100svh-5rem)] items-center gap-16 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#1f75ff]/30 bg-[#075dff]/10 px-3 py-1.5 text-xs font-extrabold text-[#8fb7ff]"
          >
            <span className="h-2 w-2 rounded-full bg-[#1f75ff] shadow-[0_0_12px_rgba(31,117,255,0.95)]" />
            THE WORK NETWORK FOR CRYPTO
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-4xl text-[3.8rem] font-black leading-[0.9] text-white sm:text-[5.4rem] lg:text-[6.6rem]"
          >
            PROOF OF <span className="text-[#1f75ff] drop-shadow-[0_0_28px_rgba(31,117,255,0.3)]">WORK.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.17 }}
            className="mt-7 max-w-2xl text-xl font-semibold leading-8 text-white sm:text-2xl sm:leading-9"
          >
            Build your reputation. Grow projects. Earn $POW.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.23 }}
            className="mt-4 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8"
          >
            POW connects your X activity to campaign-specific leaderboards, so the people creating real attention can prove their work and get rewarded.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.31 }}
            className="mt-8 grid w-full gap-3 sm:flex"
          >
            <a href="#campaigns" className="button-primary">
              Explore Campaigns
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            {workerOnboardingEnabled ? (
              <WorkerOnboarding />
            ) : (
              <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="button-secondary">
                Become a POW Worker
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </motion.div>

          <ContractAddress className="mt-4 max-w-2xl" />

          <FeeRoutingModule />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 flex items-start gap-2 text-sm font-semibold leading-6 text-white/45"
          >
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1f75ff]" aria-hidden="true" />
            Hold {powMinimumHoldingLabel} and post {powApplicationHashtag} with your wallet in the official X Community.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[31rem]"
        >
          <div className="network-profile overflow-hidden rounded-lg border border-[#1f75ff]/20 bg-[#071126]/95 shadow-[0_32px_90px_rgba(0,0,0,0.44),0_0_70px_rgba(7,93,255,0.08)]">
            <div className="h-28 bg-[linear-gradient(120deg,#075dff,#07317e_55%,#020817)] sm:h-32" />
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              <div className="-mt-12 flex items-end justify-between gap-4">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-[#071126] bg-[#020817] shadow-[0_12px_35px_rgba(0,0,0,0.35),0_0_28px_rgba(7,93,255,0.18)]"
                >
                  <Image src="/images/pow-logo.jpg" alt="POW Proof of Work logo" fill priority sizes="96px" className="object-cover" />
                </motion.div>
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#1f75ff]/30 bg-[#075dff]/10 px-3 py-1.5 text-xs font-extrabold text-[#b6d2ff]">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  VERIFIED WORK
                </span>
              </div>

              <p className="mt-5 text-xs font-extrabold text-[#69a2ff]">POW WORKER PROFILE</p>
              <h2 className="mt-2 text-3xl font-black text-white">Your work becomes reputation.</h2>
              <p className="mt-3 text-sm leading-6 text-white/50">
                One public identity for your campaign contribution, eligibility, and results.
              </p>

              <div className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {profileSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div key={signal.label} className="flex items-center gap-4 py-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#075dff]/15 text-[#69a2ff]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white">{signal.label}</p>
                        <p className="mt-0.5 text-xs text-white/40">{signal.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#075dff] px-4 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(7,93,255,0.24)] transition hover:bg-[#146cff] hover:shadow-[0_18px_44px_rgba(7,93,255,0.34)]">
                <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
                Apply with {powApplicationHashtag}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
