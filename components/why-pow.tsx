"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Globe2, UserRoundSearch } from "lucide-react";
import { powApplicationHashtag, powCommunityUrl, powMinimumHoldingLabel } from "@/lib/pow-config";

export function WhyPow() {
  return (
    <section className="section-space border-b border-[#d8dee4] bg-white">
      <div className="site-shell grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="section-kicker">Your portable work identity</p>
          <h2 className="section-title mt-3">The coins change. Your reputation stays.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#62676d]">Join multiple campaigns from one verified profile. Each campaign ranks you independently, while your WORK history shows the projects you helped move.</p>
          <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="button-primary mt-7">Create your WORK profile<ArrowUpRight className="h-4 w-4" /></a>
          <p className="mt-3 text-xs text-[#747a80]">Fallback application: {powApplicationHashtag} · Minimum {powMinimumHoldingLabel}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="network-card">
          <div className="work-cover h-24" />
          <div className="px-5 pb-5">
            <span className="-mt-10 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-[#e7f3ff] text-2xl font-black text-[#0a66c2]">YOU</span>
            <h3 className="mt-4 text-2xl font-extrabold text-[#1f2328]">Verified contributor</h3>
            <p className="mt-1 text-sm text-[#62676d]">Crypto · Open to campaigns</p>
            <div className="mt-5 divide-y divide-[#e3e7eb] border-y border-[#e3e7eb]">
              <div className="flex items-center gap-3 py-3"><BadgeCheck className="h-5 w-5 text-[#0a66c2]" /><span className="text-sm font-semibold text-[#34383c]">Wallet ownership verified</span></div>
              <div className="flex items-center gap-3 py-3"><Globe2 className="h-5 w-5 text-[#0a66c2]" /><span className="text-sm font-semibold text-[#34383c]">X account linked</span></div>
              <div className="flex items-center gap-3 py-3"><UserRoundSearch className="h-5 w-5 text-[#0a66c2]" /><span className="text-sm font-semibold text-[#34383c]">Discoverable by projects</span></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
