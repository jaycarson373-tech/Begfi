"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Coins, MessageSquareText, Trophy } from "lucide-react";

const stages = [
  { label: "Work", detail: "Posts and contribution", icon: MessageSquareText },
  { label: "Impact", detail: "Social and on-chain signals", icon: BarChart3 },
  { label: "Rank", detail: "A score for each campaign", icon: Trophy },
  { label: "Earn", detail: "Confirmed $POW rewards", icon: Coins }
];

export function ProofFlow() {
  return (
    <section className="border-b border-[#d8dee4] bg-[#0f2438] py-16 text-white sm:py-20">
      <div className="site-shell">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase text-[#8fc5f4]">How reputation is built</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Turn attention into a work history.</h2><p className="mt-4 text-base leading-7 text-white/70">Every campaign keeps its own score. Your profile shows where you contributed and what happened next.</p></div>
        <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
          {stages.map((stage, index) => { const Icon = stage.icon; return (
            <div key={stage.label} className="contents">
              <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-lg border border-white/15 bg-white/[0.06] p-5"><Icon className="h-5 w-5 text-[#8fc5f4]" /><p className="mt-6 text-xl font-bold">{stage.label}</p><p className="mt-1 text-sm text-white/60">{stage.detail}</p></motion.article>
              {index < stages.length - 1 ? <ArrowRight className="mx-auto hidden h-5 w-5 text-[#8fc5f4] lg:block" /> : null}
            </div>
          ); })}
        </div>
      </div>
    </section>
  );
}
