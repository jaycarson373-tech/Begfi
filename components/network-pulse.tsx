"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Crown, Eye, ReceiptText, UsersRound } from "lucide-react";
import type { Campaign } from "@/data/campaigns";
import { getDashboardSnapshot } from "@/lib/protocol-data";
import type { PayoutFeedData } from "@/types/payouts";
import type { DashboardSnapshot } from "@/types/protocol";

function metricValue(snapshot: DashboardSnapshot, key: string) {
  return snapshot.metrics.find((metric) => metric.key === key)?.value ?? "—";
}

function totalValue(snapshot: DashboardSnapshot, key: string) {
  return snapshot.totals.find((metric) => metric.key === key)?.value ?? "—";
}

function formatAmount(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function NetworkPulse({
  initialCampaigns,
  initialPayoutFeed
}: {
  initialCampaigns: Campaign[];
  initialPayoutFeed: PayoutFeedData;
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [payoutFeed, setPayoutFeed] = useState(initialPayoutFeed);
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const [dashboardResponse, campaignsResponse, payoutsResponse] = await Promise.all([
          fetch("/api/dashboard", { cache: "no-store" }),
          fetch("/api/campaigns", { cache: "no-store" }),
          fetch("/api/payouts", { cache: "no-store" })
        ]);

        if (!active) return;
        if (dashboardResponse.ok) setSnapshot((await dashboardResponse.json()) as DashboardSnapshot);
        if (campaignsResponse.ok) {
          const payload = (await campaignsResponse.json()) as { campaigns?: Campaign[] };
          setCampaigns(payload.campaigns ?? []);
        }
        if (payoutsResponse.ok) setPayoutFeed((await payoutsResponse.json()) as PayoutFeedData);
        if (dashboardResponse.ok || campaignsResponse.ok || payoutsResponse.ok) setUpdatedAt(Date.now());
      } catch {
        // Keep the most recent server-verified state visible.
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const stats = useMemo(() => [
    { label: "Funded campaigns", value: campaigns.length.toLocaleString(), icon: BriefcaseBusiness },
    { label: "Verified workers", value: totalValue(snapshot, "verified-work"), icon: UsersRound },
    { label: "Tracked X views", value: metricValue(snapshot, "x-views"), icon: Eye },
    { label: "Total $POW paid", value: totalValue(snapshot, "pow-paid"), icon: ReceiptText }
  ], [campaigns.length, snapshot]);

  const latestReceipt = payoutFeed.receipts[0] ?? null;

  return (
    <section className="border-b border-[#d8dee4] bg-white py-6 sm:py-8" aria-labelledby="network-pulse-title">
      <div className="site-shell">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#147d64] shadow-[0_0_0_4px_rgba(20,125,100,0.12)]" />
            <p id="network-pulse-title" className="text-xs font-extrabold uppercase text-[#34383c]">WORK network proof</p>
          </div>
          <p className="text-xs text-[#747a80]">Verified server data · refreshes every 15 seconds{updatedAt ? "" : " · connecting"}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.6fr]">
          <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="network-card flex min-h-[184px] flex-col justify-between p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-[#a66b1f]" /><span className="text-xs font-extrabold uppercase text-[#62676d]">Top confirmed earner</span></div>
              <BadgeCheck className="h-5 w-5 text-[#0a66c2]" />
            </div>
            {payoutFeed.topEarner ? (
              <div className="mt-8">
                <p className="truncate text-2xl font-extrabold text-[#1f2328]">{payoutFeed.topEarner.xHandle ? `@${payoutFeed.topEarner.xHandle}` : payoutFeed.topEarner.walletLabel}</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <p className="text-xl font-extrabold text-[#0a66c2]">{formatAmount(payoutFeed.topEarner.amount)} $POW</p>
                  <a href="#payouts" className="inline-flex items-center gap-1 text-sm font-bold text-[#0a66c2] hover:underline">See receipts<ArrowUpRight className="h-4 w-4" /></a>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-xl font-extrabold text-[#1f2328]">No top earner yet.</p>
                <p className="mt-2 text-sm leading-6 text-[#62676d]">The first confirmed on-chain payout takes this position.</p>
              </div>
            )}
          </motion.article>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.article key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }} className="network-card min-h-[126px] p-4 sm:p-5">
                  <Icon className="h-4 w-4 text-[#0a66c2]" />
                  <p className="mt-6 break-words text-2xl font-extrabold text-[#1f2328]">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-[#62676d]">{stat.label}</p>
                </motion.article>
              );
            })}
            <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap items-center justify-between gap-3 rounded-[7px] border border-[#c8def3] bg-[#eef6fd] px-4 py-3 text-xs text-[#41576d]">
              <span>{latestReceipt ? `Latest confirmed receipt: ${formatAmount(latestReceipt.amount)} $POW to ${latestReceipt.xHandle ? `@${latestReceipt.xHandle}` : latestReceipt.walletLabel}` : "No confirmed payout receipt has been published yet."}</span>
              {latestReceipt ? <a href={latestReceipt.solscanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#0a66c2] hover:underline">Verify transaction<ArrowUpRight className="h-3.5 w-3.5" /></a> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
