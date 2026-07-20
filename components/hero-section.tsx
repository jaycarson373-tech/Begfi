"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, BarChart3, BriefcaseBusiness, Image as ImageIcon, MessageSquareText, PenLine, Send, Sparkles, UsersRound } from "lucide-react";
import { ContractAddress } from "@/components/contract-address";
import { FeeRoutingModule } from "@/components/fee-routing-module";
import { WorkerOnboarding } from "@/components/worker-onboarding/worker-onboarding";
import { powApplicationHashtag, powCommunityUrl, powMinimumHoldingLabel } from "@/lib/pow-config";

const signals = [
  { icon: PenLine, label: "Posts", detail: "Create attention" },
  { icon: BarChart3, label: "Score", detail: "Prove impact" },
  { icon: BriefcaseBusiness, label: "Campaigns", detail: "Earn $POW" }
];

export function HeroSection({ workerOnboardingEnabled }: { workerOnboardingEnabled: boolean }) {
  return (
    <section id="top" className="border-b border-[#d8dee4] pb-10 pt-10 sm:pb-14 sm:pt-14">
      <div className="site-shell grid gap-4 lg:grid-cols-[225px_minmax(0,1fr)_280px] lg:items-start">
        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="network-card hidden lg:block">
          <div className="work-cover h-16" />
          <div className="px-4 pb-4 text-center">
            <div className="mx-auto -mt-8 grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-[#0a66c2] text-2xl font-black text-white">W</div>
            <h2 className="mt-3 text-base font-bold text-[#1f2328]">Your WORK profile</h2>
            <p className="mt-1 text-xs leading-5 text-[#62676d]">One identity for the coins and campaigns you help grow.</p>
          </div>
          <div className="border-t border-[#e3e7eb] px-4 py-3 text-xs">
            <div className="flex items-center justify-between gap-3 py-1"><span className="text-[#62676d]">Worker status</span><span className="font-bold text-[#147d64]">Open to work</span></div>
            <div className="flex items-center justify-between gap-3 py-1"><span className="text-[#62676d]">Minimum</span><span className="font-bold text-[#0a66c2]">{powMinimumHoldingLabel}</span></div>
          </div>
          <a href="#how-it-works" className="flex items-center gap-2 border-t border-[#e3e7eb] px-4 py-3 text-xs font-bold text-[#34383c] hover:bg-[#f8f9fa]"><Sparkles className="h-4 w-4 text-[#a66b1f]" />How WORK scores you</a>
        </motion.aside>

        <div className="grid gap-4">
          <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="network-card">
            <div className="work-cover work-dot-grid px-5 py-10 text-white sm:px-8 sm:py-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm"><BadgeCheck className="h-3.5 w-3.5" />THE WORK NETWORK FOR CRYPTO</span>
              <h1 className="mt-6 max-w-2xl text-[2.9rem] font-extrabold leading-[0.98] sm:text-[4.5rem]">I work for this coin.</h1>
              <p className="mt-5 max-w-xl text-lg font-medium leading-7 text-white/90 sm:text-xl">Join a funded campaign. Post on X. Build a campaign score. Earn $POW when your work gets results.</p>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0a66c2] text-lg font-black text-white">W</div>
                <a href="#campaigns" className="flex min-h-12 flex-1 items-center rounded-full border border-[#aeb7c0] px-4 text-sm font-semibold text-[#62676d] transition hover:bg-[#f3f2ef]">What coin are you working for?</a>
              </div>
              <div className="mt-3 grid grid-cols-3 border-t border-[#e3e7eb] pt-3">
                <a href="#campaigns" className="flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold text-[#62676d] hover:bg-[#f3f2ef]"><Send className="h-4 w-4 text-[#0a66c2]" />Campaign</a>
                <a href="#leaderboard" className="flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold text-[#62676d] hover:bg-[#f3f2ef]"><UsersRound className="h-4 w-4 text-[#147d64]" />Workers</a>
                <a href="#payouts" className="flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold text-[#62676d] hover:bg-[#f3f2ef]"><ImageIcon className="h-4 w-4 text-[#a66b1f]" />Receipts</a>
              </div>
            </div>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="network-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] bg-[#e7f3ff] font-black text-[#0a66c2]">W</div>
              <div>
                <p className="font-bold text-[#1f2328]">WORK Network</p>
                <p className="mt-0.5 text-xs text-[#62676d]">The contributor network for crypto · now</p>
              </div>
            </div>
            <p className="mt-5 text-xl font-bold leading-7 text-[#1f2328]">Your timeline is your resume.</p>
            <p className="mt-2 text-sm leading-6 text-[#62676d]">Connect X, choose a campaign, and do the work publicly. WORK tracks the result and turns contribution into reputation.</p>
            <div className="mt-5 grid gap-3 sm:flex">
              {workerOnboardingEnabled ? <WorkerOnboarding /> : <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="button-primary">Create your WORK profile<ArrowUpRight className="h-4 w-4" /></a>}
              <a href="#campaigns" className="button-secondary">Browse campaigns</a>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#62676d]">Fallback: post {powApplicationHashtag} with your wallet in the official X Community. Hold {powMinimumHoldingLabel} to qualify.</p>
          </motion.article>
        </div>

        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4">
          <div className="network-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-base font-bold text-[#1f2328]">How you get paid</h2><span className="rounded-full bg-[#e8f5ef] px-2 py-1 text-[0.65rem] font-bold text-[#147d64]">LIVE NETWORK</span></div>
            <div className="mt-4 divide-y divide-[#e3e7eb]">
              {signals.map((signal) => { const Icon = signal.icon; return <div key={signal.label} className="flex items-center gap-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf3f8] text-[#0a66c2]"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold text-[#34383c]">{signal.label}</p><p className="text-xs text-[#62676d]">{signal.detail}</p></div></div>; })}
            </div>
          </div>
          <FeeRoutingModule />
          <ContractAddress />
        </motion.aside>
      </div>
    </section>
  );
}
