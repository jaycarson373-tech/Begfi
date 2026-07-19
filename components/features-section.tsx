"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Coins, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    title: "Apply For Work",
    body:
      "Post your wallet with $POW and #POW application. The scanner checks the wallet and adds qualified workers.",
    icon: Trophy
  },
  {
    title: "AI Work Scoring",
    body:
      "The scoring engine scans public $POW posts and weighs reach, replies, reposts, likes, views, holdings, hold time, and volume.",
    icon: Coins
  },
  {
    title: "Creator-Fee Payroll",
    body:
      "100% of creator fees are distributed as SOL to top workers, creating a loop: better work earns more score, and more score earns more payroll.",
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
          description="AI took your job. POW gives CT one back: public applications, verified wallets, AI-scored outreach, and SOL payroll from creator fees."
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
