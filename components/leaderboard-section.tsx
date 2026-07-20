"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Trophy } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import { powMinimumHoldingLabel } from "@/lib/pow-config";
import type { DashboardSnapshot } from "@/types/protocol";

function payoutFor(snapshot: DashboardSnapshot, identity: string) {
  return snapshot.previousWinners.find((winner) => winner.identity === identity)?.payout || "—";
}

export function LeaderboardSection() {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) return;
        const nextSnapshot = (await response.json()) as DashboardSnapshot;
        if (active) {
          setSnapshot(nextSnapshot);
          setLoaded(true);
        }
      } catch {
        if (active) setLoaded(true);
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const rows = useMemo(() => snapshot.submissions.slice(0, 6), [snapshot.submissions]);

  return (
    <section id="leaderboard" className="section-space relative">
      <div className="site-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="section-kicker">$POW Native Leaderboard</p>
            <h2 className="section-title mt-5">The native campaign stays first.</h2>
          </motion.div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white/[0.45]">
            <span className={`h-2 w-2 rounded-full ${rows.length ? "bg-[#4f8cff] shadow-[0_0_16px_rgba(79,140,255,0.9)]" : "bg-white/25"}`} />
            {rows.length ? "Live rankings" : loaded ? "First round pending" : "Loading rankings"}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75 }}
          className="premium-table mt-12 overflow-hidden"
        >
          <div className="hidden grid-cols-[72px_1.1fr_1fr_0.7fr_0.7fr] border-b border-white/[0.08] px-6 py-5 text-xs font-bold uppercase text-white/[0.35] md:grid">
            <span>Rank</span>
            <span>X account</span>
            <span>Minimum</span>
            <span className="text-right">Points</span>
            <span className="text-right">$POW earned</span>
          </div>

          <div className="divide-y divide-white/[0.07]">
            {rows.length ? (
              rows.map((row, index) => (
                <motion.article
                  key={row.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="grid gap-5 px-5 py-6 transition hover:bg-white/[0.035] md:grid-cols-[72px_1.1fr_1fr_0.7fr_0.7fr] md:items-center md:px-6"
                >
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    {index === 0 && <Trophy className="h-4 w-4 text-[#76a2ff]" aria-hidden="true" />}
                    #{row.rank}
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold text-white/30 md:hidden">X account</span>
                    <span className="font-bold text-white">{row.lane}</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold text-white/30 md:hidden">Minimum</span>
                    <span className={`text-sm font-bold ${row.eligible ? "text-[#8db3ff]" : "text-white/35"}`}>
                      {row.eligibility}
                    </span>
                  </div>
                  <div className="md:text-right">
                    <span className="mb-1 block text-xs font-semibold text-white/30 md:hidden">Points</span>
                    <span className="font-extrabold text-white">{row.score || row.status}</span>
                  </div>
                  <div className="md:text-right">
                    <span className="mb-1 block text-xs font-semibold text-white/30 md:hidden">$POW earned</span>
                    <span className="font-extrabold text-[#8db3ff]">{payoutFor(snapshot, row.lane)}</span>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="px-6 py-16 text-center sm:py-20">
                <p className="text-xl font-extrabold text-white">The leaderboard starts with the first verified worker.</p>
                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-white/[0.45]">
                  Hold {powMinimumHoldingLabel}, connect your X, and make every post count.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-5 flex flex-col justify-between gap-4 text-sm text-white/40 sm:flex-row sm:items-center">
          <p>This leaderboard only tracks work performed for the native $POW campaign.</p>
          <a href="/campaigns/pow" className="inline-flex items-center gap-2 font-bold text-white/70 transition hover:text-white">
            View native campaign
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
