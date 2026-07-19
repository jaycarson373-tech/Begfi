"use client";

import { motion } from "framer-motion";
import { Building2, Radar, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const roadmapItems = [
  {
    title: "Attention Flywheel",
    status: "Launch",
    body:
      "Wallet-linked workers post with $POW, the scanner scores engagement and wallet activity, and creator fees pay top workers in SOL.",
    icon: Radar
  },
  {
    title: "Verified Worker Trust Scores",
    status: "Next",
    body:
      "Worker history, delivery quality, anti-cheat reputation, holding behavior, and campaign consistency roll into a portable trust score.",
    icon: ShieldCheck
  },
  {
    title: "PoW Marketplace",
    status: "Future",
    body:
      "A B2B SaaS layer where projects can access verified workers, workers can find higher-quality projects, and PoW can generate marketplace revenue.",
    icon: Building2
  }
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Roadmap"
          title="From fee rewards to worker marketplace."
          description="The first product is simple: hold, post, score, earn. The bigger vision is a trust-scored workforce layer for projects that need real distribution."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {roadmapItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="glass-surface rounded-lg p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/[0.12] bg-white/[0.07]">
                    <Icon className="h-5 w-5 text-beg-lime" aria-hidden="true" />
                  </div>
                  <span className="rounded-lg border border-white/[0.12] bg-white/[0.055] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/[0.62]">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/[0.62]">{item.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
