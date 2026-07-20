"use client";

import { motion } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, CircleDollarSign, MessageSquareText } from "lucide-react";
import { protocolFeeRouting } from "@/lib/fee-routing";

const steps = [
  { number: "01", title: "Create your WORK profile", body: "Connect your wallet, verify X, and qualify with the required $POW balance.", icon: BadgeCheck },
  { number: "02", title: "Choose who you work for", body: "Join the native $POW campaign or a project-funded campaign from the directory.", icon: BriefcaseBusiness },
  { number: "03", title: "Do the work in public", body: "Post, reply, create, and grow the campaign. Social and on-chain contribution shape your score.", icon: MessageSquareText },
  { number: "04", title: "Build reputation. Get paid.", body: `Top workers earn campaign rewards. Separately, ${protocolFeeRouting.holders.percent}% of protocol fees goes to eligible $POW holders and ${protocolFeeRouting.verifiedCampaigns.percent}% funds verified campaigns.`, icon: CircleDollarSign }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-space border-b border-[#d8dee4]">
      <div className="site-shell">
        <div><p className="section-kicker">Getting hired by a coin</p><h2 className="section-title mt-3">Your work history starts on X.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#62676d]">No resume theater. Pick a campaign and let the result speak for you.</p></div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => { const Icon = step.icon; return (
            <motion.article key={step.number} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="network-card min-h-[260px] p-5 sm:p-6">
              <div className="flex items-center justify-between"><span className="text-sm font-extrabold text-[#0a66c2]">{step.number}</span><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e7f3ff] text-[#0a66c2]"><Icon className="h-4 w-4" /></span></div>
              <h3 className="mt-10 text-xl font-extrabold leading-7 text-[#1f2328]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#62676d]">{step.body}</p>
            </motion.article>
          ); })}
        </div>
        <p className="mt-4 rounded-md border border-[#c8def3] bg-[#eef6fd] px-4 py-3 text-xs leading-5 text-[#41576d]">Eligible holder: {protocolFeeRouting.eligibleHolder.definition} Campaign allocations only go to campaigns reviewed and approved by WORK.</p>
      </div>
    </section>
  );
}
