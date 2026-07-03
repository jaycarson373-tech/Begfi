"use client";

import { motion } from "framer-motion";
import { Coins, Trophy, Vote } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    title: "Beg Pool",
    body:
      "50% of fees fund an hourly pool for the best beggar.",
    icon: Trophy
  },
  {
    title: "Holder Rewards",
    body:
      "50% of fees are distributed to eligible $BEG holders.",
    icon: Coins
  },
  {
    title: "Community Decides",
    body:
      "Holders vote on who deserves the next payout.",
    icon: Vote
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="From meme to protocol"
          title="From meme to protocol."
          description="Ansem sparked the airdrop begging meta by giving away 10M of his own token. Now everyone wants the next drop. BegFi takes that energy and makes it systematic: 100% of creator fees go back to the community."
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
          Hold 100K+ $BEG to be eligible.
        </div>
      </div>
    </section>
  );
}
