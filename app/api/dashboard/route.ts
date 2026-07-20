import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emptyDashboardSnapshot } from "@/data/empty-protocol";
import { powMinimumHoldingAmountLabel, powMinimumHoldingLabel } from "@/lib/pow-config";
import type { DashboardSnapshot, PreviousWinner, Submission } from "@/types/protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EpochRow = {
  epoch_id: string;
  status: string | null;
  eligible_count: number | null;
  source_reward_balance: string | number | null;
  distributed_reward_amount: string | number | null;
  started_at: string | null;
  completed_at: string | null;
};

type ClaimRow = {
  amount_sol: string | number | null;
};

type PayoutRow = {
  epoch_id: string;
  wallet: string;
  reward_asset: string | null;
  reward_amount: string | number | null;
  status: string | null;
  tx_sig: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type WorkerIdentityRow = {
  x_user_id: string;
  x_handle: string;
  wallet: string;
};

type PublicLeaderboardRow = {
  x_user_id: string;
  x_handle: string;
  rank: number;
  score: string | number | null;
  meets_minimum: boolean;
  worker_status: string;
  post_count: number | null;
  impression_count: number | null;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE?.trim();
  if (!url || !key) return null;
  return { url, key };
}

function supabase() {
  const config = supabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, { auth: { persistSession: false } });
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatSol(value: number) {
  if (value <= 0) return "—";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
}

function formatPow(value: unknown) {
  const amount = toNumber(value);
  if (amount <= 0) return "—";
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} $POW`;
}

function formatScore(value: unknown) {
  return Math.round(toNumber(value)).toLocaleString();
}

function epochTimestamp(epochId: string) {
  const isoPrefix = epochId.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)?.[0];
  return Date.parse(isoPrefix ?? epochId);
}

function latestTime(row: Pick<PayoutRow, "updated_at" | "created_at" | "epoch_id">) {
  return Date.parse(row.updated_at ?? row.created_at ?? "") || epochTimestamp(row.epoch_id) || 0;
}

function epochNumber(epochId: string, index: number) {
  const parsed = epochTimestamp(epochId);
  return Number.isFinite(parsed) ? Math.floor(parsed / 900_000).toString() : `${index + 1}`;
}

function publicSubmissions(rows: PublicLeaderboardRow[]): Submission[] {
  return rows.slice(0, 20).map((row) => ({
    id: row.x_user_id,
    rank: row.rank,
    lane: `@${row.x_handle || "worker"}`,
    proof: `https://x.com/${row.x_handle}`,
    status: `${(row.post_count ?? 0).toLocaleString()} posts`,
    eligible: row.meets_minimum,
    eligibility: row.meets_minimum ? "Minimum met" : "Below minimum",
    score: `${formatScore(row.score)} pts`,
    holdings: row.meets_minimum ? `${powMinimumHoldingLabel} verified` : `Below ${powMinimumHoldingAmountLabel}`,
    views: `${(row.impression_count ?? 0).toLocaleString()} views`,
  }));
}

function verifiedPayouts(
  payouts: PayoutRow[],
  identities: WorkerIdentityRow[],
): PreviousWinner[] {
  const handlesByWallet = new Map(
    identities.map((worker) => [worker.wallet, `@${worker.x_handle || "worker"}`]),
  );

  return payouts.slice(0, 4).map((row, index) => ({
    round: epochNumber(row.epoch_id, index),
    identity: handlesByWallet.get(row.wallet) ?? "Verified worker",
    payout: formatPow(row.reward_amount),
    reason: row.tx_sig ? `Settled $POW reward: ${row.tx_sig.slice(0, 10)}...` : "Settled $POW reward",
  }));
}

async function readDashboard(): Promise<DashboardSnapshot> {
  const db = supabase();
  if (!db) return emptyDashboardSnapshot;

  const [epochsResult, claimsResult, payoutsResult, identitiesResult, leaderboardResult] = await Promise.all([
    db
      .from("pow_epochs")
      .select("epoch_id,status,eligible_count,source_reward_balance,distributed_reward_amount,started_at,completed_at")
      .order("started_at", { ascending: false })
      .limit(25),
    db.from("pow_claims").select("amount_sol").limit(10000),
    db
      .from("pow_payouts")
      .select("epoch_id,wallet,reward_asset,reward_amount,status,tx_sig,updated_at,created_at")
      .eq("status", "settled")
      .eq("reward_asset", "POW")
      .order("updated_at", { ascending: false })
      .limit(100),
    db
      .from("pow_verified_workers")
      .select("x_user_id,x_handle,wallet")
      .in("status", ["verified", "pending", "paid"])
      .limit(500),
    db
      .from("pow_public_leaderboard")
      .select("x_user_id,x_handle,rank,score,meets_minimum,worker_status,post_count,impression_count")
      .eq("campaign_slug", "pow")
      .order("rank", { ascending: true })
      .limit(100),
  ]);

  for (const result of [epochsResult, claimsResult, payoutsResult, identitiesResult, leaderboardResult]) {
    if (result.error) throw result.error;
  }

  const epochs = (epochsResult.data ?? []) as EpochRow[];
  const claims = (claimsResult.data ?? []) as ClaimRow[];
  const payouts = ((payoutsResult.data ?? []) as PayoutRow[]).sort((a, b) => latestTime(b) - latestTime(a));
  const identities = (identitiesResult.data ?? []) as WorkerIdentityRow[];
  const leaderboard = (leaderboardResult.data ?? []) as PublicLeaderboardRow[];
  const eligibleWorkers = leaderboard.filter((worker) => worker.meets_minimum);

  const latestEpoch = epochs[0];
  const totalCreatorFees = claims.reduce((sum, row) => sum + toNumber(row.amount_sol), 0);
  const totalPowPaid = payouts.reduce((sum, row) => sum + toNumber(row.reward_amount), 0);
  const totalWorkerScore = leaderboard.reduce((sum, row) => sum + toNumber(row.score), 0);
  const totalViews = leaderboard.reduce((sum, row) => sum + (row.impression_count ?? 0), 0);
  const latestPayoutEpoch = payouts[0]?.epoch_id;
  const latestPowPayout = latestPayoutEpoch
    ? payouts
        .filter((row) => row.epoch_id === latestPayoutEpoch)
        .reduce((sum, row) => sum + toNumber(row.reward_amount), 0)
    : 0;

  return {
    round: {
      id: latestEpoch ? `Epoch ${epochNumber(latestEpoch.epoch_id, 0)}` : "—",
      status: latestEpoch?.status || "—",
      pool: latestEpoch ? "Capped" : "—",
      holderRewardPool: "$POW",
      votingWindow: latestEpoch ? "15-minute rewards" : "—",
    },
    metrics: [
      {
        key: "reward-pool",
        label: "$POW Reward Wallet",
        value: formatPow(latestEpoch?.source_reward_balance),
        helper: "Last verified $POW balance available to the capped payout worker.",
        tone: "purple",
      },
      {
        key: "pow-payout",
        label: "Latest $POW Reward",
        value: formatPow(latestPowPayout),
        helper: "Latest settled score-weighted reward to eligible workers.",
        tone: "magenta",
      },
      {
        key: "x-views",
        label: "X Views",
        value: totalViews ? totalViews.toLocaleString() : "—",
        helper: "Views from profile-scanned public $POW posts.",
        tone: "lime",
      },
      {
        key: "current-round",
        label: "Eligible Workers",
        value: leaderboard.length ? `${eligibleWorkers.length}/${leaderboard.length}` : "—",
        helper: "The site shows eligibility without exposing linked wallets.",
        tone: "steel",
      },
    ],
    submissions: publicSubmissions(leaderboard),
    previousWinners: verifiedPayouts(payouts, identities),
    totals: [
      {
        key: "verified-work",
        label: "Verified Workers",
        value: leaderboard.length ? leaderboard.length.toLocaleString() : "—",
        helper: "X accounts accepted into the native campaign scanner.",
        tone: "magenta",
      },
      {
        key: "creator-fees",
        label: "Creator Fees Recorded",
        value: formatSol(totalCreatorFees),
        helper: "Historical creator-fee claims recorded before $POW payout conversion.",
        tone: "purple",
      },
      {
        key: "pow-paid",
        label: "Total $POW Paid",
        value: formatPow(totalPowPaid),
        helper: "Settled $POW rewards recorded in Supabase.",
        tone: "lime",
      },
      {
        key: "worker-score",
        label: "Total Worker Score",
        value: totalWorkerScore ? formatScore(totalWorkerScore) : "—",
        helper: "Campaign score across the public wallet-free leaderboard.",
        tone: "steel",
      },
    ],
  };
}

export async function GET() {
  try {
    const snapshot = await readDashboard();
    return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("POW dashboard API returned an empty state", error);
    return NextResponse.json(emptyDashboardSnapshot, { headers: { "Cache-Control": "no-store" } });
  }
}
