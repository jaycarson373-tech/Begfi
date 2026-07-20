"use client";

import { motion } from "framer-motion";
import { BarChart3, Building2, Coins, UsersRound } from "lucide-react";
import { protocolFeeRouting } from "@/lib/fee-routing";

const steps = [
  {
    number: "01",
    title: "A project funds a campaign",
    body: "The project deposits SOL or an SPL token and defines the campaign.",
    icon: Building2
  },
  {
    number: "02",
    title: "Verified workers contribute",
    body: "Hold 1M+ $POW, then post #POWApplication and your wallet in the official X Community.",
    icon: UsersRound
  },
  {
    number: "03",
    title: "POW ranks performance",
    body: "Social and on-chain activity produce a campaign-specific score.",
    icon: BarChart3
  },
  {
    number: "04",
    title: "The network distributes value",
    body: `The strongest workers earn campaign rewards. Separately, ${protocolFeeRouting.holders.percent}% of protocol fees goes to eligible $POW holders and ${protocolFeeRouting.verifiedCampaigns.percent}% funds verified campaign reward pools.`,
    icon: Coins
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-space relative">
      <div className="site-shell">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <p className="section-kicker">How it works</p>
          <h2 className="section-title mt-5">One system. Every campaign.</h2>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="premium-card group min-h-[310px] p-6 sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="text-5xl font-black text-white/[0.07] transition group-hover:text-[#0b5cff]/25">{step.number}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[#76a2ff] transition group-hover:border-[#1976ff]/40 group-hover:bg-[#0b5cff]/10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-14 text-2xl font-extrabold leading-tight text-white">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/50">{step.body}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-5 rounded-lg border border-[#5f95ff]/20 bg-[#0b5cff]/10 px-5 py-4 text-sm font-semibold leading-6 text-[#b4ccff]"
        >
          Eligible holder means {protocolFeeRouting.eligibleHolder.definition} The campaign allocation is limited to campaigns reviewed and verified by Proof of Work.
        </motion.p>
      </div>
    </section>
  );
}
