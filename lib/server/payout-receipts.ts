import "server-only";

import { supabaseAdmin } from "@/lib/server/supabase-admin";
import type { PayoutFeedData, PayoutReceipt, TopEarner } from "@/types/payouts";

type PayoutRow = {
  id: string;
  wallet: string;
  x_handle: string | null;
  amount: string | number;
  token: "POW";
  tx_signature: string;
  paid_at: string;
};

type PayoutTotalRow = {
  wallet: string;
  x_handle: string | null;
  amount: string | number;
};

export const emptyPayoutFeed: PayoutFeedData = { receipts: [], topEarner: null };

function walletLabel(wallet: string) {
  return wallet.length > 12 ? `${wallet.slice(0, 5)}...${wallet.slice(-5)}` : wallet;
}

export async function getPayoutFeed(campaignSlug?: string): Promise<PayoutFeedData> {
  const db = supabaseAdmin();
  let campaignId: string | undefined;
  if (campaignSlug) {
    const campaign = await db.from("pow_campaigns").select("id").eq("slug", campaignSlug).maybeSingle();
    if (campaign.error) throw campaign.error;
    if (!campaign.data?.id) return emptyPayoutFeed;
    campaignId = campaign.data.id as string;
  }

  let receiptQuery = db
    .from("payouts")
    .select("id,wallet,x_handle,amount,token,tx_signature,paid_at")
    .eq("status", "confirmed")
    .not("tx_signature", "is", null)
    .not("tx_signature", "like", "DRYRUN-%")
    .order("paid_at", { ascending: false })
    .limit(20);
  let topEarnerQuery = db
    .from("pow_payout_totals")
    .select("wallet,x_handle,amount")
    .order("amount", { ascending: false })
    .limit(1);
  if (campaignId) {
    receiptQuery = receiptQuery.eq("campaign_id", campaignId);
    topEarnerQuery = topEarnerQuery.eq("campaign_id", campaignId);
  }
  const [receiptResult, topEarnerResult] = await Promise.all([receiptQuery, topEarnerQuery]);
  if (receiptResult.error) throw receiptResult.error;
  if (topEarnerResult.error) throw topEarnerResult.error;

  const seenSignatures = new Set<string>();
  const rows = ((receiptResult.data ?? []) as PayoutRow[]).filter((row) => {
    if (!row.tx_signature || row.tx_signature.startsWith("DRYRUN-") || seenSignatures.has(row.tx_signature)) return false;
    seenSignatures.add(row.tx_signature);
    return true;
  });

  const receipts: PayoutReceipt[] = rows.slice(0, 20).map((row) => ({
    id: row.id,
    walletLabel: walletLabel(row.wallet),
    xHandle: row.x_handle ? row.x_handle.replace(/^@/, "") : null,
    amount: Number(row.amount || 0),
    token: "POW",
    txSignature: row.tx_signature,
    solscanUrl: `https://solscan.io/tx/${row.tx_signature}`,
    paidAt: row.paid_at
  }));

  const total = ((topEarnerResult.data ?? []) as PayoutTotalRow[])[0] || null;
  const topEarner: TopEarner | null = total
    ? {
        walletLabel: walletLabel(total.wallet),
        xHandle: total.x_handle ? total.x_handle.replace(/^@/, "") : null,
        amount: Number(total.amount || 0),
        token: "POW"
      }
    : null;
  return { receipts, topEarner };
}
