"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Crown, ReceiptText } from "lucide-react";
import type { PayoutFeedData } from "@/types/payouts";

const cycleMs = 15 * 60_000;

function countdown(now: number) {
  const nextCycle = (Math.floor(now / cycleMs) + 1) * cycleMs;
  const remaining = Math.max(0, nextCycle - now);
  const minutes = Math.floor(remaining / 60_000).toString().padStart(2, "0");
  const seconds = Math.floor((remaining % 60_000) / 1000).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function relativeTime(value: string, now: number) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

function amount(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function RecentPayouts({
  initialData,
  campaignSlug
}: {
  initialData: PayoutFeedData;
  campaignSlug?: string;
}) {
  const [data, setData] = useState(initialData);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    const endpoint = campaignSlug ? `/api/payouts?campaign=${encodeURIComponent(campaignSlug)}` : "/api/payouts";
    async function refresh() {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as PayoutFeedData;
        if (active) setData(payload);
      } catch {
        // Keep the last confirmed receipts when a poll is unavailable.
      }
    }
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    const poll = window.setInterval(refresh, 15_000);
    refresh();
    return () => {
      active = false;
      window.clearInterval(clock);
      window.clearInterval(poll);
    };
  }, [campaignSlug]);

  return (
    <section id={campaignSlug ? undefined : "payouts"} className="section-space relative border-y border-white/[0.06]">
      <div className="site-shell">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl">
          <p className="section-kicker">Recent payouts</p>
          <h2 className="section-title mt-5">Money moved. Receipts attached.</h2>
        </motion.div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="premium-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#075dff]/15 text-[#69a2ff]"><Crown className="h-5 w-5" aria-hidden="true" /></span>
              <span className="text-xs font-extrabold text-[#b6d2ff]">👑 TOP EARNER</span>
            </div>
            {data.topEarner ? (
              <div className="mt-10">
                <p className="text-3xl font-black text-white">{data.topEarner.xHandle ? `@${data.topEarner.xHandle}` : data.topEarner.walletLabel}</p>
                <p className="mt-3 text-2xl font-black text-[#b6d2ff]">{amount(data.topEarner.amount)} $POW</p>
                {data.topEarner.xHandle && <p className="mt-3 font-mono text-xs text-white/35">{data.topEarner.walletLabel}</p>}
              </div>
            ) : (
              <div className="mt-10">
                <p className="text-2xl font-black text-white">no king yet — be the first on the board.</p>
                <p className="mt-3 text-sm leading-6 text-white/40">Only confirmed on-chain payouts count.</p>
              </div>
            )}
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.07 }} className="premium-table overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3"><ReceiptText className="h-5 w-5 text-[#69a2ff]" /><p className="font-black text-white">Confirmed receipts</p></div>
              <span className="font-mono text-sm font-bold text-[#b6d2ff]">NEXT {countdown(now)}</span>
            </div>
            {data.receipts.length ? (
              <div className="divide-y divide-white/[0.07]">
                {data.receipts.map((receipt, index) => (
                  <motion.div key={receipt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_0.8fr_auto] sm:items-center sm:px-6">
                    <div><p className="font-bold text-white">{receipt.xHandle ? `@${receipt.xHandle}` : receipt.walletLabel}</p><p className="mt-1 font-mono text-xs text-white/35">{receipt.walletLabel}</p></div>
                    <div><p className="font-black text-[#b6d2ff]">{amount(receipt.amount)} $POW</p><p className="mt-1 text-xs text-white/35">{relativeTime(receipt.paidAt, now)}</p></div>
                    <a href={receipt.solscanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-white/55 transition hover:text-white">tx <ArrowUpRight className="h-4 w-4" /></a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="text-xl font-black text-white">First payout prints here — next round in {countdown(now)}.</p>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">Dry runs and unconfirmed transactions never appear in this feed.</p>
              </div>
            )}
          </motion.article>
        </div>
      </div>
    </section>
  );
}

