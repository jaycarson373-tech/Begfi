"use client";

import { motion } from "framer-motion";
import { BarChart3, Building2, Coins, UsersRound } from "lucide-react";

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
    title: "Proof of Work ranks performance",
    body: "Social and on-chain activity produce a campaign-specific score.",
    icon: BarChart3
  },
  {
    number: "04",
    title: "The strongest workers earn",
    body: "Eligible workers receive $POW from that campaign's funded payout allocation.",
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
                  <span className="text-5xl font-black text-white/[0.07] transition group-hover:text-[#1e5eff]/25">{step.number}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[#76a2ff] transition group-hover:border-[#3b82f6]/40 group-hover:bg-[#1e5eff]/10">
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
          className="mt-5 rounded-lg border border-[#5f95ff]/20 bg-[#1e5eff]/10 px-5 py-4 text-sm font-semibold leading-6 text-[#b4ccff]"
        >
          The native campaign is funded by protocol fees. Its 15-minute worker payout uses only a capped share of a pre-funded $POW reward wallet.
        </motion.p>
      </div>
    </section>
  );
}
