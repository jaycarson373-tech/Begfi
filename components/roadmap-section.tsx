"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Proof of Work Protocol",
    points: ["Connect X", "Earn SOL", "Build reputation", "Public leaderboard"],
    status: "Live"
  },
  {
    phase: "Phase 2",
    title: "Reputation Layer",
    points: ["Proof of Work score", "Public profiles", "Wallet reputation", "Verified contributors"],
    status: "In Progress"
  },
  {
    phase: "Phase 3",
    title: "Marketplace Beta",
    description: "Projects discover trusted contributors. Workers discover verified opportunities.",
    points: ["Interactive product preview", "Verified opportunities", "Contributor discovery"],
    status: "Coming Soon",
    href: "/marketplace"
  },
  {
    phase: "Phase 4",
    title: "Enterprise Platform",
    points: ["Verified hiring", "Premium talent search", "Recruitment dashboard", "Candidate analytics", "Team management", "Featured listings"],
    status: "Future"
  },
  {
    phase: "Phase 5",
    title: "Open Reputation Network",
    description: "Proof of Work becomes the reputation layer for crypto.",
    points: ["Public API", "Developer SDK", "Third-party integrations"],
    status: "Future"
  }
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="section-space relative border-y border-white/[0.06]">
      <div className="site-shell">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="section-kicker">Roadmap</p>
          <h2 className="section-title mt-5">From rewards to reputation.</h2>
        </motion.div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-[19px] hidden h-px bg-gradient-to-r from-[#1e5eff] via-[#4f8cff]/50 to-white/10 lg:block" />
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {phases.map((phase, index) => (
              <motion.article
                key={phase.phase}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="premium-card relative min-h-[390px] min-w-[82vw] snap-center p-6 sm:min-w-[330px] lg:min-w-0"
              >
                <div className="relative z-10 mb-8 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-[#6b9cff]/[0.35] bg-[#07142e] text-sm font-black text-white shadow-[0_0_24px_rgba(30,94,255,0.3)]">
                    {index + 1}
                  </span>
                  <span className={`rounded-full border px-3 py-1.5 text-[0.65rem] font-extrabold uppercase ${
                    phase.status === "Live"
                      ? "border-[#4f8cff]/50 bg-[#1e5eff]/[0.15] text-[#a8c4ff]"
                      : "border-white/10 bg-white/[0.04] text-white/[0.45]"
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <p className="text-xs font-extrabold uppercase text-[#7fa8ff]">{phase.phase}</p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-white">{phase.title}</h3>
                {phase.description && <p className="mt-4 text-sm leading-6 text-white/[0.45]">{phase.description}</p>}
                <ul className="mt-6 grid gap-3 text-sm text-white/[0.55]">
                  {phase.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6b9cff] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      {point}
                    </li>
                  ))}
                </ul>
                {phase.href && (
                  <a href={phase.href} className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-white transition hover:text-[#9fbdff]">
                    View Beta
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
