import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type EpochStatus = "running" | "completed" | "failed" | "skipped";

type StartEpochInput = {
  epochId: string;
  startedAt: string;
  mode: "preview" | "execute";
  campaignSlug: string;
  sourceMint: string;
  rewardMint: string;
  sourceRewardBalanceRaw: string;
  sourceRewardBalance: string;
};

type CompleteEpochInput = {
  eligibleCount: number;
  distributedRewardRaw: string;
  distributedRewardAmount: string;
  status?: EpochStatus;
};

export type WorkerPayoutRow = {
  wallet: string;
  rewardAmountRaw: string;
  rewardAmount: string;
};

let warnedMissingConfig = false;
let client: SupabaseClient | null | undefined;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE?.trim();

  if (!url || !key) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn("Supabase writes disabled: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    }
    return null;
  }

  return { url, key };
}

function supabase() {
  if (client !== undefined) return client;

  const config = supabaseConfig();
  client = config
    ? createClient(config.url, config.key, {
        auth: { persistSession: false },
      })
    : null;
  return client;
}

function warnError(error: unknown, label: string) {
  if (error) console.warn(`${label}: ${JSON.stringify(error)}`);
}

export async function startEpoch(input: StartEpochInput) {
  const db = supabase();
  if (!db) return true;

  const result = await db.from("pow_epochs").insert({
    epoch_id: input.epochId,
    status: "running",
    mode: input.mode,
    campaign_slug: input.campaignSlug,
    source_mint: input.sourceMint,
    reward_asset: "POW",
    reward_mint: input.rewardMint,
    source_reward_balance_raw: input.sourceRewardBalanceRaw,
    source_reward_balance: input.sourceRewardBalance,
    started_at: input.startedAt,
  });

  if (result.error?.code === "23505") return false;
  if (result.error) throw result.error;
  return true;
}

export async function completeEpoch(epochId: string, input: CompleteEpochInput) {
  const db = supabase();
  if (!db) return;

  const result = await db
    .from("pow_epochs")
    .update({
      status: input.status ?? "completed",
      eligible_count: input.eligibleCount,
      distributed_reward_raw: input.distributedRewardRaw,
      distributed_reward_amount: input.distributedRewardAmount,
      completed_at: new Date().toISOString(),
    })
    .eq("epoch_id", epochId);
  warnError(result.error, "complete POW reward epoch");
}

export async function failEpoch(epochId: string, error: unknown) {
  const db = supabase();
  if (!db) return;

  const result = await db
    .from("pow_epochs")
    .update({
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      completed_at: new Date().toISOString(),
    })
    .eq("epoch_id", epochId);
  warnError(result.error, "fail POW reward epoch");
}

export async function planPayouts(epochId: string, rewardMint: string, rows: WorkerPayoutRow[]) {
  await upsertPayouts(epochId, rewardMint, rows, "planned");
}

export async function dryRunPayouts(epochId: string, rewardMint: string, rows: WorkerPayoutRow[]) {
  await upsertPayouts(epochId, rewardMint, rows, "dry_run");
}

async function upsertPayouts(
  epochId: string,
  rewardMint: string,
  rows: WorkerPayoutRow[],
  status: "dry_run" | "planned",
) {
  const db = supabase();
  if (!db || !rows.length) return;

  const result = await db.from("pow_payouts").upsert(
    rows.map((row) => ({
      epoch_id: epochId,
      campaign_slug: "pow",
      wallet: row.wallet,
      reward_asset: "POW",
      reward_mint: rewardMint,
      reward_amount_raw: row.rewardAmountRaw,
      reward_amount: row.rewardAmount,
      idempotency_key: `${epochId}:${row.wallet}:POW`,
      status,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "idempotency_key" },
  );
  warnError(result.error, `${status} POW payouts`);
}

export async function settlePayouts(epochId: string, rows: WorkerPayoutRow[], txSig: string) {
  const db = supabase();
  if (!db || !rows.length) return;

  for (const row of rows) {
    const result = await db
      .from("pow_payouts")
      .update({
        status: "settled",
        tx_sig: txSig,
        updated_at: new Date().toISOString(),
      })
      .eq("epoch_id", epochId)
      .eq("wallet", row.wallet)
      .eq("reward_asset", "POW")
      .eq("status", "planned");
    warnError(result.error, "settle POW payout");
  }
}

export async function failPayouts(epochId: string, rows: WorkerPayoutRow[], error: unknown) {
  const db = supabase();
  if (!db || !rows.length) return;

  for (const row of rows) {
    const result = await db
      .from("pow_payouts")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        updated_at: new Date().toISOString(),
      })
      .eq("epoch_id", epochId)
      .eq("wallet", row.wallet)
      .eq("reward_asset", "POW")
      .eq("status", "planned");
    warnError(result.error, "fail POW payout");
  }
}
