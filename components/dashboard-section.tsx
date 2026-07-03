"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, DatabaseZap, History, ListChecks } from "lucide-react";
import { MetricTile } from "@/components/metric-tile";
import { SectionHeading } from "@/components/section-heading";
import { getDashboardSnapshot } from "@/lib/protocol-data";

function getTopOfHourCountdown() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  const diff = Math.max(0, next.getTime() - now.getTime());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function DashboardSection() {
  const snapshot = useMemo(() => getDashboardSnapshot(), []);
  const [countdown, setCountdown] = useState("00:00");

  useEffect(() => {
    setCountdown(getTopOfHourCountdown());
    const timer = window.setInterval(() => {
      setCountdown(getTopOfHourCountdown());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const countdownMetric = snapshot.metrics.find(
    (metric) => metric.key === "countdown"
  );
  const regularMetrics = snapshot.metrics.filter(
    (metric) => metric.key !== "countdown"
  );

  return (
    <section id="dashboard" className="relative py-16 sm:py-20">
      <div className="absolute inset-x-0 top-20 -z-10 h-72 bg-[radial-gradient(circle_at_50%_50%,rgba(155,92,255,0.2),transparent_62%)]" />
      <div className="section-shell">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Dashboard"
            title="Round state without pretending the backend exists yet."
            description="Static mock data is wired through a small protocol data layer so fee distribution, voting, and wallet verification APIs can replace it later."
            icon={<DatabaseZap className="h-3.5 w-3.5 text-beg-lime" aria-hidden="true" />}
          />
          <div className="glass-subtle rounded-lg px-4 py-3 text-sm text-white/[0.62]">
            <span className="font-bold text-white">{snapshot.round.id}</span>
            <span className="mx-2 text-white/[0.26]">/</span>
            {snapshot.round.status}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {regularMetrics.map((metric, index) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <MetricTile metric={metric} />
            </motion.div>
          ))}
          {countdownMetric ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <MetricTile metric={countdownMetric} valueOverride={countdown} />
            </motion.div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.55fr]">
          <section className="glass-surface rounded-lg p-4 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/[0.45]">
                  <ListChecks className="h-4 w-4 text-beg-lime" aria-hidden="true" />
                  Top Submissions
                </div>
                <p className="mt-2 text-sm text-white/[0.55]">
                  Wallet, losses, beg story, and votes for the current mock round.
                </p>
              </div>
              <div className="rounded-lg border border-beg-purple/30 bg-beg-purple/10 px-3 py-2 text-sm font-bold text-white">
                {snapshot.round.votingWindow}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              <div className="hidden grid-cols-[0.45fr_1fr_0.75fr_2.4fr_0.7fr] border-b border-white/10 bg-white/[0.045] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/[0.45] md:grid">
                <span>Rank</span>
                <span>Wallet</span>
                <span>Losses</span>
                <span>Beg Story</span>
                <span className="text-right">Votes</span>
              </div>
              <div className="divide-y divide-white/10">
                {snapshot.submissions.map((submission) => (
                  <article
                    key={submission.wallet}
                    className="grid gap-3 bg-white/[0.02] px-4 py-4 md:grid-cols-[0.45fr_1fr_0.75fr_2.4fr_0.7fr] md:items-center"
                  >
                    <span className="text-sm font-black text-beg-lime">
                      #{submission.rank}
                    </span>
                    <span className="font-mono text-sm text-white/[0.78]">
                      {submission.wallet}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {submission.losses}
                    </span>
                    <p className="text-sm leading-6 text-white/[0.62]">
                      {submission.story}
                    </p>
                    <span className="text-left text-sm font-black text-white md:text-right">
                      {submission.votes.toLocaleString()}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
            <section className="glass-surface rounded-lg p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/[0.45]">
                <Clock3 className="h-4 w-4 text-beg-lime" aria-hidden="true" />
                Current Split
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-white/[0.45]">Beg Pool</p>
                  <p className="mt-2 text-2xl font-black">{snapshot.round.pool}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-white/[0.45]">Holder Rewards</p>
                  <p className="mt-2 text-2xl font-black">
                    {snapshot.round.holderRewardPool}
                  </p>
                </div>
              </div>
            </section>

            <section className="glass-surface rounded-lg p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/[0.45]">
                <History className="h-4 w-4 text-beg-lime" aria-hidden="true" />
                Previous Winners
              </div>
              <div className="mt-5 space-y-3">
                {snapshot.previousWinners.map((winner) => (
                  <div
                    key={winner.round}
                    className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-sm font-bold text-white">
                        {winner.wallet}
                      </p>
                      <p className="text-sm font-black text-beg-lime">
                        {winner.payout}
                      </p>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/[0.36]">
                      Round {winner.round}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/[0.58]">
                      {winner.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {snapshot.totals.map((metric) => (
            <MetricTile key={metric.key} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
