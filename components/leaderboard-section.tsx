"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Trophy } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import { powMinimumHoldingLabel } from "@/lib/pow-config";
import type { DashboardSnapshot } from "@/types/protocol";

function payoutFor(snapshot: DashboardSnapshot, identity: string) { return snapshot.previousWinners.find((winner) => winner.identity === identity)?.payout || "—"; }

export function LeaderboardSection() {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try { const response = await fetch("/api/dashboard", { cache: "no-store" }); if (!response.ok) return; const next = (await response.json()) as DashboardSnapshot; if (active) { setSnapshot(next); setLoaded(true); } } catch { if (active) setLoaded(true); }
    }
    refresh(); const timer = window.setInterval(refresh, 30_000); return () => { active = false; window.clearInterval(timer); };
  }, []);

  const rows = useMemo(() => snapshot.submissions.slice(0, 8), [snapshot.submissions]);

  return (
    <section id="leaderboard" className="section-space border-b border-[#d8dee4] bg-white">
      <div className="site-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="section-kicker">Worker network</p><h2 className="section-title mt-3">People doing the work.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#62676d]">A public, wallet-private ranking of verified contributors in the native $POW campaign.</p></div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#62676d]"><span className={`h-2 w-2 rounded-full ${rows.length ? "bg-[#147d64]" : "bg-[#aeb7c0]"}`} />{rows.length ? "Live rankings" : loaded ? "First round pending" : "Loading"}</div>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="premium-table mt-9 overflow-hidden">
          <div className="hidden grid-cols-[64px_1.2fr_1fr_0.7fr_0.8fr] border-b border-[#d8dee4] bg-[#f8f9fa] px-5 py-3 text-xs font-bold uppercase text-[#62676d] md:grid"><span>Rank</span><span>Worker</span><span>Eligibility</span><span className="text-right">Points</span><span className="text-right">Earned</span></div>
          <div className="divide-y divide-[#e3e7eb]">
            {rows.length ? rows.map((row, index) => (
              <motion.article key={row.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.035 }} className="grid gap-4 px-5 py-5 transition hover:bg-[#f8f9fa] md:grid-cols-[64px_1.2fr_1fr_0.7fr_0.8fr] md:items-center">
                <div className="font-bold text-[#62676d]">#{row.rank}</div>
                <div className="flex items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${index === 0 ? "bg-[#e7f3ff] text-[#0a66c2]" : "bg-[#edf3f8] text-[#62676d]"}`}>{index === 0 ? <Trophy className="h-4 w-4" /> : row.lane.replace("@", "").slice(0, 1).toUpperCase()}</span><div><p className="font-bold text-[#1f2328]">{row.lane}</p><p className="mt-0.5 text-xs text-[#747a80]">Works for $POW</p></div></div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${row.eligible ? "text-[#147d64]" : "text-[#747a80]"}`}>{row.eligible ? <BadgeCheck className="h-4 w-4" /> : null}{row.eligibility}</div>
                <div className="font-bold text-[#1f2328] md:text-right">{row.score || row.status}</div>
                <div className="font-bold text-[#0a66c2] md:text-right">{payoutFor(snapshot, row.lane)}</div>
              </motion.article>
            )) : (
              <div className="px-6 py-14 text-center"><p className="text-lg font-bold text-[#1f2328]">The network starts with the first verified worker.</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#62676d]">Hold {powMinimumHoldingLabel}, connect X, and publish your work.</p></div>
            )}
          </div>
        </motion.div>
        <div className="mt-4 flex flex-col gap-3 text-sm text-[#62676d] sm:flex-row sm:items-center sm:justify-between"><p>Scores shown here apply only to the native $POW campaign.</p><a href="/campaigns/pow" className="inline-flex items-center gap-2 font-bold text-[#0a66c2] hover:underline">Open company page<ArrowUpRight className="h-4 w-4" /></a></div>
      </div>
    </section>
  );
}
