"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";

const phases = [
  { phase: "Now", title: "WORK for $POW", points: ["Verified worker profiles", "Social and on-chain scoring", "Live worker leaderboard", "$POW payouts"], status: "Live", href: "/campaigns/pow", cta: "Open campaign" },
  { phase: "Next", title: "WORK for any coin", points: ["Project-funded campaigns", "Independent campaign scores", "Custom eligibility", "Verifiable reward pools"], status: "Building", href: "/campaigns/create", cta: "Preview campaign setup" },
  { phase: "Later", title: "The crypto work graph", points: ["Portable worker profiles", "Project pages", "Opportunity discovery", "Professional hiring tools"], status: "Planned", href: "/marketplace", cta: "View jobs preview" }
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="section-space border-b border-[#d8dee4]">
      <div className="site-shell">
        <div><p className="section-kicker">What WORK becomes</p><h2 className="section-title mt-3">From a campaign to a professional network.</h2></div>
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {phases.map((phase, index) => (
            <motion.article key={phase.phase} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="network-card flex min-h-[350px] flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between"><span className="text-xs font-extrabold uppercase text-[#0a66c2]">{phase.phase}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${phase.status === "Live" ? "bg-[#e8f5ef] text-[#147d64]" : "bg-[#edf3f8] text-[#62676d]"}`}>{phase.status}</span></div>
              <h3 className="mt-6 text-2xl font-extrabold text-[#1f2328]">{phase.title}</h3>
              <ul className="mt-6 grid gap-3 text-sm text-[#62676d]">{phase.points.map((point) => <li key={point} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0a66c2]" />{point}</li>)}</ul>
              <a href={phase.href} className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-bold text-[#0a66c2] hover:underline">{phase.cta}<ArrowUpRight className="h-4 w-4" /></a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
