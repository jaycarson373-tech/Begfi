import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dashboardSnapshot } from "@/data/mock-protocol";
import type { DashboardSnapshot, PreviousWinner, Submission } from "@/types/protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EpochRow = {
  epoch_id: string;
  status: string | null;
  eligible_count: number | null;
  claim_lamports: string | null;
  distributed_sol: string | number | null;
  started_at: string | null;
  completed_at: string | null;
};

type ClaimRow = {
  amount_sol: string | number | null;
};

type PayoutRow = {
  epoch_id: string;
  wallet: string;
  reward_amount: string | number | null;
  status: string | null;
  tx_sig: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type WorkerRow = {
  x_user_id: string;
  x_handle: string;
  wallet: string;
  handle: string | null;
  proof_url: string | null;
  category: string | null;
  payout_label: string | null;
  status: string | null;
  holding_tokens: string | number | null;
  holding_days: string | number | null;
  volume_usd: string | number | null;
  score: string | number | null;
  engagement_score: string | number | null;
  holding_score: string | number | null;
  volume_score: string | number | null;
  post_count: number | null;
  like_count: number | null;
  repost_count: number | null;
  reply_count: number | null;
  quote_count: number | null;
  impression_count: number | null;
  created_at: string | null;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return null;
  return { url, key };
}

function supabase() {
  const config = supabaseConfig();
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: { persistSession: false },
  });
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compactWallet(wallet: string) {
  return wallet.length > 12 ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : wallet;
}

function formatSol(value: number) {
  if (value <= 0) return "Coming soon";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
}

function formatScore(value: unknown) {
  return Math.round(toNumber(value)).toLocaleString();
}

function formatPow(value: unknown) {
  const amount = toNumber(value);
  if (amount <= 0) return "1M+ $POW";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M $POW`;
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} $POW`;
}

function formatUsd(value: unknown) {
  const amount = toNumber(value);
  if (amount <= 0) return "Volume pending";
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} volume`;
}

function formatDays(value: unknown) {
  const days = toNumber(value);
  if (days <= 0) return "Hold time pending";
  return `${days.toLocaleString(undefined, { maximumFractionDigits: 1 })}d held`;
}

function latestTime(row: Pick<PayoutRow, "updated_at" | "created_at" | "epoch_id">) {
  return Date.parse(row.updated_at ?? row.created_at ?? row.epoch_id) || 0;
}

function epochNumber(epochId: string, index: number) {
  const parsed = Date.parse(epochId);
  return Number.isFinite(parsed) ? Math.floor(parsed / 600_000).toString() : `${index + 1}`;
}

function verifiedSubmissions(rows: WorkerRow[]): Submission[] {
  return rows.slice(0, 5).map((row, index) => ({
    rank: index + 1,
    wallet: compactWallet(row.wallet),
    lane: `@${row.x_handle || row.handle || "worker"}`,
    proof: row.proof_url || row.handle || "Verified manually",
    status: `${(row.post_count ?? 0).toLocaleString()} posts`,
    score: `${formatScore(row.score)} pts`,
    holdings: formatPow(row.holding_tokens),
    holdTime: formatDays(row.holding_days),
    volume: formatUsd(row.volume_usd),
    views: `${(row.impression_count ?? 0).toLocaleString()} views`,
    engagement: `${formatScore(row.engagement_score)} engagement`,
  }));
}

function verifiedPayouts(rows: WorkerRow[], fallbackPayouts: PayoutRow[]): PreviousWinner[] {
  if (fallbackPayouts.length) {
    return fallbackPayouts.slice(0, 4).map((row, index) => ({
      round: epochNumber(row.epoch_id, index),
      wallet: compactWallet(row.wallet),
      payout: formatSol(toNumber(row.reward_amount)),
      reason: row.tx_sig ? `Settled SOL payroll: ${row.tx_sig.slice(0, 10)}...` : "Settled SOL payroll",
    }));
  }

  return rows.slice(0, 4).map((row, index) => ({
    round: `${index + 1}`,
    wallet: compactWallet(row.wallet),
    payout: row.payout_label || `${formatScore(row.score)} pts`,
    reason: row.proof_url || row.category || "Awaiting first SOL payroll",
  }));
}

async function readDashboard(): Promise<DashboardSnapshot> {
  const db = supabase();
  if (!db) return dashboardSnapshot;

  const [
    epochsResult,
    claimsResult,
    payoutsResult,
    workersResult,
  ] = await Promise.all([
    db.from("pow_epochs").select("*").order("started_at", { ascending: false }).limit(25),
    db.from("pow_claims").select("amount_sol").limit(10000),
    db
      .from("pow_payouts")
      .select("epoch_id,wallet,reward_amount,status,tx_sig,updated_at,created_at")
      .eq("status", "settled")
      .order("updated_at", { ascending: false })
      .limit(100),
    db
      .from("pow_verified_workers")
      .select("x_user_id,x_handle,wallet,handle,proof_url,category,payout_label,status,holding_tokens,holding_days,volume_usd,score,engagement_score,holding_score,volume_score,post_count,like_count,repost_count,reply_count,quote_count,impression_count,created_at")
      .in("status", ["verified", "paid"])
      .order("score", { ascending: false })
      .limit(20),
  ]);

  for (const result of [epochsResult, claimsResult, payoutsResult, workersResult]) {
    if (result.error) throw result.error;
  }

  const epochs = (epochsResult.data ?? []) as EpochRow[];
  const claims = (claimsResult.data ?? []) as ClaimRow[];
  const payouts = ((payoutsResult.data ?? []) as PayoutRow[]).sort((a, b) => latestTime(b) - latestTime(a));
  const workers = (workersResult.data ?? []) as WorkerRow[];

  const latestEpoch = epochs[0];
  const totalCreatorFees = claims.reduce((sum, row) => sum + toNumber(row.amount_sol), 0);
  const totalSolPayroll = payouts.reduce((sum, row) => sum + toNumber(row.reward_amount), 0);
  const totalWorkerScore = workers.reduce((sum, row) => sum + toNumber(row.score), 0);
  const totalViews = workers.reduce((sum, row) => sum + (row.impression_count ?? 0), 0);
  const latestPayoutEpoch = payouts[0]?.epoch_id;
  const latestEpochSolPayroll = latestPayoutEpoch
    ? payouts
        .filter((row) => row.epoch_id === latestPayoutEpoch)
        .reduce((sum, row) => sum + toNumber(row.reward_amount), 0)
    : 0;

  return {
    round: {
      id: latestEpoch ? `Epoch ${epochNumber(latestEpoch.epoch_id, 0)}` : "Launch round",
      status: latestEpoch?.status || "Waiting for first Supabase epoch",
      pool: "100%",
      holderRewardPool: "SOL",
      votingWindow: "5-minute scanner",
    },
    metrics: [
      {
        key: "creator-fees",
        label: "Creator Fees",
        value: formatSol(totalCreatorFees),
        helper: "Claimed creator fees recorded by the POW worker.",
        tone: "purple",
      },
      {
        key: "sol-payroll",
        label: "SOL Payroll",
        value: formatSol(latestEpochSolPayroll),
        helper: "Latest settled creator-fee payroll to top workers.",
        tone: "magenta",
      },
      {
        key: "x-views",
        label: "X Views",
        value: totalViews ? totalViews.toLocaleString() : "Coming soon",
        helper: "Views from AI-scored $POW posts.",
        tone: "lime",
      },
      {
        key: "current-round",
        label: "Verified Workers",
        value: workers.length ? workers.length.toLocaleString() : "1M+ $POW",
        helper: "Workers qualify by posting a wallet and holding 1M+ $POW.",
        tone: "steel",
      },
    ],
    submissions: verifiedSubmissions(workers),
    previousWinners: verifiedPayouts(workers, payouts),
    totals: [
      {
        key: "verified-work",
        label: "Verified Work",
        value: workers.length ? workers.length.toLocaleString() : "Coming soon",
        helper: "Accepted X applications on the POW leaderboard.",
        tone: "magenta",
      },
      {
        key: "total-fees",
        label: "Total SOL Payroll",
        value: formatSol(totalCreatorFees),
        helper: "Creator fees reserved for scored workers.",
        tone: "purple",
      },
      {
        key: "holder-rewards",
        label: "Settled SOL Paid",
        value: formatSol(totalSolPayroll),
        helper: "Settled SOL payroll recorded in Supabase.",
        tone: "lime",
      },
      {
        key: "worker-score",
        label: "Total Worker Score",
        value: totalWorkerScore ? formatScore(totalWorkerScore) : "Coming soon",
        helper: "AI outreach, engagement, holding time, and volume-score totals.",
        tone: "steel",
      },
    ],
  };
}

export async function GET() {
  try {
    const snapshot = await readDashboard();
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.warn("POW dashboard API fell back to launch placeholders", error);
    return NextResponse.json(dashboardSnapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
