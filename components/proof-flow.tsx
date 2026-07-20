"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Landmark, MessageSquareText, ReceiptText } from "lucide-react";

const stages = [
  { label: "Funds", detail: "A live wallet you can inspect", icon: Landmark },
  { label: "Work", detail: "Public posts tied to the campaign", icon: MessageSquareText },
  { label: "Score", detail: "A separate rank for every campaign", icon: BarChart3 },
  { label: "Pay", detail: "A confirmed on-chain receipt", icon: ReceiptText }
];

export function ProofFlow() {
  return (
    <section className="border-b border-[#d8dee4] bg-[#0f2438] py-16 text-white sm:py-20">
      <div className="site-shell">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase text-[#8fc5f4]">Trust the receipts, not the pitch</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Every part of the job is checkable.</h2><p className="mt-4 text-base leading-7 text-white/70">Campaign funding, public contribution, campaign-specific ranking, and confirmed payouts stay connected from start to finish.</p></div>
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
