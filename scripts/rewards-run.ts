import "dotenv/config";
import Module from "module";
import path from "path";
import bs58 from "bs58";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { mkdir, open, unlink, writeFile, type FileHandle } from "fs/promises";
import {
  completeEpoch as completeDbEpoch,
  dryRunPayouts,
  failEpoch as failDbEpoch,
  failPayouts,
  planPayouts,
  recordClaim,
  settlePayouts,
  startEpoch as startDbEpoch,
  type WorkerPayoutRow,
} from "./rewards-db";

type OnlinePumpSdkInstance = {
  collectCoinCreatorFeeV2Instructions(
    creator: PublicKey,
    quoteMint: PublicKey,
    quoteTokenProgram: PublicKey,
    feePayer?: PublicKey,
  ): Promise<TransactionInstruction[]>;
  getCreatorVaultBalanceBothPrograms(creator: PublicKey): Promise<{
    toString(): string;
  }>;
};

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
  lamports: bigint;
};

type EpochRecord = {
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  sourceMint: string;
  payoutAsset: "SOL";
  claimLamports?: string;
  distributedLamports?: string;
  eligibleCount?: number;
  claimSignature?: string | null;
  payoutSignatures: string[];
  error?: string;
};

const require = Module.createRequire(import.meta.url);
const { OnlinePumpSdk } = require("@pump-fun/pump-sdk") as {
  OnlinePumpSdk: new (connection: Connection) => OnlinePumpSdkInstance;
};

const execute = process.argv.includes("--execute");
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
  const parsed = Math.trunc(numberEnv(name, fallback));
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be an integer`);
  return parsed;
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

function solToLamports(sol: number) {
  return BigInt(Math.floor(sol * LAMPORTS_PER_SOL));
}

function formatLamports(lamports: bigint) {
  return `${(Number(lamports) / LAMPORTS_PER_SOL).toLocaleString(undefined, {
    maximumFractionDigits: 9,
  })} SOL`;
}

function toScore(value: unknown) {
  const score = Number(value ?? 0);
  return Number.isFinite(score) && score > 0 ? score : 0;
}

function compactWallet(wallet: string) {
  return wallet.length > 12 ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : wallet;
}

function emptyBlacklist(): BlacklistIndex {
  return {
    wallets: new Map(),
    userIds: new Map(),
    handles: new Map(),
  };
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

  const result = await db
    .from("pow_blacklist")
    .select("wallet,x_user_id,x_handle,reason")
    .eq("active", true);

  if (result.error) {
    console.warn(`POW blacklist table unavailable: ${result.error.message}`);
    return index;
  }

  for (const entry of (result.data ?? []) as BlacklistRow[]) {
    addBlacklistEntry(index, entry);
  }

  return index;
}

function blacklistReason(
  index: BlacklistIndex,
  input: { wallet?: string | null; xUserId?: string | null; handle?: string | null },
) {
  const wallet = input.wallet ? validPublicKey(input.wallet) : null;
  if (wallet && index.wallets.has(wallet)) return index.wallets.get(wallet) ?? defaultBlacklistReason;

  const userId = input.xUserId?.trim();
  if (userId && index.userIds.has(userId)) return index.userIds.get(userId) ?? defaultBlacklistReason;

  const handle = normalizeHandle(input.handle);
  if (handle && index.handles.has(handle)) return index.handles.get(handle) ?? defaultBlacklistReason;

  return null;
}

function payoutRows(allocations: Allocation[]): WorkerPayoutRow[] {
  return allocations.map((allocation) => ({
    wallet: allocation.wallet,
    rewardAmountRaw: allocation.lamports.toString(),
    rewardAmount: (Number(allocation.lamports) / LAMPORTS_PER_SOL).toString(),
  }));
}

const rpcUrl = requiredEnv("SOLANA_RPC_URL");
const sourceMintText = requiredEnv("SOURCE_TOKEN_MINT");
const maxClaimSol = numberEnv("MAX_CREATOR_FEE_CLAIM_SOL", 0.02);
const maxWorkers = integerEnv("MAX_PAYOUT_WORKERS", 100);
const minScore = numberEnv("MIN_WORKER_SCORE", 1);
const minWorkerPow = numberEnv("MIN_WORKER_POW_BALANCE", 1_000_000);
const minPayoutLamports = BigInt(integerEnv("MIN_PAYOUT_LAMPORTS", 10_000));
const maxTransfersPerTx = integerEnv("MAX_SOL_TRANSFERS_PER_TX", 8);
const reserveSol = numberEnv("SOL_FEE_RESERVE", 0.02);
const stateDirectory = path.resolve(process.env.REWARDS_STATE_DIR?.trim() || "work/rewards-state");
const lockPath = path.join(stateDirectory, "epoch.lock");

if (maxWorkers < 1 || maxWorkers > 500) {
  throw new Error("MAX_PAYOUT_WORKERS must be an integer from 1 to 500");
}
if (maxTransfersPerTx < 1 || maxTransfersPerTx > 12) {
  throw new Error("MAX_SOL_TRANSFERS_PER_TX must be an integer from 1 to 12");
}
if (!Number.isFinite(maxClaimSol) || maxClaimSol <= 0) {
  throw new Error("MAX_CREATOR_FEE_CLAIM_SOL must be positive");
}

const connection = new Connection(rpcUrl, "confirmed");
const wallet = parsePrivateKey(requiredEnv("FEE_WALLET_PRIVATE_KEY"));
const sourceMint = new PublicKey(sourceMintText);
const sdk = new OnlinePumpSdk(connection);
const epochId = new Date().toISOString();
const epochRecord: EpochRecord = {
  startedAt: epochId,
  status: "running",
  sourceMint: sourceMint.toBase58(),
  payoutAsset: "SOL",
  payoutSignatures: [],
};

function supabase() {
  const url = requiredEnv("SUPABASE_URL");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function acquireLock(): Promise<FileHandle | null> {
  await mkdir(stateDirectory, { recursive: true });
  try {
    return await open(lockPath, "wx");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return null;
    throw error;
  }
}

async function releaseLock(lock: FileHandle | null) {
  if (!lock) return;
  await lock.close();
  await unlink(lockPath).catch(() => undefined);
}

async function writeEpochRecord() {
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(
    path.join(stateDirectory, "last-epoch.json"),
    `${JSON.stringify(epochRecord, null, 2)}\n`,
    "utf8",
  );
}

async function completeEpoch(distributedLamports: bigint) {
  epochRecord.status = "completed";
  epochRecord.completedAt = new Date().toISOString();
  epochRecord.distributedLamports = distributedLamports.toString();
  await writeEpochRecord();
  await completeDbEpoch(epochId, {
    eligibleCount: epochRecord.eligibleCount ?? 0,
    claimLamports: epochRecord.claimLamports ?? "0",
    distributedLamports: distributedLamports.toString(),
    distributedSol: (Number(distributedLamports) / LAMPORTS_PER_SOL).toString(),
  });
}

async function failEpoch(error: unknown) {
  epochRecord.status = "failed";
  epochRecord.completedAt = new Date().toISOString();
  epochRecord.error = error instanceof Error ? error.message : String(error);
  await writeEpochRecord();
  await failDbEpoch(epochId, error);
}

async function simulateLegacy(tx: Transaction, label: string) {
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  tx.sign(wallet);

  const result = await connection.simulateTransaction(tx);
  if (result.value.err) {
    console.error(result.value.logs?.join("\n"));
    throw new Error(`${label} simulation failed: ${JSON.stringify(result.value.err)}`);
  }

  console.log(`${label}: simulation passed`);
}

async function sendLegacy(tx: Transaction, label: string) {
  await simulateLegacy(tx, label);

  if (!execute) return null;

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 3,
    skipPreflight: false,
  });
  await connection.confirmTransaction(signature, "confirmed");
  console.log(`${label}: ${signature}`);
  return signature;
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
      console.log(`Excluded @${worker.x_handle || compactWallet(worker.wallet)} from payroll: ${exclusion}`);
      return false;
    }

    return true;
  });
}

function allocationsForWorkers(workers: VerifiedWorker[], totalLamports: bigint) {
  const usableWorkers = workers
    .map((worker) => ({
      wallet: worker.wallet,
      handle: worker.x_handle || compactWallet(worker.wallet),
      score: toScore(worker.score),
    }))
    .filter((worker) => worker.score >= minScore);

  const totalScore = usableWorkers.reduce((sum, worker) => sum + worker.score, 0);
  if (!usableWorkers.length || totalScore <= 0) return [];

  let allocated = 0n;
  const allocations = usableWorkers
    .map((worker) => {
      const lamports = (totalLamports * BigInt(Math.floor(worker.score * 1_000_000))) /
        BigInt(Math.floor(totalScore * 1_000_000));
      allocated += lamports;
      return { ...worker, lamports };
    })
    .filter((allocation) => allocation.lamports >= minPayoutLamports);

  if (allocations.length) {
    const recalculated = allocations.reduce((sum, allocation) => sum + allocation.lamports, 0n);
    allocations[0].lamports += totalLamports - recalculated;
  }

  return allocations;
}

function buildPayoutTransaction(batch: Allocation[]) {
  const tx = new Transaction();
  for (const allocation of batch) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(allocation.wallet),
        lamports: Number(allocation.lamports),
      }),
    );
  }
  return tx;
}

function chunk<T>(values: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

async function run() {
  const lock = await acquireLock();
  if (!lock) {
    console.log("Previous POW payroll epoch is still running; skipping.");
    return;
  }

  try {
    await writeEpochRecord();
    await startDbEpoch({
      epochId,
      mode: execute ? "execute" : "preview",
      sourceMint: sourceMint.toBase58(),
      rewardAsset: "SOL",
    });

    const walletSol = BigInt(await connection.getBalance(wallet.publicKey, "confirmed"));
    const reserveLamports = solToLamports(reserveSol);
    const claimable = BigInt(
      (await sdk.getCreatorVaultBalanceBothPrograms(wallet.publicKey)).toString(),
    );
    const maxClaimLamports = solToLamports(maxClaimSol);

    console.log(`Mode: ${execute ? "EXECUTE" : "PREVIEW ONLY"}`);
    console.log(`Fee wallet: ${wallet.publicKey.toBase58()}`);
    console.log(`POW mint: ${sourceMint.toBase58()}`);
    console.log(`Wallet SOL reserve: ${formatLamports(walletSol)}`);
    console.log(`Claimable creator fees: ${formatLamports(claimable)}`);

    if (walletSol < reserveLamports) {
      throw new Error(`Fee wallet SOL reserve is too low (${formatLamports(walletSol)} < ${reserveSol} SOL)`);
    }

    if (claimable > maxClaimLamports) {
      throw new Error(
        `Claimable fees exceed MAX_CREATOR_FEE_CLAIM_SOL (${formatLamports(
          claimable,
        )} > ${maxClaimSol} SOL); raise the cap before claiming`,
      );
    }

    if (claimable <= 0n) {
      console.log("No creator fees are available for this epoch; nothing to pay.");
      await completeEpoch(0n);
      return;
    }

    const workers = await readWorkers();
    const allocations = allocationsForWorkers(workers, claimable);
    epochRecord.eligibleCount = allocations.length;
    epochRecord.claimLamports = claimable.toString();

    if (!allocations.length) {
      console.log("No verified workers with enough score; creator fees were not claimed.");
      await completeEpoch(0n);
      return;
    }

    console.log(`Payroll recipients: ${allocations.length}`);
    for (const allocation of allocations.slice(0, 10)) {
      console.log(
        `  @${allocation.handle}: ${formatLamports(allocation.lamports)} (${allocation.score.toFixed(2)} pts)`,
      );
    }

    const dbRows = payoutRows(allocations);
    if (!execute) {
      await dryRunPayouts(epochId, dbRows);
      console.log("SOL payroll is preview-only. No creator fees were claimed and no SOL was sent.");
      await completeEpoch(claimable);
      return;
    }

    const claimInstructions = await sdk.collectCoinCreatorFeeV2Instructions(
      wallet.publicKey,
      NATIVE_MINT,
      TOKEN_PROGRAM_ID,
      wallet.publicKey,
    );
    const claimTx = new Transaction().add(...claimInstructions);
    epochRecord.claimSignature = await sendLegacy(claimTx, "Creator fee claim");
    await recordClaim(epochId, claimable.toString(), epochRecord.claimSignature);
    await planPayouts(epochId, dbRows);

    let distributed = 0n;
    let batchNumber = 0;
    for (const batch of chunk(allocations, maxTransfersPerTx)) {
      batchNumber += 1;
      const tx = buildPayoutTransaction(batch);
      const signature = await sendLegacy(tx, `POW SOL payroll batch ${batchNumber}`);
      distributed += batch.reduce((sum, allocation) => sum + allocation.lamports, 0n);
      if (signature) {
        epochRecord.payoutSignatures.push(signature);
        await settlePayouts(epochId, payoutRows(batch), signature);
      }
    }

    await completeEpoch(distributed);
  } catch (error) {
    await failEpoch(error);
    throw error;
  } finally {
    await releaseLock(lock);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
