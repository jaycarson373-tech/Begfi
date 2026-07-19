import "dotenv/config";
import path from "path";
import bs58 from "bs58";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { mkdir, writeFile } from "fs/promises";
import {
  completeEpoch as completeDbEpoch,
  dryRunPayouts,
  failEpoch as failDbEpoch,
  failPayouts,
  planPayouts,
  settlePayouts,
  startEpoch as startDbEpoch,
  type WorkerPayoutRow,
} from "./rewards-db";
import { powMinimumHolding } from "../lib/pow-config";

type VerifiedWorker = {
  wallet: string;
  x_user_id: string | null;
  x_handle: string | null;
  score: string | number | null;
  holding_tokens: string | number | null;
  status: string | null;
};

type BlacklistRow = {
  wallet: string | null;
  x_user_id: string | null;
  x_handle: string | null;
  reason: string | null;
};

type BlacklistIndex = {
  wallets: Map<string, string>;
  userIds: Map<string, string>;
  handles: Map<string, string>;
};

type Allocation = {
  wallet: string;
  handle: string;
  score: number;
  amountRaw: bigint;
};

type EpochRecord = {
  epochId: string;
  startedAt: string;
  completedAt?: string;
  mode: "preview" | "execute";
  status: "running" | "completed" | "failed" | "skipped";
  payoutAsset: "POW";
  rewardMint: string;
  sourceBalanceRaw?: string;
  budgetRaw?: string;
  distributedRaw?: string;
  eligibleCount?: number;
  payoutSignatures: string[];
  error?: string;
};

const execute = process.argv.includes("--execute");
const liveExecutionAck = "I_UNDERSTAND_POW_PAYOUTS_ARE_LIVE";
const defaultBlacklistReason = "anti-cheat exclusion";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function numberEnv(name: string, fallback: number) {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number`);
  return parsed;
}

function integerEnv(name: string, fallback: number) {
  return Math.trunc(numberEnv(name, fallback));
}

function parsePrivateKey(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(trimmed) as number[]));
  }
  return Keypair.fromSecretKey(bs58.decode(trimmed));
}

function validPublicKey(value: string) {
  try {
    return new PublicKey(value).toBase58();
  } catch {
    return null;
  }
}

function csvEnv(name: string) {
  return (process.env[name] ?? "")
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeHandle(value: string | null | undefined) {
  return (value ?? "").trim().replace(/^@/, "").toLowerCase();
}

function compactWallet(wallet: string) {
  return wallet.length > 12 ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : wallet;
}

function toScore(value: unknown) {
  const score = Number(value ?? 0);
  return Number.isFinite(score) && score > 0 ? score : 0;
}

function minBigInt(...values: bigint[]) {
  return values.reduce((smallest, value) => (value < smallest ? value : smallest));
}

function decimalToRaw(value: string, decimals: number, name: string) {
  const normalized = value.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`${name} must be a positive decimal number`);
  }

  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals && /[1-9]/.test(fraction.slice(decimals))) {
    throw new Error(`${name} has more precision than the $POW mint supports`);
  }

  const paddedFraction = fraction.slice(0, decimals).padEnd(decimals, "0");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFraction || "0");
}

function rawToDecimal(raw: bigint, decimals: number) {
  if (!decimals) return raw.toString();
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = (raw % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function formatPow(raw: bigint, decimals: number) {
  return `${Number(rawToDecimal(raw, decimals)).toLocaleString(undefined, {
    maximumFractionDigits: Math.min(decimals, 6),
  })} $POW`;
}

function emptyBlacklist(): BlacklistIndex {
  return { wallets: new Map(), userIds: new Map(), handles: new Map() };
}

function addBlacklistEntry(index: BlacklistIndex, entry: BlacklistRow) {
  const reason = entry.reason?.trim() || defaultBlacklistReason;
  const wallet = entry.wallet ? validPublicKey(entry.wallet) : null;
  const userId = entry.x_user_id?.trim();
  const handle = normalizeHandle(entry.x_handle);
  if (wallet) index.wallets.set(wallet, reason);
  if (userId) index.userIds.set(userId, reason);
  if (handle) index.handles.set(handle, reason);
}

async function readBlacklist(db: SupabaseClient): Promise<BlacklistIndex> {
  const index = emptyBlacklist();
  for (const wallet of csvEnv("BLACKLISTED_WORKER_WALLETS")) {
    addBlacklistEntry(index, { wallet, x_user_id: null, x_handle: null, reason: "env wallet blacklist" });
  }
  for (const handle of csvEnv("BLACKLISTED_X_HANDLES")) {
    addBlacklistEntry(index, { wallet: null, x_user_id: null, x_handle: handle, reason: "env X handle blacklist" });
  }
  for (const userId of csvEnv("BLACKLISTED_X_USER_IDS")) {
    addBlacklistEntry(index, { wallet: null, x_user_id: userId, x_handle: null, reason: "env X user blacklist" });
  }

  const result = await db.from("pow_blacklist").select("wallet,x_user_id,x_handle,reason").eq("active", true);
  if (result.error) {
    console.warn(`POW blacklist table unavailable: ${result.error.message}`);
    return index;
  }
  for (const entry of (result.data ?? []) as BlacklistRow[]) addBlacklistEntry(index, entry);
  return index;
}

function blacklistReason(
  index: BlacklistIndex,
  input: { wallet?: string | null; xUserId?: string | null; handle?: string | null },
) {
  const wallet = input.wallet ? validPublicKey(input.wallet) : null;
  if (wallet && index.wallets.has(wallet)) return index.wallets.get(wallet);
  const userId = input.xUserId?.trim();
  if (userId && index.userIds.has(userId)) return index.userIds.get(userId);
  const handle = normalizeHandle(input.handle);
  if (handle && index.handles.has(handle)) return index.handles.get(handle);
  return null;
}

const rpcUrl = requiredEnv("SOLANA_RPC_URL");
const powMint = new PublicKey(process.env.POW_TOKEN_MINT?.trim() || requiredEnv("SOURCE_TOKEN_MINT"));
const payoutWallet = parsePrivateKey(
  process.env.POW_PAYOUT_WALLET_PRIVATE_KEY?.trim() || requiredEnv("FEE_WALLET_PRIVATE_KEY"),
);
const tokenProgram = new PublicKey(process.env.POW_TOKEN_PROGRAM_ID?.trim() || TOKEN_PROGRAM_ID.toBase58());
const maxWorkers = integerEnv("MAX_PAYOUT_WORKERS", 100);
const minScore = numberEnv("MIN_WORKER_SCORE", 1);
const minWorkerPow = powMinimumHolding;
const payoutBps = integerEnv("POW_PAYOUT_BALANCE_BPS", 1);
const maxTransfersPerTx = integerEnv("MAX_TOKEN_TRANSFERS_PER_TX", 4);
const reserveSol = numberEnv("SOL_FEE_RESERVE", 0.25);
const epochMs = integerEnv("REWARDS_EPOCH_MS", 15 * 60 * 1000);
const stateDirectory = path.resolve(process.env.REWARDS_STATE_DIR?.trim() || "work/rewards-state");

if (maxWorkers < 1 || maxWorkers > 500) throw new Error("MAX_PAYOUT_WORKERS must be from 1 to 500");
if (maxTransfersPerTx < 1 || maxTransfersPerTx > 6) throw new Error("MAX_TOKEN_TRANSFERS_PER_TX must be from 1 to 6");
if (payoutBps < 1 || payoutBps > 100) throw new Error("POW_PAYOUT_BALANCE_BPS must be from 1 to 100");
if (epochMs < 60_000) throw new Error("REWARDS_EPOCH_MS must be at least 60000");

if (execute) {
  for (const name of [
    "POW_PAYOUT_BALANCE_BPS",
    "MAX_POW_PAYOUT_TOKENS_PER_EPOCH",
    "POW_TOKEN_RESERVE",
    "MIN_POW_PAYOUT_TOKENS",
  ]) requiredEnv(name);
  if (process.env.ENABLE_POW_PAYOUTS !== "true") throw new Error("ENABLE_POW_PAYOUTS must be true for live payouts");
  if (process.env.POW_PAYOUT_EXECUTION_ACK !== liveExecutionAck) {
    throw new Error(`POW_PAYOUT_EXECUTION_ACK must equal ${liveExecutionAck}`);
  }
}

const connection = new Connection(rpcUrl, "confirmed");
const bucketStart = Math.floor(Date.now() / epochMs) * epochMs;
const startedAt = new Date(bucketStart).toISOString();
const epochId = `${startedAt}:${execute ? "execute" : "preview"}`;
const epochRecord: EpochRecord = {
  epochId,
  startedAt,
  mode: execute ? "execute" : "preview",
  status: "running",
  payoutAsset: "POW",
  rewardMint: powMint.toBase58(),
  payoutSignatures: [],
};

function supabase() {
  return createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

async function writeEpochRecord() {
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(path.join(stateDirectory, "last-epoch.json"), `${JSON.stringify(epochRecord, null, 2)}\n`, "utf8");
}

async function completeEpoch(distributedRaw: bigint, decimals: number) {
  epochRecord.status = "completed";
  epochRecord.completedAt = new Date().toISOString();
  epochRecord.distributedRaw = distributedRaw.toString();
  await writeEpochRecord();
  await completeDbEpoch(epochId, {
    eligibleCount: epochRecord.eligibleCount ?? 0,
    distributedRewardRaw: distributedRaw.toString(),
    distributedRewardAmount: rawToDecimal(distributedRaw, decimals),
  });
}

async function failEpoch(error: unknown) {
  epochRecord.status = "failed";
  epochRecord.completedAt = new Date().toISOString();
  epochRecord.error = error instanceof Error ? error.message : String(error);
  await writeEpochRecord();
  await failDbEpoch(epochId, error);
}

async function readWorkers(): Promise<VerifiedWorker[]> {
  const db = supabase();
  const [result, blacklist] = await Promise.all([
    db
      .from("pow_verified_workers")
      .select("wallet,x_user_id,x_handle,score,holding_tokens,status")
      .in("status", ["verified", "paid"])
      .gte("score", minScore)
      .gte("holding_tokens", minWorkerPow)
      .order("score", { ascending: false })
      .limit(maxWorkers),
    readBlacklist(db),
  ]);
  if (result.error) throw result.error;

  return ((result.data ?? []) as VerifiedWorker[]).filter((worker) => {
    const exclusion = blacklistReason(blacklist, {
      wallet: worker.wallet,
      xUserId: worker.x_user_id,
      handle: worker.x_handle,
    });
    if (exclusion) {
      console.log(`Excluded @${worker.x_handle || compactWallet(worker.wallet)} from payout: ${exclusion}`);
      return false;
    }
    return true;
  });
}

function allocationsForWorkers(workers: VerifiedWorker[], totalRaw: bigint, minPayoutRaw: bigint) {
  const usable = workers
    .map((worker) => ({
      wallet: worker.wallet,
      handle: worker.x_handle || compactWallet(worker.wallet),
      score: toScore(worker.score),
      scoreRaw: BigInt(Math.max(1, Math.floor(toScore(worker.score) * 1_000_000))),
    }))
    .filter((worker) => worker.score >= minScore);
  const totalScoreRaw = usable.reduce((sum, worker) => sum + worker.scoreRaw, 0n);
  if (!usable.length || totalScoreRaw <= 0n) return [];

  const allocations = usable
    .map((worker) => ({
      wallet: worker.wallet,
      handle: worker.handle,
      score: worker.score,
      amountRaw: (totalRaw * worker.scoreRaw) / totalScoreRaw,
    }))
    .filter((allocation) => allocation.amountRaw >= minPayoutRaw);

  if (allocations.length) {
    const allocated = allocations.reduce((sum, allocation) => sum + allocation.amountRaw, 0n);
    allocations[0].amountRaw += totalRaw - allocated;
  }
  return allocations;
}

function payoutRows(allocations: Allocation[], decimals: number): WorkerPayoutRow[] {
  return allocations.map((allocation) => ({
    wallet: allocation.wallet,
    rewardAmountRaw: allocation.amountRaw.toString(),
    rewardAmount: rawToDecimal(allocation.amountRaw, decimals),
  }));
}

function chunk<T>(values: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

async function buildPayoutTransaction(
  batch: Allocation[],
  sourceTokenAccount: PublicKey,
  decimals: number,
) {
  const tx = new Transaction();
  for (const allocation of batch) {
    const owner = new PublicKey(allocation.wallet);
    const destination = await getAssociatedTokenAddress(
      powMint,
      owner,
      false,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    if (!(await connection.getAccountInfo(destination, "confirmed"))) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          payoutWallet.publicKey,
          destination,
          owner,
          powMint,
          tokenProgram,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }
    tx.add(
      createTransferCheckedInstruction(
        sourceTokenAccount,
        powMint,
        destination,
        payoutWallet.publicKey,
        allocation.amountRaw,
        decimals,
        [],
        tokenProgram,
      ),
    );
  }
  return tx;
}

async function sendTransaction(tx: Transaction, label: string) {
  const blockhash = await connection.getLatestBlockhash("confirmed");
  tx.feePayer = payoutWallet.publicKey;
  tx.recentBlockhash = blockhash.blockhash;
  tx.sign(payoutWallet);

  const simulation = await connection.simulateTransaction(tx);
  if (simulation.value.err) {
    console.error(simulation.value.logs?.join("\n"));
    throw new Error(`${label} simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 3,
    skipPreflight: false,
  });
  await connection.confirmTransaction({ ...blockhash, signature }, "confirmed");
  console.log(`${label}: ${signature}`);
  return signature;
}

async function run() {
  let plannedRows: WorkerPayoutRow[] = [];
  try {
    const mintInfo = await getMint(connection, powMint, "confirmed", tokenProgram);
    const sourceTokenAccount = await getAssociatedTokenAddress(
      powMint,
      payoutWallet.publicKey,
      false,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    const sourceAccount = await getAccount(connection, sourceTokenAccount, "confirmed", tokenProgram);
    const sourceBalance = sourceAccount.amount;
    const reserveRaw = decimalToRaw(process.env.POW_TOKEN_RESERVE?.trim() || "0", mintInfo.decimals, "POW_TOKEN_RESERVE");
    const maxEpochRaw = decimalToRaw(process.env.MAX_POW_PAYOUT_TOKENS_PER_EPOCH?.trim() || "10000", mintInfo.decimals, "MAX_POW_PAYOUT_TOKENS_PER_EPOCH");
    const minPayoutRaw = decimalToRaw(process.env.MIN_POW_PAYOUT_TOKENS?.trim() || "1", mintInfo.decimals, "MIN_POW_PAYOUT_TOKENS");
    const spendable = sourceBalance > reserveRaw ? sourceBalance - reserveRaw : 0n;
    const percentageBudget = (spendable * BigInt(payoutBps)) / 10_000n;
    const budget = minBigInt(spendable, percentageBudget, maxEpochRaw);
    const walletSol = await connection.getBalance(payoutWallet.publicKey, "confirmed");

    epochRecord.sourceBalanceRaw = sourceBalance.toString();
    epochRecord.budgetRaw = budget.toString();
    await writeEpochRecord();

    const started = await startDbEpoch({
      epochId,
      startedAt,
      mode: execute ? "execute" : "preview",
      campaignSlug: "pow",
      sourceMint: powMint.toBase58(),
      rewardMint: powMint.toBase58(),
      sourceRewardBalanceRaw: sourceBalance.toString(),
      sourceRewardBalance: rawToDecimal(sourceBalance, mintInfo.decimals),
    });
    if (!started) {
      epochRecord.status = "skipped";
      await writeEpochRecord();
      console.log(`Epoch ${epochId} already exists; duplicate payout prevented.`);
      return;
    }

    console.log(`Mode: ${execute ? "EXECUTE" : "PREVIEW ONLY"}`);
    console.log(`Payout wallet: ${payoutWallet.publicKey.toBase58()}`);
    console.log(`POW mint: ${powMint.toBase58()}`);
    console.log(`Wallet balance: ${formatPow(sourceBalance, mintInfo.decimals)}`);
    console.log(`15-minute budget: ${formatPow(budget, mintInfo.decimals)} (${payoutBps} bps, hard capped)`);

    if (BigInt(walletSol) < BigInt(Math.floor(reserveSol * LAMPORTS_PER_SOL))) {
      throw new Error(`Payout wallet needs at least ${reserveSol} SOL for token-account rent and transaction fees`);
    }
    if (budget < minPayoutRaw) {
      console.log("Configured $POW budget is below the minimum payout; nothing will be sent.");
      await completeEpoch(0n, mintInfo.decimals);
      return;
    }

    const workers = await readWorkers();
    const allocations = allocationsForWorkers(workers, budget, minPayoutRaw);
    epochRecord.eligibleCount = allocations.length;
    if (!allocations.length) {
      console.log("No eligible workers meet the holding and score thresholds; nothing will be sent.");
      await completeEpoch(0n, mintInfo.decimals);
      return;
    }

    console.log(`Payout recipients: ${allocations.length}`);
    for (const allocation of allocations.slice(0, 10)) {
      console.log(`  @${allocation.handle}: ${formatPow(allocation.amountRaw, mintInfo.decimals)} (${allocation.score.toFixed(2)} pts)`);
    }

    plannedRows = payoutRows(allocations, mintInfo.decimals);
    if (!execute) {
      await dryRunPayouts(epochId, powMint.toBase58(), plannedRows);
      console.log("Preview complete. No transaction was signed and no $POW was sent.");
      await completeEpoch(0n, mintInfo.decimals);
      return;
    }

    await planPayouts(epochId, powMint.toBase58(), plannedRows);
    let distributed = 0n;
    let batchNumber = 0;
    for (const batch of chunk(allocations, maxTransfersPerTx)) {
      batchNumber += 1;
      const batchRows = payoutRows(batch, mintInfo.decimals);
      try {
        const tx = await buildPayoutTransaction(batch, sourceTokenAccount, mintInfo.decimals);
        const signature = await sendTransaction(tx, `POW payout batch ${batchNumber}`);
        distributed += batch.reduce((sum, allocation) => sum + allocation.amountRaw, 0n);
        epochRecord.payoutSignatures.push(signature);
        await settlePayouts(epochId, batchRows, signature);
      } catch (error) {
        await failPayouts(epochId, batchRows, error);
        throw error;
      }
    }

    await completeEpoch(distributed, mintInfo.decimals);
  } catch (error) {
    if (plannedRows.length) await failPayouts(epochId, plannedRows, error);
    await failEpoch(error);
    throw error;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
