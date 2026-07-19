"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Coins, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    title: "Link Wallet To X",
    body:
      "Post the application with your wallet. It only connects your X account to an eligible on-chain wallet.",
    icon: Trophy
  },
  {
    title: "Automatic Scanner",
    body:
      "The scanner reads wallet activity and public $POW posts, then weighs views, replies, reposts, likes, holdings, hold time, and volume.",
    icon: Coins
  },
  {
    title: "Fee Flywheel",
    body:
      "100% of creator fees feed SOL payroll for verified workers. More quality attention creates more score, which earns more payroll.",
    icon: BadgeCheck
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="POW careers"
          title="LinkedIn for people who actually post."
          description="POW turns CT work into a measurable attention flywheel: verified wallets, profile-scanned $POW posts, trust-weighted scores, and SOL payroll from creator fees."
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
          Hold 1M+ $POW to qualify. Botting, bought engagement, and wallet farms can be blacklisted.
        </div>
      </div>
    </section>
  );
}
