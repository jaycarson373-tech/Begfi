"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BadgeCheck, BriefcaseBusiness, Clock3, ExternalLink, FileText, Radio, Users } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RecentPayouts } from "@/components/recent-payouts";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import type { Campaign, CampaignLeaderboardRow } from "@/data/campaigns";
import type { DashboardSnapshot } from "@/types/protocol";
import { powCommunityUrl } from "@/lib/pow-config";
import type { PayoutFeedData } from "@/types/payouts";

function metricValue(snapshot: DashboardSnapshot, key: string) { return snapshot.metrics.find((metric) => metric.key === key)?.value; }
function trackedPosts(snapshot: DashboardSnapshot) { const total = snapshot.submissions.reduce((sum, submission) => { const count = Number.parseInt(submission.status, 10); return sum + (Number.isFinite(count) ? count : 0); }, 0); return total > 0 ? `${total.toLocaleString()}+` : "—"; }
function activeWorkers(snapshot: DashboardSnapshot) { const value = metricValue(snapshot, "current-round"); return value && !value.includes("$POW") ? value : "—"; }
function nativeRows(snapshot: DashboardSnapshot): CampaignLeaderboardRow[] { return snapshot.submissions.map((submission) => ({ rank: submission.rank, xAccount: submission.lane, eligibility: submission.eligibility, score: submission.score || submission.status, estimatedReward: "Calculated at payout" })); }

export function CampaignDetail({ campaign, initialPayoutFeed }: { campaign: Campaign; initialPayoutFeed: PayoutFeedData }) {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [previewJoined, setPreviewJoined] = useState(false);

  useEffect(() => {
    if (!campaign.native) return;
    let active = true;
    async function refresh() { try { const response = await fetch("/api/dashboard", { cache: "no-store" }); if (response.ok && active) setSnapshot((await response.json()) as DashboardSnapshot); } catch { /* Keep last verified state. */ } }
    refresh(); const timer = window.setInterval(refresh, 30_000); return () => { active = false; window.clearInterval(timer); };
  }, [campaign.native]);

  const display = useMemo(() => campaign.native ? { ...campaign, name: "WORK Campaign", description: "The native campaign for contributors working to grow $POW.", workers: activeWorkers(snapshot), posts: trackedPosts(snapshot), engagement: metricValue(snapshot, "x-views") || campaign.engagement, leaderboard: nativeRows(snapshot) } : campaign, [campaign, snapshot]);
  const metrics = [
    { label: "Funding pool", value: display.rewardPool, icon: Radio }, { label: "Verified workers", value: display.workers, icon: Users }, { label: "Posts tracked", value: display.posts, icon: FileText }, { label: "Engagement", value: display.engagement, icon: BadgeCheck }, { label: "Time remaining", value: display.timeRemaining, icon: Clock3 }, { label: "Status", value: display.status, icon: BriefcaseBusiness }
  ];

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <SiteHeader />
      <main className="pb-16 pt-20 sm:pt-24">
        <div className="site-shell">
          <a href="/#campaigns" className="inline-flex items-center gap-2 py-3 text-sm font-bold text-[#0a66c2] hover:underline"><ArrowLeft className="h-4 w-4" />All campaigns</a>

          <section className="network-card mt-2">
            <div className="work-cover work-dot-grid h-36 sm:h-44" />
            <div className="px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  {display.native ? <span className="grid h-28 w-28 place-items-center rounded-[8px] border-4 border-white bg-[#0a66c2] text-4xl font-black text-white">W</span> : display.logo ? <span className="relative block h-28 w-28 overflow-hidden rounded-[8px] border-4 border-white bg-white"><Image src={display.logo} alt="" fill sizes="112px" className="object-cover" /></span> : <span className="grid h-28 w-28 place-items-center rounded-[8px] border-4 border-white bg-[#34383c] text-3xl font-black text-white">{display.mark}</span>}
                  <p className="mt-5 text-xs font-extrabold uppercase text-[#0a66c2]">{display.native ? "Featured WORK campaign" : "Project campaign"}</p>
                  <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#1f2328] sm:text-5xl">{display.name}</h1>
                  <p className="mt-2 font-bold text-[#62676d]">{display.ticker} · {display.fundingSource}</p>
                </div>
                {display.native ? <a href={powCommunityUrl} target="_blank" rel="noreferrer" className="button-primary">Work for this coin<ArrowUpRight className="h-4 w-4" /></a> : <button type="button" onClick={() => setPreviewJoined(true)} className="button-primary">{previewJoined ? "Preview joined" : "Work for this coin"}<ArrowUpRight className="h-4 w-4" /></button>}
              </div>
              <p className="mt-6 max-w-3xl text-base leading-7 text-[#62676d]">{display.description}</p>
              {previewJoined ? <p className="mt-3 text-xs text-[#747a80]">Demo action only. No profile, score, or payout was created.</p> : null}
            </div>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              <div className="network-card grid grid-cols-2 sm:grid-cols-3">
                {metrics.map((metric) => { const Icon = metric.icon; return <div key={metric.label} className="border-b border-r border-[#e3e7eb] p-4 sm:p-5"><Icon className="h-4 w-4 text-[#0a66c2]" /><p className="mt-3 text-lg font-extrabold text-[#1f2328]">{metric.value}</p><p className="mt-1 text-xs text-[#747a80]">{metric.label}</p></div>; })}
              </div>

              <article className="premium-table overflow-hidden">
                <div className="border-b border-[#d8dee4] bg-[#f8f9fa] px-5 py-4"><p className="font-bold text-[#1f2328]">Workers at this company</p><p className="mt-1 text-xs text-[#747a80]">This ranking is isolated to {display.ticker}.</p></div>
                <div className="hidden grid-cols-[60px_1fr_1fr_0.7fr_0.9fr] border-b border-[#e3e7eb] px-5 py-3 text-xs font-bold uppercase text-[#747a80] md:grid"><span>Rank</span><span>Worker</span><span>Eligibility</span><span className="text-right">Score</span><span className="text-right">Estimated</span></div>
                <div className="divide-y divide-[#e3e7eb]">
                  {display.leaderboard.length ? display.leaderboard.map((row) => (
                    <div key={`${row.rank}-${row.xAccount}`} className="grid gap-3 px-5 py-4 md:grid-cols-[60px_1fr_1fr_0.7fr_0.9fr] md:items-center">
                      <span className="font-bold text-[#62676d]">#{row.rank}</span><span className="font-bold text-[#1f2328]">{row.xAccount}</span><span className="text-sm text-[#62676d]">{row.eligibility}</span><span className="font-bold text-[#1f2328] md:text-right">{row.score}</span><span className="font-bold text-[#0a66c2] md:text-right">{row.estimatedReward}</span>
                    </div>
                  )) : <div className="px-6 py-12 text-center"><p className="font-bold text-[#1f2328]">The first verified worker starts this team.</p><p className="mt-2 text-sm text-[#62676d]">Rewards appear when campaign funding and scoring are available.</p></div>}
                </div>
              </article>
            </div>

            <aside className="grid content-start gap-4">
              <article className="network-card p-5"><p className="text-xs font-extrabold uppercase text-[#62676d]">Funding</p><p className="mt-3 text-3xl font-extrabold text-[#1f2328]">{display.rewardPool}</p><p className="mt-2 text-sm text-[#62676d]">Rewards paid in {display.payoutAsset}</p><p className="mt-4 break-all font-mono text-xs leading-5 text-[#747a80]">{display.fundingWallet}</p><a href={display.solscanUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#0a66c2] hover:underline">Verify funding<ExternalLink className="h-4 w-4" /></a></article>
              <article className="network-card p-5"><p className="text-xs font-extrabold uppercase text-[#62676d]">Campaign policy</p><ul className="mt-4 grid gap-3 text-sm leading-6 text-[#62676d]">{display.eligibility.map((rule) => <li key={rule} className="flex gap-2"><BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-[#0a66c2]" />{rule}</li>)}</ul><dl className="mt-5 grid gap-3 border-t border-[#e3e7eb] pt-4 text-sm"><div><dt className="text-[#747a80]">Schedule</dt><dd className="font-bold text-[#34383c]">{display.schedule}</dd></div><div><dt className="text-[#747a80]">Campaign tag</dt><dd className="font-bold text-[#34383c]">{display.keyword}</dd></div><div><dt className="text-[#747a80]">Reward split</dt><dd className="font-bold text-[#34383c]">{display.rewardSplit}</dd></div></dl></article>
            </aside>
          </section>
        </div>
        <RecentPayouts initialData={initialPayoutFeed} campaignSlug={campaign.slug} />
      </main>
      <SiteFooter />
    </div>
  );
}
