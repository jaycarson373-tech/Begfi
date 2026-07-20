"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Clock3, ExternalLink, FileText, Search, SlidersHorizontal, Users } from "lucide-react";
import type { Campaign } from "@/data/campaigns";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import { nativeCampaignFeeCopy } from "@/lib/fee-routing";
import type { DashboardSnapshot } from "@/types/protocol";

function metricValue(snapshot: DashboardSnapshot, key: string) { return snapshot.metrics.find((metric) => metric.key === key)?.value; }
function trackedPosts(snapshot: DashboardSnapshot) { const total = snapshot.submissions.reduce((sum, submission) => { const count = Number.parseInt(submission.status, 10); return sum + (Number.isFinite(count) ? count : 0); }, 0); return total > 0 ? `${total.toLocaleString()}+` : "—"; }
function activeWorkers(snapshot: DashboardSnapshot) { const value = metricValue(snapshot, "current-round"); return value && !value.includes("$POW") ? value : "—"; }
function workerCount(value: string) { const parsed = Number.parseInt(value.replace(/,/g, ""), 10); return Number.isFinite(parsed) ? parsed : -1; }
function timeRemaining(value: string) { const normalized = value.toLowerCase(); if (normalized.includes("ongoing")) return Number.POSITIVE_INFINITY; const days = Number.parseInt(normalized.match(/(\d+)\s*d/)?.[1] ?? "0", 10); const hours = Number.parseInt(normalized.match(/(\d+)\s*h/)?.[1] ?? "0", 10); return (days * 24) + hours || Number.POSITIVE_INFINITY; }

type SortKey = "featured" | "funding" | "workers" | "ending";

export function CampaignsSection({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

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
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("campaign") ?? "");
    const timer = window.setInterval(refresh, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const campaignCards = useMemo(() => campaigns.map((campaign) => campaign.native ? { ...campaign, name: "WORK Campaign", description: "The native campaign for contributors working to grow $POW.", workers: activeWorkers(snapshot), posts: trackedPosts(snapshot) } : campaign), [campaigns, snapshot]);
  const visibleCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? campaignCards.filter((campaign) => [campaign.name, campaign.ticker, campaign.keyword, campaign.description].some((value) => value.toLowerCase().includes(normalizedQuery)))
      : [...campaignCards];

    return filtered.sort((left, right) => {
      if (sort === "funding") return (right.fundingBalance ?? -1) - (left.fundingBalance ?? -1);
      if (sort === "workers") return workerCount(right.workers) - workerCount(left.workers);
      if (sort === "ending") return timeRemaining(left.timeRemaining) - timeRemaining(right.timeRemaining);
      if (left.native !== right.native) return left.native ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
  }, [campaignCards, query, sort]);

  return (
    <section id="campaigns" className="section-space border-b border-[#d8dee4]">
      <div className="site-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="section-kicker">The WORK board</p><h2 className="section-title mt-3">Who do you work for?</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#62676d]">Every campaign on this board has verifiable funding. Pick one, use its campaign tag, and build a separate score for that coin.</p></div>
          <a href="/campaigns/create" className="button-secondary w-full sm:w-auto"><BriefcaseBusiness className="h-4 w-4" />Launch a campaign</a>
        </div>

        <div className="network-card mt-8 p-3 sm:p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#62676d]" aria-hidden="true" />
              <span className="sr-only">Search the WORK board</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-10" placeholder="Search by coin, ticker, or campaign tag" />
            </label>
            <label className="relative block">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#62676d]" aria-hidden="true" />
              <span className="sr-only">Sort campaigns</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="form-input appearance-none pl-10">
                <option value="featured">Featured first</option>
                <option value="funding">Largest funding</option>
                <option value="workers">Most workers</option>
                <option value="ending">Ending soon</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#62676d]">
            <span><strong className="text-[#1f2328]">{visibleCampaigns.length}</strong> funded {visibleCampaigns.length === 1 ? "campaign" : "campaigns"}</span>
            <span>Funding checked server-side through Helius</span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {visibleCampaigns.length ? visibleCampaigns.map((campaign, index) => (
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
                    <p className="mt-3 inline-flex rounded-full bg-[#edf3f8] px-3 py-1 text-xs font-bold text-[#41576d]">Track: {campaign.keyword}</p>
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
            <div className="network-card px-6 py-14 text-center lg:col-span-2"><p className="text-lg font-bold text-[#1f2328]">{campaignCards.length ? "No campaigns match that search." : "No funded campaigns are public right now."}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#62676d]">{campaignCards.length ? "Try a coin name, ticker, or campaign tag." : "Campaigns only appear after a real funding wallet has a nonzero live balance."}</p></div>
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
