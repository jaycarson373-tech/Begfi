"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Clock3, ExternalLink, FileText, Radio, Users } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RecentPayouts } from "@/components/recent-payouts";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import type { Campaign, CampaignLeaderboardRow } from "@/data/campaigns";
import type { DashboardSnapshot } from "@/types/protocol";
import { powCommunityUrl } from "@/lib/pow-config";
import type { PayoutFeedData } from "@/types/payouts";

function metricValue(snapshot: DashboardSnapshot, key: string) {
  return snapshot.metrics.find((metric) => metric.key === key)?.value;
}

function trackedPosts(snapshot: DashboardSnapshot) {
  const total = snapshot.submissions.reduce((sum, submission) => {
    const count = Number.parseInt(submission.status, 10);
    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);
  return total > 0 ? `${total.toLocaleString()}+` : "—";
}

function activeWorkers(snapshot: DashboardSnapshot) {
  const value = metricValue(snapshot, "current-round");
  return value && !value.includes("$POW") ? value : "—";
}

function nativeRows(snapshot: DashboardSnapshot): CampaignLeaderboardRow[] {
  return snapshot.submissions.map((submission) => ({
    rank: submission.rank,
    xAccount: submission.lane,
    eligibility: submission.eligibility,
    score: submission.score || submission.status,
    estimatedReward: "Calculated at payout"
  }));
}

export function CampaignDetail({
  campaign,
  initialPayoutFeed
}: {
  campaign: Campaign;
  initialPayoutFeed: PayoutFeedData;
}) {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [previewJoined, setPreviewJoined] = useState(false);

  useEffect(() => {
    if (!campaign.native) return;
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) return;
        const nextSnapshot = (await response.json()) as DashboardSnapshot;
        if (active) setSnapshot(nextSnapshot);
      } catch {
        // The native page keeps launch placeholders until the live API responds.
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [campaign.native]);

  const display = useMemo(
    () =>
      campaign.native
        ? {
            ...campaign,
            workers: activeWorkers(snapshot),
            posts: trackedPosts(snapshot),
            engagement: metricValue(snapshot, "x-views") || campaign.engagement,
            leaderboard: nativeRows(snapshot)
          }
        : campaign,
    [campaign, snapshot]
  );

  const metrics = [
    { label: "Funding Pool", value: display.rewardPool, icon: Radio },
    { label: "Verified Workers", value: display.workers, icon: Users },
    { label: "Posts Tracked", value: display.posts, icon: FileText },
    { label: "Total Engagement", value: display.engagement, icon: BadgeCheck },
    { label: "Time Remaining", value: display.timeRemaining, icon: Clock3 },
    { label: "Campaign Status", value: display.status, icon: Radio }
  ];

  return (
    <div className="relative isolate overflow-hidden">
      <SiteHeader />
      <main className="relative min-h-screen pb-20 pt-28 sm:pt-32">
        <div className="absolute inset-x-0 top-0 h-[48rem] overflow-hidden">
          <AmbientBackground />
        </div>
        <div className="site-shell relative z-10">
          <a href="/#campaigns" className="inline-flex items-center gap-2 text-sm font-bold text-white/[0.45] transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All campaigns
          </a>

          <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <div className="flex items-center gap-4">
                {display.logo ? (
                  <span className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/[0.15] bg-[#0a37a4]">
                    <Image src={display.logo} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-lg border border-[#5f95ff]/25 bg-[#1e5eff]/[0.15] text-2xl font-black text-white">{display.mark}</span>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#5f95ff]/25 bg-[#1e5eff]/10 px-3 py-1 text-[0.65rem] font-black uppercase text-[#a8c4ff]">{display.native ? "Native Campaign" : "Demo Campaign"}</span>
                    <span className="text-xs font-bold text-white/[0.35]">{display.fundingSource}</span>
                  </div>
                  <p className="mt-2 font-black text-[#8db3ff]">{display.ticker}</p>
                </div>
              </div>
              <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.96] text-white sm:text-7xl">{display.name}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/50">{display.description}</p>
              {!display.native && <p className="mt-4 text-sm font-bold text-[#9fbdff]">Preview only. This project funds the campaign in {display.fundingAsset}; worker payouts are settled in $POW.</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }} className="premium-card p-6">
              <p className="text-xs font-extrabold uppercase text-[#7fa8ff]">Campaign funding</p>
              <p className="mt-4 text-5xl font-black text-white">{display.rewardPool}</p>
              <p className="mt-3 text-sm text-white/40">{display.fundingSource} · Rewards paid in {display.payoutAsset}</p>
              <p className="mt-5 break-all font-mono text-xs leading-5 text-white/45">{display.fundingWallet}</p>
              <a href={display.solscanUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-[#8ac5ff] transition hover:text-white">
                {display.native ? "Reward wallet — verify it yourself." : "Verify on Solscan"}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              {display.native ? (
                <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="button-primary mt-7 w-full">Apply in X Community<ArrowUpRight className="h-4 w-4" /></a>
              ) : (
                <button type="button" onClick={() => setPreviewJoined(true)} className="button-primary mt-7 w-full">{previewJoined ? "Preview Joined" : "Join Campaign"}<ArrowUpRight className="h-4 w-4" /></button>
              )}
              {previewJoined && <p className="mt-3 text-center text-xs leading-5 text-white/[0.35]">Demo action only. No account, score, or payout was created.</p>}
            </motion.div>
          </section>

          <section className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.article key={metric.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="market-panel p-5">
                  <Icon className="h-4 w-4 text-[#7fa8ff]" aria-hidden="true" />
                  <p className="mt-5 text-xl font-black text-white">{metric.value}</p>
                  <p className="mt-2 text-xs text-white/[0.35]">{metric.label}</p>
                </motion.article>
              );
            })}
          </section>

          <section className="mt-20 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="grid gap-5">
              <article className="premium-card p-6 sm:p-7">
                <p className="section-kicker">Campaign Rules</p>
                <ul className="mt-6 grid gap-4 text-sm leading-6 text-white/[0.55]">
                  {display.eligibility.map((rule) => <li key={rule} className="flex gap-3"><BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-[#7fa8ff]" />{rule}</li>)}
                </ul>
              </article>
              <article className="premium-card p-6 sm:p-7">
                <p className="section-kicker">Distribution</p>
                <dl className="mt-6 grid gap-5 text-sm">
                  <div><dt className="text-white/30">Schedule</dt><dd className="mt-1 font-bold text-white/70">{display.schedule}</dd></div>
                  <div><dt className="text-white/30">Winners</dt><dd className="mt-1 font-bold text-white/70">{display.winners}</dd></div>
                  <div><dt className="text-white/30">Reward split</dt><dd className="mt-1 font-bold text-white/70">{display.rewardSplit}</dd></div>
                  <div><dt className="text-white/30">Payout asset</dt><dd className="mt-1 font-bold text-white/70">{display.payoutAsset}</dd></div>
                  <div><dt className="text-white/30">Campaign tag</dt><dd className="mt-1 font-bold text-white/70">{display.keyword}</dd></div>
                </dl>
              </article>
            </div>

            <article className="premium-table overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div><p className="font-black text-white">Live Leaderboard</p><p className="mt-1 text-xs text-white/[0.35]">Scores are isolated to this campaign.</p></div>
                {display.demo && <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-black uppercase text-white/[0.35]">Preview Data</span>}
              </div>
              <div className="hidden grid-cols-[70px_1fr_1fr_0.7fr_0.8fr] border-b border-white/[0.07] px-6 py-3 text-xs font-bold uppercase text-white/30 md:grid">
                <span>Rank</span><span>X Account</span><span>Minimum</span><span className="text-right">Score</span><span className="text-right">Estimated $POW</span>
              </div>
              <div className="divide-y divide-white/[0.07]">
                {display.leaderboard.length ? display.leaderboard.map((row) => (
                  <div key={`${row.rank}-${row.xAccount}`} className="grid gap-4 px-5 py-5 md:grid-cols-[70px_1fr_1fr_0.7fr_0.8fr] md:items-center md:px-6">
                    <span className="font-black text-[#8db3ff]">#{row.rank}</span>
                    <span className="font-bold text-white">{row.xAccount}</span>
                    <span className="text-sm font-bold text-white/[0.45]">{row.eligibility}</span>
                    <span className="font-black text-white md:text-right">{row.score}</span>
                    <span className="font-black text-[#9fbdff] md:text-right">{row.estimatedReward}</span>
                  </div>
                )) : (
                  <div className="px-6 py-16 text-center"><p className="text-lg font-black text-white">Leaderboard opens with the first verified worker.</p><p className="mt-2 text-sm text-white/40">Estimated $POW rewards appear when campaign funding and the scoring window are available.</p></div>
                )}
              </div>
            </article>
          </section>

          <section className="mt-8 rounded-lg border border-[#5f95ff]/20 bg-[#1e5eff]/10 px-5 py-5 text-sm leading-7 text-[#b4ccff]">
            Workers may participate in multiple campaigns. Social and on-chain activity is scored separately for each campaign, so performance here never changes rank anywhere else.
          </section>
        </div>
        <RecentPayouts initialData={initialPayoutFeed} campaignSlug={campaign.slug} />
      </main>
      <SiteFooter />
    </div>
  );
}
