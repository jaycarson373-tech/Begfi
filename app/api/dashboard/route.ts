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
  reward_wallet_lamports: string | null;
  ansem_swap_lamports: string | null;
  ansem_bought: string | number | null;
  ansem_distributed: string | number | null;
  started_at: string | null;
  completed_at: string | null;
};

type ClaimRow = {
  amount_sol: string | number | null;
};

type RewardWalletTransferRow = {
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

type BagworkerRow = {
  wallet: string;
  handle: string | null;
  proof_url: string | null;
  category: string | null;
  payout_label: string | null;
  status: string | null;
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

function formatAnsem(value: number) {
  if (value <= 0) return "Coming soon";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ANSEM`;
}

function latestTime(row: Pick<PayoutRow, "updated_at" | "created_at" | "epoch_id">) {
  return Date.parse(row.updated_at ?? row.created_at ?? row.epoch_id) || 0;
}

function epochNumber(epochId: string, index: number) {
  const parsed = Date.parse(epochId);
  return Number.isFinite(parsed) ? Math.floor(parsed / 600_000).toString() : `${index + 1}`;
}

function verifiedSubmissions(rows: BagworkerRow[]): Submission[] {
  return rows.slice(0, 5).map((row, index) => ({
    rank: index + 1,
    wallet: compactWallet(row.wallet),
    lane: row.category || "verified bagwork",
    proof: row.proof_url || row.handle || "Verified manually",
    status: row.status || "verified",
  }));
}

function verifiedPayouts(rows: BagworkerRow[], fallbackPayouts: PayoutRow[]): PreviousWinner[] {
  if (rows.length) {
    return rows.slice(0, 4).map((row, index) => ({
      round: `${index + 1}`,
      wallet: compactWallet(row.wallet),
      payout: row.payout_label || row.status || "Verified",
      reason: row.proof_url || row.category || "Manual Proof of Bagwork reward",
    }));
  }

  return fallbackPayouts.slice(0, 4).map((row, index) => ({
    round: epochNumber(row.epoch_id, index),
    wallet: compactWallet(row.wallet),
    payout: formatAnsem(toNumber(row.reward_amount)),
    reason: row.tx_sig ? `Settled $ANSEM payout: ${row.tx_sig.slice(0, 10)}...` : "Settled $ANSEM payout",
  }));
}

async function readDashboard(): Promise<DashboardSnapshot> {
  const db = supabase();
  if (!db) return dashboardSnapshot;

  const [
    epochsResult,
    claimsResult,
    rewardWalletResult,
    payoutsResult,
    bagworkersResult,
  ] = await Promise.all([
    db.from("begwork_epochs").select("*").order("started_at", { ascending: false }).limit(25),
    db.from("begwork_claims").select("amount_sol").limit(10000),
    db.from("begwork_reward_wallet_transfers").select("amount_sol").limit(10000),
    db
      .from("begwork_payouts")
      .select("epoch_id,wallet,reward_amount,status,tx_sig,updated_at,created_at")
      .eq("status", "settled")
      .order("updated_at", { ascending: false })
      .limit(100),
    db
      .from("begwork_verified_begworkers")
      .select("wallet,handle,proof_url,category,payout_label,status,created_at")
      .in("status", ["verified", "paid"])
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  for (const result of [epochsResult, claimsResult, rewardWalletResult, payoutsResult, bagworkersResult]) {
    if (result.error) throw result.error;
  }

  const epochs = (epochsResult.data ?? []) as EpochRow[];
  const claims = (claimsResult.data ?? []) as ClaimRow[];
  const rewardWalletTransfers = (rewardWalletResult.data ?? []) as RewardWalletTransferRow[];
  const payouts = ((payoutsResult.data ?? []) as PayoutRow[]).sort((a, b) => latestTime(b) - latestTime(a));
  const bagworkers = (bagworkersResult.data ?? []) as BagworkerRow[];

  const latestEpoch = epochs[0];
  const totalCreatorFees = claims.reduce((sum, row) => sum + toNumber(row.amount_sol), 0);
  const totalRewardWallet = rewardWalletTransfers.reduce((sum, row) => sum + toNumber(row.amount_sol), 0);
  const totalAnsemRewards = payouts.reduce((sum, row) => sum + toNumber(row.reward_amount), 0);
  const latestPayoutEpoch = payouts[0]?.epoch_id;
  const latestEpochAnsemRewards = latestPayoutEpoch
    ? payouts
        .filter((row) => row.epoch_id === latestPayoutEpoch)
        .reduce((sum, row) => sum + toNumber(row.reward_amount), 0)
    : 0;

  return {
    round: {
      id: latestEpoch ? `Epoch ${epochNumber(latestEpoch.epoch_id, 0)}` : "Launch round",
      status: latestEpoch?.status || "Waiting for first Supabase epoch",
      pool: "50%",
      holderRewardPool: "50%",
      votingWindow: "10-minute holder drops",
    },
    metrics: [
      {
        key: "creator-fees",
        label: "Creator Fees",
        value: formatSol(totalCreatorFees),
        helper: "Claimed creator fees recorded by the Proof of Bagwork worker.",
        tone: "purple",
      },
      {
        key: "ansem-holder-rewards",
        label: "$ANSEM Holder Rewards",
        value: formatAnsem(latestEpochAnsemRewards),
        helper: "Latest settled $ANSEM distribution to eligible $BEG holders.",
        tone: "magenta",
      },
      {
        key: "reward-wallet",
        label: "Bounty Wallet",
        value: formatSol(totalRewardWallet),
        helper: "Manual bounty and verified-bagworker funding sent to the bounty wallet.",
        tone: "lime",
      },
      {
        key: "current-round",
        label: "Eligible Holders",
        value: latestEpoch?.eligible_count ? latestEpoch.eligible_count.toLocaleString() : "Hold $BEG",
        helper: "Holding $BEG is the on-chain proof.",
        tone: "steel",
      },
    ],
    submissions: verifiedSubmissions(bagworkers),
    previousWinners: verifiedPayouts(bagworkers, payouts),
    totals: [
      {
        key: "verified-bagwork",
        label: "Verified Bagwork",
        value: bagworkers.length ? bagworkers.length.toLocaleString() : "Coming soon",
        helper: "Manual Supabase rows for verified bagworkers and bounties.",
        tone: "magenta",
      },
      {
        key: "total-fees",
        label: "Total Creator Fees Distributed",
        value: formatSol(totalCreatorFees),
        helper: "Fees split between $ANSEM rewards and the bounty wallet.",
        tone: "purple",
      },
      {
        key: "holder-rewards",
        label: "Total $ANSEM Rewards",
        value: formatAnsem(totalAnsemRewards),
        helper: "Settled $ANSEM payouts recorded in Supabase.",
        tone: "lime",
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
    console.warn("Proof of Bagwork dashboard API fell back to mock data", error);
    return NextResponse.json(dashboardSnapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
