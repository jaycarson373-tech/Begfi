"use client";

import { motion } from "framer-motion";
import { Coins, Trophy, Vote } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    title: "Community Beg Pool",
    body:
      "Every hour, holders can submit a wallet, their realized losses, and a short explanation for why they deserve the next airdrop.",
    icon: Trophy
  },
  {
    title: "Community Vote",
    body:
      "Holders vote on submissions during the hour. The highest-voted submission wins the Beg Pool.",
    icon: Vote
  },
  {
    title: "Automatic Rewards",
    body:
      "50% of creator fees fund the hourly Beg Pool. 50% is automatically airdropped pro-rata to eligible $BEG holders.",
    icon: Coins
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Begging as protocol design"
          title="A cleaner loop for CT airdrop culture."
          description="BegFi turns creator fees into an hourly community ritual: public submissions, holder voting, one winner, and automatic holder-side rewards."
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
      </div>
    </section>
  );
}
