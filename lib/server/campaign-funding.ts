import "server-only";

import { PublicKey } from "@solana/web3.js";
import type { Campaign, CampaignLeaderboardRow } from "@/data/campaigns";
import { getFundingBalance, powMintAddress } from "@/lib/server/helius";
import { supabaseAdmin } from "@/lib/server/supabase-admin";

type CampaignRow = {
  id: string;
  slug: string;
  project_name: string;
  token_ticker: string;
  logo_url: string | null;
  description: string;
  campaign_keyword: string;
  funding_symbol: string;
  funding_mint: string | null;
  funding_wallet: string | null;
  funding_token: string | null;
  starts_at: string | null;
  ends_at: string | null;
  winner_count: number;
  eligibility_rules: unknown;
  reward_rules: unknown;
  status: string;
  native: boolean;
};

type LeaderboardRow = {
  campaign_id: string;
  rank: number;
  x_handle: string;
  meets_minimum: boolean;
  score: string | number;
};

function validPublicKey(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new PublicKey(value).toBase58();
  } catch {
    return null;
  }
}

function rules(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function rewardSplit(value: unknown) {
  if (!value || typeof value !== "object") return "Campaign-defined distribution";
  const type = (value as Record<string, unknown>).type;
  return type === "score_weighted" ? "Score-weighted distribution" : "Campaign-defined distribution";
}

function schedule(row: CampaignRow) {
  if (!row.starts_at || !row.ends_at) return row.native ? "Continuous campaign" : "Campaign dates pending";
  const format = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });
  return `${format.format(new Date(row.starts_at))} – ${format.format(new Date(row.ends_at))}`;
}

function timeRemaining(endsAt: string | null) {
  if (!endsAt) return "Ongoing";
  const remaining = new Date(endsAt).getTime() - Date.now();
  if (remaining <= 0) return "Ended";
  const days = Math.ceil(remaining / 86_400_000);
  return `${days} day${days === 1 ? "" : "s"}`;
}

function displayBalance(amount: number | null, symbol: string) {
  if (amount === null) return "—";
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
}

function leaderboardFor(campaignId: string, rows: LeaderboardRow[]): CampaignLeaderboardRow[] {
  return rows
    .filter((row) => row.campaign_id === campaignId)
    .map((row) => ({
      rank: row.rank,
      xAccount: `@${row.x_handle.replace(/^@/, "")}`,
      eligibility: row.meets_minimum ? "Minimum met" : "Below minimum",
      score: Number(row.score || 0).toLocaleString(),
      estimatedReward: "Calculated at payout"
    }));
}

export async function getFundedCampaigns(): Promise<Campaign[]> {
  const db = supabaseAdmin();
  const [campaignResult, leaderboardResult] = await Promise.all([
    db
      .from("pow_campaigns")
      .select("id,slug,project_name,token_ticker,logo_url,description,campaign_keyword,funding_symbol,funding_mint,funding_wallet,funding_token,starts_at,ends_at,winner_count,eligibility_rules,reward_rules,status,native")
      .eq("status", "active")
      .order("native", { ascending: false })
      .order("created_at", { ascending: true }),
    db
      .from("pow_public_leaderboard")
      .select("campaign_id,rank,x_handle,meets_minimum,score")
      .order("rank", { ascending: true })
  ]);
  if (campaignResult.error) throw campaignResult.error;
  if (leaderboardResult.error) throw leaderboardResult.error;

  const leaderboard = (leaderboardResult.data ?? []) as LeaderboardRow[];
  const resolved = await Promise.all(
    ((campaignResult.data ?? []) as CampaignRow[]).map(async (row) => {
      const envRewardWallet = row.native ? process.env.POW_REWARD_WALLET?.trim() : undefined;
      const wallet = validPublicKey(envRewardWallet || row.funding_wallet);
      const token = row.native
        ? (row.funding_token || row.funding_mint || powMintAddress())
        : (row.funding_token || row.funding_mint || "SOL");
      if (!wallet || !token) return null;

      let balance: number | null = null;
      try {
        balance = (await getFundingBalance(wallet, token)).amount;
        if (balance <= 0) return null;
      } catch (error) {
        console.warn(`Funding balance unavailable for ${row.slug}`, error);
      }

      const symbol = token === "SOL" ? "SOL" : (row.native ? "$POW" : row.funding_symbol);
      const campaignLeaderboard = leaderboardFor(row.id, leaderboard);
      const campaign: Campaign = {
        slug: row.slug,
        name: row.native ? "WORK Campaign" : row.project_name,
        ticker: row.token_ticker,
        mark: row.token_ticker.replace(/^\$/, "").slice(0, 3),
        logo: row.native ? undefined : (row.logo_url || undefined),
        description: row.description,
        rewardPool: displayBalance(balance, symbol),
        fundingWallet: wallet,
        fundingToken: token,
        fundingBalance: balance,
        solscanUrl: `https://solscan.io/account/${wallet}`,
        workers: campaignLeaderboard.length ? campaignLeaderboard.length.toLocaleString() : "—",
        posts: "—",
        timeRemaining: timeRemaining(row.ends_at),
        status: "Live",
        fundingSource: row.native ? "Protocol Fees" : "Funded by Project",
        fundingAsset: symbol,
        payoutAsset: "$POW",
        keyword: row.campaign_keyword,
        schedule: schedule(row),
        eligibility: rules(row.eligibility_rules),
        winners: `Top ${row.winner_count} eligible workers`,
        rewardSplit: rewardSplit(row.reward_rules),
        engagement: "—",
        native: row.native,
        demo: false,
        leaderboard: campaignLeaderboard
      };
      return campaign;
    })
  );

  return resolved.filter((campaign): campaign is Campaign => campaign !== null);
}

export async function getFundedCampaign(slug: string) {
  const campaigns = await getFundedCampaigns();
  return campaigns.find((campaign) => campaign.slug === slug) || null;
}
