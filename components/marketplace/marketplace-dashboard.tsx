"use client";

import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Building2, Sparkles, Users } from "lucide-react";
import { PreviewBadge } from "@/components/marketplace/marketplace-ui";

const metrics = [
  { label: "Verified Workers", value: "—", icon: Users },
  { label: "Verified Projects", value: "—", icon: Building2 },
  { label: "Open Opportunities", value: "—", icon: BriefcaseBusiness },
  { label: "Matches Today", value: "—", icon: Sparkles }
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
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-[#0b5cff]/20 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#5f95ff]/[0.35] bg-[#0b5cff]/[0.15] px-3 py-1.5 text-[0.68rem] font-black uppercase text-[#b4ccff]">
              Pre-Beta
            </span>
            <span className="text-xs font-bold text-white/40">Interactive Product Preview</span>
          </div>
          <h1 className="mt-8 text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Hire. Build. Grow.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-white/70 sm:text-2xl">
            The B2B marketplace powered by PROOF OF WORK.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.45] sm:text-lg">
            Projects discover proven contributors. Builders discover verified opportunities. PROOF OF WORK becomes your professional reputation.
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
            The marketplace is currently under development. No people, projects, opportunities, or performance metrics are displayed until real data is connected.
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
                <PreviewBadge>Pre-Beta</PreviewBadge>
              </div>
              <p className="mt-8 text-3xl font-black text-white">{metric.value}</p>
              <p className="mt-1 text-sm font-semibold text-white/[0.65]">{metric.label}</p>
              <p className="mt-3 text-xs text-white/30">No live data</p>
            </motion.article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="market-panel grid min-h-80 place-items-center p-5 text-center sm:p-6">
          <div>
            <PreviewBadge>Pre-Beta</PreviewBadge>
            <p className="mt-5 text-lg font-black text-white">No marketplace activity yet.</p>
            <p className="mt-2 text-sm text-white/35">Real activity will appear after the marketplace connects to production data.</p>
          </div>
        </section>

        <section className="market-panel grid min-h-80 place-items-center p-5 text-center sm:p-6">
          <div>
            <PreviewBadge>Pre-Beta</PreviewBadge>
            <p className="mt-5 text-lg font-black text-white">No verified skills yet.</p>
            <p className="mt-2 text-sm text-white/35">Skill supply will be calculated from real worker profiles.</p>
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
