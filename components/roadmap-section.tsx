"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Native $POW Campaign",
    points: ["Verified POW Workers", "Social and on-chain scoring", "Wallet-free public leaderboard", "$POW rewards funded by protocol fees"],
    status: "Live",
    href: "/campaigns/pow",
    cta: "View Campaign"
  },
  {
    phase: "Phase 2",
    title: "Open Campaign Platform",
    points: ["SOL or SPL-token campaign funding", "Project-funded pools", "Custom campaign settings", "Individual campaign leaderboards", "$POW reward distribution"],
    status: "In Progress",
    href: "/campaigns/create",
    cta: "Launch Preview"
  },
  {
    phase: "Phase 3",
    title: "POW Marketplace",
    points: ["Proven worker profiles", "Verified projects", "Paid listings", "Talent discovery", "B2B hiring tools"],
    status: "Coming Soon",
    href: "/marketplace",
    cta: "View Beta"
  }
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="section-space relative border-y border-white/[0.06]">
      <div className="site-shell">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="max-w-3xl">
          <p className="section-kicker">Roadmap</p>
          <h2 className="section-title mt-5">Start native. Open the platform.</h2>
        </motion.div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-[19px] hidden h-px bg-gradient-to-r from-[#0b5cff] via-[#4f8cff]/50 to-white/10 lg:block" />
          <div className="grid gap-4 lg:grid-cols-3">
            {phases.map((phase, index) => (
              <motion.article key={phase.phase} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: index * 0.08 }} className="premium-card relative min-h-[420px] p-6 sm:p-8">
                <div className="relative z-10 mb-10 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-[#6b9cff]/[0.35] bg-[#07142e] text-sm font-black text-white shadow-[0_0_24px_rgba(11, 92, 255,0.3)]">{index + 1}</span>
                  <span className={`rounded-full border px-3 py-1.5 text-[0.65rem] font-extrabold uppercase ${phase.status === "Live" ? "border-[#4f8cff]/50 bg-[#0b5cff]/[0.15] text-[#a8c4ff]" : "border-white/10 bg-white/[0.04] text-white/[0.45]"}`}>{phase.status}</span>
                </div>
                <p className="text-xs font-extrabold uppercase text-[#7fa8ff]">{phase.phase}</p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-white">{phase.title}</h3>
                <ul className="mt-7 grid gap-3 text-sm text-white/[0.55]">
                  {phase.points.map((point) => <li key={point} className="flex gap-3"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6b9cff] shadow-[0_0_8px_rgba(25, 118, 255,0.8)]" />{point}</li>)}
                </ul>
                <a href={phase.href} className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-white transition hover:text-[#9fbdff]">{phase.cta}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
