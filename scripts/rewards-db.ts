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
  xHandle: string;
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

async function campaignId(slug: string) {
  const db = supabase();
  if (!db) throw new Error("Supabase is required for payout audit records");
  const result = await db.from("pow_campaigns").select("id").eq("slug", slug).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data?.id) throw new Error(`Campaign ${slug} does not exist`);
  return result.data.id as string;
}

export async function planPayoutAudit(runId: string, rows: WorkerPayoutRow[]) {
  await insertPayoutAudit(runId, rows, "planned");
}

export async function dryRunPayoutAudit(runId: string, rows: WorkerPayoutRow[]) {
  await insertPayoutAudit(runId, rows, "dry_run");
}

async function insertPayoutAudit(
  runId: string,
  rows: WorkerPayoutRow[],
  status: "planned" | "dry_run",
) {
  const db = supabase();
  if (!db || !rows.length) return;
  const powCampaignId = await campaignId("pow");
  const result = await db.from("payouts").insert(
    rows.map((row) => ({
      run_id: runId,
      campaign_id: powCampaignId,
      wallet: row.wallet,
      x_handle: row.xHandle,
      amount: row.rewardAmount,
      token: "POW",
      tx_signature: status === "dry_run" ? `DRYRUN-${runId}` : null,
      status,
    })),
  );
  if (result.error?.code === "23505") return;
  if (result.error) throw result.error;
}

export async function confirmPayoutAudit(runId: string, wallet: string, txSignature: string) {
  const db = supabase();
  if (!db) return;
  const result = await db
    .from("payouts")
    .update({
      status: "confirmed",
      tx_signature: txSignature,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("run_id", runId)
    .eq("wallet", wallet)
    .eq("status", "planned");
  if (result.error?.code === "23505") return;
  if (result.error) throw result.error;
}

export async function failPayoutAudit(runId: string, wallet: string, error: unknown) {
  const db = supabase();
  if (!db) return;
  const result = await db
    .from("payouts")
    .update({
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      updated_at: new Date().toISOString(),
    })
    .eq("run_id", runId)
    .eq("wallet", wallet)
    .eq("status", "planned");
  warnError(result.error, "fail public payout audit");
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
