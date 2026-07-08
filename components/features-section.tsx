"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Coins, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    title: "On-Chain Begging",
    body:
      "Hold $BEG and you are begworking on-chain. Eligibility starts with the wallet, not the resume.",
    icon: Trophy
  },
  {
    title: "$ANSEM Rewards",
    body:
      "50% of creator fees are used for $ANSEM rewards to eligible $BEG holders.",
    icon: Coins
  },
  {
    title: "Verified Begworkers",
    body:
      "50% goes to a reward wallet for manual payouts to verified beggars and bounties.",
    icon: BadgeCheck
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="From bagworking to begworking"
          title="The new work meta is begging."
          description="Ansem sparked the airdrop begging meta. Begwork is not affiliated with him; it turns the meme into a clean 50/50 loop: $ANSEM rewards for eligible $BEG holders and a reward wallet for verified beggars."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="glass-surface rounded-lg p-5"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg border border-white/[0.12] bg-white/[0.07]">
                  <Icon className="h-5 w-5 text-beg-lime" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/[0.62]">{feature.body}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg border border-beg-purple/[0.28] bg-beg-purple/[0.1] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-beg-lime">
          Hold $BEG to be an on-chain beggar.
        </div>
      </div>
    </section>
  );
}
