"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Crown, ReceiptText } from "lucide-react";
import type { PayoutFeedData } from "@/types/payouts";

const cycleMs = 15 * 60_000;
function countdown(now: number) { const next = (Math.floor(now / cycleMs) + 1) * cycleMs; const remaining = Math.max(0, next - now); return `${Math.floor(remaining / 60_000).toString().padStart(2, "0")}:${Math.floor((remaining % 60_000) / 1000).toString().padStart(2, "0")}`; }
function relativeTime(value: string, now: number) { const seconds = Math.round((new Date(value).getTime() - now) / 1000); const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" }); if (Math.abs(seconds) < 60) return formatter.format(seconds, "second"); const minutes = Math.round(seconds / 60); if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute"); const hours = Math.round(minutes / 60); if (Math.abs(hours) < 24) return formatter.format(hours, "hour"); return formatter.format(Math.round(hours / 24), "day"); }
function amount(value: number) { return value.toLocaleString(undefined, { maximumFractionDigits: 6 }); }

export function RecentPayouts({ initialData, campaignSlug }: { initialData: PayoutFeedData; campaignSlug?: string }) {
  const [data, setData] = useState(initialData);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true; const endpoint = campaignSlug ? `/api/payouts?campaign=${encodeURIComponent(campaignSlug)}` : "/api/payouts";
    async function refresh() { try { const response = await fetch(endpoint, { cache: "no-store" }); if (response.ok && active) setData((await response.json()) as PayoutFeedData); } catch { /* Retain last confirmed receipts. */ } }
    setNow(Date.now());
    const clock = window.setInterval(() => setNow(Date.now()), 1000); const poll = window.setInterval(refresh, 15_000); refresh();
    return () => { active = false; window.clearInterval(clock); window.clearInterval(poll); };
  }, [campaignSlug]);

  return (
    <section id={campaignSlug ? undefined : "payouts"} className="section-space border-b border-[#d8dee4]">
      <div className="site-shell">
        <div><p className="section-kicker">Verified payment activity</p><h2 className="section-title mt-3">Work paid.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#62676d]">Only confirmed on-chain payouts appear here. Every receipt links to its transaction.</p></div>
        <div className="mt-9 grid gap-4 lg:grid-cols-[0.68fr_1.32fr]">
          <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="network-card p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#fff5e5] text-[#a66b1f]"><Crown className="h-5 w-5" /></span><span className="text-xs font-bold uppercase text-[#62676d]">Top earner</span></div>
            {data.topEarner ? <div className="mt-8"><p className="text-2xl font-extrabold text-[#1f2328]">{data.topEarner.xHandle ? `@${data.topEarner.xHandle}` : data.topEarner.walletLabel}</p><p className="mt-2 text-xl font-extrabold text-[#0a66c2]">{amount(data.topEarner.amount)} $POW</p>{data.topEarner.xHandle ? <p className="mt-2 font-mono text-xs text-[#747a80]">{data.topEarner.walletLabel}</p> : null}</div> : <div className="mt-8"><p className="text-xl font-bold text-[#1f2328]">No top earner yet.</p><p className="mt-2 text-sm leading-6 text-[#62676d]">The first confirmed payout takes this spot.</p></div>}
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="premium-table overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[#d8dee4] bg-[#f8f9fa] px-5 py-4"><div className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-[#0a66c2]" /><p className="font-bold text-[#1f2328]">Recent payouts</p></div><span className="font-mono text-sm font-bold text-[#0a66c2]">NEXT {countdown(now)}</span></div>
            {data.receipts.length ? <div className="divide-y divide-[#e3e7eb]">{data.receipts.map((receipt, index) => <motion.div key={receipt.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.025 }} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_0.75fr_auto] sm:items-center"><div><p className="font-bold text-[#1f2328]">{receipt.xHandle ? `@${receipt.xHandle}` : receipt.walletLabel}</p><p className="mt-1 font-mono text-xs text-[#747a80]">{receipt.walletLabel}</p></div><div><p className="font-bold text-[#0a66c2]">{amount(receipt.amount)} $POW</p><p className="mt-1 text-xs text-[#747a80]">{relativeTime(receipt.paidAt, now)}</p></div><a href={receipt.solscanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#0a66c2] hover:underline">Receipt<ArrowUpRight className="h-4 w-4" /></a></motion.div>)}</div> : <div className="px-6 py-14 text-center"><p className="text-lg font-bold text-[#1f2328]">First payout appears here. Next cycle in {countdown(now)}.</p><p className="mt-2 text-sm text-[#62676d]">Dry runs and unconfirmed transactions never enter the public feed.</p></div>}
          </motion.article>
        </div>
      </div>
    </section>
  );
}
