"use client";

import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Building2, Sparkles, Users } from "lucide-react";
import { PreviewBadge } from "@/components/marketplace/marketplace-ui";

const metrics = [
  { label: "Verified Workers", value: "1,248", icon: Users, change: "+84 this month" },
  { label: "Verified Projects", value: "182", icon: Building2, change: "+16 this month" },
  { label: "Open Opportunities", value: "417", icon: BriefcaseBusiness, change: "Across 38 skills" },
  { label: "Matches Today", value: "63", icon: Sparkles, change: "Demo snapshot" }
];

const revenueCards = [
  { title: "Workers", body: "Build reputation. Earn rewards." },
  { title: "Projects", body: "Discover proven contributors. Hire faster." },
  { title: "Enterprise", body: "Monthly subscriptions for premium hiring tools." },
  { title: "Protocol", body: "Revenue supports long-term ecosystem growth." }
];

export function MarketplaceDashboard({ onExplore, onWaitlist }: { onExplore: () => void; onWaitlist: () => void }) {
  return (
    <div id="marketplace-dashboard" className="grid gap-8">
      <section className="market-hero relative overflow-hidden rounded-lg border border-[#4f8cff]/20 p-6 sm:p-10 lg:p-12">
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-[#1e5eff]/20 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#5f95ff]/[0.35] bg-[#1e5eff]/[0.15] px-3 py-1.5 text-[0.68rem] font-black uppercase text-[#b4ccff]">
              Pre-Beta
            </span>
            <span className="text-xs font-bold text-white/40">Interactive Product Preview</span>
          </div>
          <h1 className="mt-8 text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Hire. Build. Grow.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-white/70 sm:text-2xl">
            The B2B marketplace powered by Proof of Work.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.45] sm:text-lg">
            Projects discover proven contributors. Builders discover verified opportunities. Proof of Work becomes your professional reputation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onExplore} className="button-primary">
              Explore Demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onWaitlist} className="button-secondary">
              Join Waitlist
            </button>
          </div>
          <p className="mt-6 text-xs leading-5 text-white/30">
            The marketplace is currently under development. All people, projects, opportunities, and metrics shown here are demo data.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.article
              key={metric.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className="market-panel p-5"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[#7fa8ff]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <PreviewBadge>Demo</PreviewBadge>
              </div>
              <p className="mt-8 text-3xl font-black text-white">{metric.value}</p>
              <p className="mt-1 text-sm font-semibold text-white/[0.65]">{metric.label}</p>
              <p className="mt-3 text-xs text-white/30">{metric.change}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="market-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-white">Talent discovery</p>
              <p className="mt-1 text-xs text-white/[0.35]">Preview activity · last 12 weeks</p>
            </div>
            <PreviewBadge>Preview</PreviewBadge>
          </div>
          <div className="mt-8 h-64 w-full">
            <svg viewBox="0 0 760 260" className="h-full w-full overflow-visible" role="img" aria-label="Demo talent discovery growth chart">
              <defs>
                <linearGradient id="market-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3B82F6" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 95, 150, 205].map((y) => (
                <line key={y} x1="0" y1={y} x2="760" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              ))}
              <motion.path
                d="M0 220 C55 208, 74 198, 124 203 S210 166, 268 174 S350 126, 406 139 S490 92, 548 105 S642 55, 760 42 L760 260 L0 260 Z"
                fill="url(#market-chart-fill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
              <motion.path
                d="M0 220 C55 208, 74 198, 124 203 S210 166, 268 174 S350 126, 406 139 S490 92, 548 105 S642 55, 760 42"
                fill="none"
                stroke="#6B9CFF"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.3, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </section>

        <section className="market-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-white">Top skills</p>
              <p className="mt-1 text-xs text-white/[0.35]">Demo worker supply</p>
            </div>
            <PreviewBadge>Preview</PreviewBadge>
          </div>
          <div className="mt-8 grid gap-5">
            {[
              ["Growth", 86],
              ["Engineering", 74],
              ["Content", 68],
              ["Design", 57],
              ["Community", 49]
            ].map(([label, value], index) => (
              <div key={String(label)}>
                <div className="flex justify-between text-xs font-semibold text-white/[0.45]">
                  <span>{label}</span>
                  <span>{value}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: index * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#1e5eff] to-[#76a2ff] shadow-[0_0_12px_rgba(59,130,246,0.45)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="py-8 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase text-[#7fa8ff]">Revenue</p>
          <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">A Sustainable Business Model</h2>
          <p className="mt-4 text-base leading-7 text-white/[0.45]">A marketplace business built around real work, trusted identity, and better hiring outcomes.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {revenueCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="market-panel min-h-48 p-6"
            >
              <PreviewBadge>{index < 2 ? "Beta" : "Future"}</PreviewBadge>
              <h3 className="mt-10 text-xl font-black text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/[0.45]">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
