import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type EpochStatus = "running" | "completed" | "failed" | "skipped";

type StartEpochInput = {
  epochId: string;
  mode: "preview" | "execute";
  sourceMint: string;
  rewardAsset: "SOL";
};

type CompleteEpochInput = {
  eligibleCount: number;
  claimLamports: string;
  distributedLamports: string;
  distributedSol: string;
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
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
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

function amountSol(rawLamports: string) {
  return Number(rawLamports) / 1_000_000_000;
}

async function assertNoError(result: { error: unknown }, label: string) {
  if (result.error) {
    console.warn(`${label}: ${JSON.stringify(result.error)}`);
  }
}

export async function startEpoch(input: StartEpochInput) {
  const db = supabase();
  if (!db) return;

  await assertNoError(
    await db.from("pow_epochs").upsert({
      epoch_id: input.epochId,
      status: "running",
      mode: input.mode,
      source_mint: input.sourceMint,
      reward_asset: input.rewardAsset,
      started_at: input.epochId,
    }),
    "start POW payroll epoch",
  );
}

export async function completeEpoch(epochId: string, input: CompleteEpochInput) {
  const db = supabase();
  if (!db) return;

  await assertNoError(
    await db
      .from("pow_epochs")
      .update({
        status: input.status ?? "completed",
        eligible_count: input.eligibleCount,
        claim_lamports: input.claimLamports,
        distributed_lamports: input.distributedLamports,
        distributed_sol: input.distributedSol,
        completed_at: new Date().toISOString(),
      })
      .eq("epoch_id", epochId),
    "complete POW payroll epoch",
  );
}

export async function failEpoch(epochId: string, error: unknown) {
  const db = supabase();
  if (!db) return;

  await assertNoError(
    await db
      .from("pow_epochs")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completed_at: new Date().toISOString(),
      })
      .eq("epoch_id", epochId),
    "fail POW payroll epoch",
  );
}

export async function recordClaim(epochId: string, amountLamports: string, txSig: string | null) {
  const db = supabase();
  if (!db) return;

  await assertNoError(
    await db.from("pow_claims").upsert({
      epoch_id: epochId,
      amount_lamports: amountLamports,
      amount_sol: amountSol(amountLamports),
      tx_sig: txSig,
    }),
    "record POW creator-fee claim",
  );
}

export async function planPayouts(epochId: string, rows: WorkerPayoutRow[]) {
  await upsertPayouts(epochId, rows, "planned");
}

export async function dryRunPayouts(epochId: string, rows: WorkerPayoutRow[]) {
  await upsertPayouts(epochId, rows, "dry_run");
}

async function upsertPayouts(epochId: string, rows: WorkerPayoutRow[], status: "dry_run" | "planned") {
  const db = supabase();
  if (!db || !rows.length) return;

  await assertNoError(
    await db.from("pow_payouts").upsert(
      rows.map((row) => ({
        epoch_id: epochId,
        wallet: row.wallet,
        reward_asset: "SOL",
        reward_amount_raw: row.rewardAmountRaw,
        reward_amount: row.rewardAmount,
        idempotency_key: `${epochId}:${row.wallet}:SOL`,
        status,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "idempotency_key" },
    ),
    `${status} POW SOL payouts`,
  );
}

export async function settlePayouts(epochId: string, rows: WorkerPayoutRow[], txSig: string) {
  const db = supabase();
  if (!db || !rows.length) return;

  for (const row of rows) {
    await assertNoError(
      await db
        .from("pow_payouts")
        .update({
          status: "settled",
          tx_sig: txSig,
          updated_at: new Date().toISOString(),
        })
        .eq("epoch_id", epochId)
        .eq("wallet", row.wallet)
        .eq("reward_asset", "SOL"),
      "settle POW SOL payout",
    );
  }
}

export async function failPayouts(epochId: string, rows: WorkerPayoutRow[], error: unknown) {
  const db = supabase();
  if (!db || !rows.length) return;

  for (const row of rows) {
    await assertNoError(
      await db
        .from("pow_payouts")
        .update({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          updated_at: new Date().toISOString(),
        })
        .eq("epoch_id", epochId)
        .eq("wallet", row.wallet)
        .eq("reward_asset", "SOL"),
      "fail POW SOL payout",
    );
  }
}
