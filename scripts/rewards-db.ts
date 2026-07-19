import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type EpochStatus = "running" | "completed" | "failed" | "skipped";

type StartEpochInput = {
  epochId: string;
  mode: "preview" | "execute";
  sourceMint: string;
  ansemMint: string;
  rewardWallet?: string | null;
};

type CompleteEpochInput = {
  eligibleCount: number;
  claimLamports: string;
  rewardWalletLamports: string;
  ansemSwapLamports: string;
  ansemBoughtRaw: string;
  ansemBought: string;
  ansemDistributedRaw: string;
  ansemDistributed: string;
  status?: EpochStatus;
};

type SnapshotRow = {
  wallet: string;
  sourceBalanceRaw: string;
  sourceBalance: string;
  holderPct: string;
};

type PayoutRow = {
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
      ansem_mint: input.ansemMint,
      reward_wallet: input.rewardWallet,
      started_at: input.epochId,
    }),
    "start POW epoch",
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
        reward_wallet_lamports: input.rewardWalletLamports,
        ansem_swap_lamports: input.ansemSwapLamports,
        ansem_bought_raw: input.ansemBoughtRaw,
        ansem_bought: input.ansemBought,
        ansem_distributed_raw: input.ansemDistributedRaw,
        ansem_distributed: input.ansemDistributed,
        completed_at: new Date().toISOString(),
      })
      .eq("epoch_id", epochId),
    "complete POW epoch",
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
    "fail POW epoch",
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
    "record POW claim",
  );
}

export async function recordRewardWalletTransfer(
  epochId: string,
  wallet: string,
  amountLamports: string,
  txSig: string | null,
) {
  const db = supabase();
  if (!db) return;

  await assertNoError(
    await db.from("pow_bounty_wallet_transfers").upsert({
      epoch_id: epochId,
      wallet,
      amount_lamports: amountLamports,
      amount_sol: amountSol(amountLamports),
      tx_sig: txSig,
    }),
    "record POW bounty wallet transfer",
  );
}

export async function recordAnsemSwap(
  epochId: string,
  baseSpentLamports: string,
  ansemReceivedRaw: string,
  ansemReceived: string,
  txSig: string | null,
) {
  const db = supabase();
  if (!db) return;

  await assertNoError(
    await db.from("pow_ansem_swaps").upsert({
      epoch_id: epochId,
      base_spent_lamports: baseSpentLamports,
      base_spent_sol: amountSol(baseSpentLamports),
      ansem_received_raw: ansemReceivedRaw,
      ansem_received: ansemReceived,
      tx_sig: txSig,
    }),
    "record POW ansem swap",
  );
}

export async function persistSnapshot(epochId: string, rows: SnapshotRow[]) {
  const db = supabase();
  if (!db || !rows.length) return;

  await assertNoError(
    await db.from("pow_snapshots").upsert(
      rows.map((row) => ({
        epoch_id: epochId,
        wallet: row.wallet,
        source_balance_raw: row.sourceBalanceRaw,
        source_balance: row.sourceBalance,
        holder_pct: row.holderPct,
      })),
      { onConflict: "epoch_id,wallet" },
    ),
    "persist POW snapshot",
  );
}

export async function dryRunPayouts(epochId: string, rows: PayoutRow[]) {
  await upsertPayouts(epochId, rows, "dry_run");
}

export async function planPayouts(epochId: string, rows: PayoutRow[]) {
  await upsertPayouts(epochId, rows, "planned");
}

async function upsertPayouts(epochId: string, rows: PayoutRow[], status: "dry_run" | "planned") {
  const db = supabase();
  if (!db || !rows.length) return;

  await assertNoError(
    await db.from("pow_payouts").upsert(
      rows.map((row) => ({
        epoch_id: epochId,
        wallet: row.wallet,
        reward_asset: "ANSEM",
        reward_amount_raw: row.rewardAmountRaw,
        reward_amount: row.rewardAmount,
        idempotency_key: `${epochId}:${row.wallet}:ANSEM`,
        status,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "idempotency_key" },
    ),
    `${status} POW payouts`,
  );
}

export async function settlePayouts(epochId: string, rows: PayoutRow[], txSig: string) {
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
        .eq("reward_asset", "ANSEM"),
      "settle POW payout",
    );
  }
}

export async function failPayouts(epochId: string, rows: PayoutRow[], error: unknown) {
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
        .eq("reward_asset", "ANSEM"),
      "fail POW payout",
    );
  }
}
