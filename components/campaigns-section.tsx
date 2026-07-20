"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Clock3, ExternalLink, FileText, Users } from "lucide-react";
import type { Campaign } from "@/data/campaigns";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import { nativeCampaignFeeCopy } from "@/lib/fee-routing";
import type { DashboardSnapshot } from "@/types/protocol";

function metricValue(snapshot: DashboardSnapshot, key: string) { return snapshot.metrics.find((metric) => metric.key === key)?.value; }
function trackedPosts(snapshot: DashboardSnapshot) { const total = snapshot.submissions.reduce((sum, submission) => { const count = Number.parseInt(submission.status, 10); return sum + (Number.isFinite(count) ? count : 0); }, 0); return total > 0 ? `${total.toLocaleString()}+` : "—"; }
function activeWorkers(snapshot: DashboardSnapshot) { const value = metricValue(snapshot, "current-round"); return value && !value.includes("$POW") ? value : "—"; }

export function CampaignsSection({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const [dashboardResponse, campaignsResponse] = await Promise.all([fetch("/api/dashboard", { cache: "no-store" }), fetch("/api/campaigns", { cache: "no-store" })]);
        if (dashboardResponse.ok && active) setSnapshot((await dashboardResponse.json()) as DashboardSnapshot);
        if (campaignsResponse.ok && active) { const payload = (await campaignsResponse.json()) as { campaigns?: Campaign[] }; setCampaigns(payload.campaigns ?? []); }
      } catch { /* Keep the last server-verified state. */ }
    }
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const campaignCards = useMemo(() => campaigns.map((campaign) => campaign.native ? { ...campaign, name: "WORK Campaign", description: "The native campaign for contributors working to grow $POW.", workers: activeWorkers(snapshot), posts: trackedPosts(snapshot) } : campaign), [campaigns, snapshot]);

  return (
    <section id="campaigns" className="section-space border-b border-[#d8dee4]">
      <div className="site-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="section-kicker">Campaign directory</p><h2 className="section-title mt-3">Who do you work for?</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#62676d]">Choose a funded campaign, create public work, and build a separate score for every coin you support.</p></div>
          <a href="/campaigns/create" className="button-secondary w-full sm:w-auto"><BriefcaseBusiness className="h-4 w-4" />Post a campaign</a>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-2">
          {campaignCards.length ? campaignCards.map((campaign, index) => (
            <motion.article key={campaign.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className={`network-card ${campaign.native ? "lg:col-span-2" : ""}`}>
              <div className="work-cover h-20 opacity-95" />
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="-mt-8 flex items-end justify-between gap-3">
                  {campaign.native ? (
                    <span className="grid h-16 w-16 place-items-center rounded-[7px] border-4 border-white bg-[#0a66c2] text-2xl font-black text-white">W</span>
                  ) : campaign.logo ? (
                    <span className="relative h-16 w-16 overflow-hidden rounded-[7px] border-4 border-white bg-white"><Image src={campaign.logo} alt="" fill sizes="64px" className="object-cover" /></span>
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-[7px] border-4 border-white bg-[#34383c] text-xl font-black text-white">{campaign.mark}</span>
                  )}
                  <span className={`mb-1 rounded-full px-3 py-1 text-xs font-bold ${campaign.status.toLowerCase().includes("live") ? "bg-[#e8f5ef] text-[#147d64]" : "bg-[#edf3f8] text-[#62676d]"}`}>{campaign.status}</span>
                </div>

                <div className={`mt-4 grid gap-6 ${campaign.native ? "lg:grid-cols-[1fr_1fr]" : ""}`}>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#0a66c2]">{campaign.native ? "Featured employer" : "Project campaign"}</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#1f2328]">{campaign.name}</h3>
                    <p className="mt-1 font-bold text-[#62676d]">{campaign.ticker} · {campaign.fundingSource}</p>
                    <p className="mt-4 text-sm leading-6 text-[#62676d]">{campaign.description}</p>
                    {campaign.native ? <p className="mt-3 text-xs leading-5 text-[#62676d]">{nativeCampaignFeeCopy}</p> : null}
                  </div>
                  <div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#e3e7eb] py-4 text-sm">
                      <Metric icon={BriefcaseBusiness} label="Reward pool" value={campaign.rewardPool} />
                      <Metric icon={Users} label="Workers" value={campaign.workers} />
                      <Metric icon={FileText} label="Posts" value={campaign.posts} />
                      <Metric icon={Clock3} label="Remaining" value={campaign.timeRemaining} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <a href={`/campaigns/${campaign.slug}`} className="button-primary">View campaign<ArrowUpRight className="h-4 w-4" /></a>
                      <a href={campaign.solscanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0a66c2] hover:underline">Verify funding<ExternalLink className="h-3.5 w-3.5" /></a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          )) : (
            <div className="network-card px-6 py-14 text-center lg:col-span-2"><p className="text-lg font-bold text-[#1f2328]">No funded campaigns are public right now.</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#62676d]">Campaigns only appear after a real funding wallet has a nonzero live balance.</p></div>
          )}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#747a80]">Funding balances are checked server-side. If verification is unavailable, the balance displays as — rather than an estimate.</p>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="flex items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#62676d]" /><div><p className="font-bold text-[#1f2328]">{value}</p><p className="mt-0.5 text-xs text-[#747a80]">{label}</p></div></div>;
}
