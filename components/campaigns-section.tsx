"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock3, ExternalLink, FileText, Users } from "lucide-react";
import type { Campaign } from "@/data/campaigns";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import type { DashboardSnapshot } from "@/types/protocol";

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

export function CampaignsSection({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const [dashboardResponse, campaignsResponse] = await Promise.all([
          fetch("/api/dashboard", { cache: "no-store" }),
          fetch("/api/campaigns", { cache: "no-store" })
        ]);
        if (dashboardResponse.ok) {
          const nextSnapshot = (await dashboardResponse.json()) as DashboardSnapshot;
          if (active) setSnapshot(nextSnapshot);
        }
        if (campaignsResponse.ok) {
          const payload = (await campaignsResponse.json()) as { campaigns?: Campaign[] };
          if (active) setCampaigns(payload.campaigns ?? []);
        }
      } catch {
        // Keep the last server-verified state when a refresh is unavailable.
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const campaignCards = useMemo(
    () =>
      campaigns.map((campaign) =>
        campaign.native
          ? {
              ...campaign,
              workers: activeWorkers(snapshot),
              posts: trackedPosts(snapshot)
            }
          : campaign
      ),
    [campaigns, snapshot]
  );

  return (
    <section id="campaigns" className="section-space relative border-y border-white/[0.06]">
      <div className="site-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="section-kicker">Live Campaigns</p>
            <h2 className="section-title mt-5">Pick a campaign. Prove your work.</h2>
          </motion.div>
          <a href="/campaigns/create" className="button-secondary w-full sm:w-auto">
            Launch a Campaign
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {campaignCards.length ? campaignCards.map((campaign, index) => (
            <motion.article
              key={campaign.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.07 }}
              whileHover={{ y: -5 }}
              className={`premium-card p-6 sm:p-8 ${campaign.native ? "lg:col-span-2" : ""}`}
            >
              <div className={`grid gap-8 ${campaign.native ? "lg:grid-cols-[1fr_1.15fr] lg:items-end" : ""}`}>
                <div>
                  <div className="flex items-start gap-4">
                    {campaign.logo ? (
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.15] bg-[#0a37a4]">
                        <Image src={campaign.logo} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-[#5f95ff]/25 bg-[#1e5eff]/[0.15] text-xl font-black text-white">
                        {campaign.mark}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#5f95ff]/25 bg-[#1e5eff]/10 px-2.5 py-1 text-[0.65rem] font-black uppercase text-[#9fbdff]">
                          {campaign.native ? "Native Campaign" : "Project Campaign"}
                        </span>
                        <span className="text-xs font-bold text-white/[0.35]">{campaign.status}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">{campaign.name}</h3>
                      <p className="mt-1 font-extrabold text-[#8db3ff]">{campaign.ticker}</p>
                    </div>
                  </div>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/50">{campaign.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold text-white/40">
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">{campaign.fundingSource} · {campaign.fundingAsset}</span>
                    <a href={campaign.solscanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#8ac5ff] transition hover:text-white">
                      Verify on Solscan <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div>
                  <div className={`grid gap-3 ${campaign.native ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-xs text-white/30">Funding pool</p>
                      <p className="mt-2 text-xl font-black text-white">{campaign.rewardPool}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="flex items-center gap-1.5 text-xs text-white/30"><Users className="h-3.5 w-3.5" /> Workers</p>
                      <p className="mt-2 text-xl font-black text-white">{campaign.workers}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="flex items-center gap-1.5 text-xs text-white/30"><FileText className="h-3.5 w-3.5" /> Posts</p>
                      <p className="mt-2 text-xl font-black text-white">{campaign.posts}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="flex items-center gap-1.5 text-xs text-white/30"><Clock3 className="h-3.5 w-3.5" /> Remaining</p>
                      <p className="mt-2 text-xl font-black text-white">{campaign.timeRemaining}</p>
                    </div>
                    <div className={`rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 ${campaign.native ? "" : "col-span-2"}`}>
                      <p className="text-xs text-white/30">Worker rewards</p>
                      <p className="mt-2 text-xl font-black text-white">Paid in {campaign.payoutAsset}</p>
                    </div>
                  </div>
                  <a href={`/campaigns/${campaign.slug}`} className="button-primary mt-5 w-full">
                    View Campaign
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.article>
          )) : (
            <div className="premium-card px-6 py-16 text-center lg:col-span-2">
              <p className="text-xl font-black text-white">No funded campaigns are public right now.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">A campaign appears only after its reward wallet is configured and holds a nonzero balance.</p>
            </div>
          )}
        </div>

        <p className="mt-5 text-sm leading-6 text-white/[0.35]">
          Every listed campaign has a dedicated funding wallet. Live balance checks are server-side; unavailable balances display as —.
        </p>
      </div>
    </section>
  );
}
