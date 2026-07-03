import "dotenv/config";
import Module from "module";
import path from "path";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getMint,
} from "@solana/spl-token";
import {
  mkdir,
  open,
  readFile,
  unlink,
  writeFile,
  type FileHandle,
} from "fs/promises";

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

type HolderEntry = readonly [owner: string, amount: bigint];

type EpochRecord = {
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  sourceMint: string;
  payoutAsset: "SOL";
  beggarFundWallet?: string;
  claimLamports?: string;
  beggarFundLamports?: string;
  holderRewardLamports?: string;
  claimSignature?: string | null;
  beggarFundSignature?: string | null;
  airdropSignatures: string[];
  error?: string;
};

const require = Module.createRequire(import.meta.url);
const { OnlinePumpSdk } = require("@pump-fun/pump-sdk") as {
  OnlinePumpSdk: new (connection: Connection) => OnlinePumpSdkInstance;
};

const execute = process.argv.includes("--execute");
const airdropOnly = process.argv.includes("--airdrop-only");
const claimSplitOnly =
  process.argv.includes("--claim-only") || process.argv.includes("--claim-swap-only");

const rpcUrl = requiredEnv("SOLANA_RPC_URL");
const sourceMintText = requiredEnv("SOURCE_TOKEN_MINT");
const maxClaimSol = numberEnv("MAX_CREATOR_FEE_CLAIM_SOL", numberEnv("MAX_SWAP_SOL", 0.02));
const maxRecipients = integerEnv("MAX_AIRDROP_RECIPIENTS", 50);
const minHolderTokens = numberEnv("MIN_HOLDER_TOKEN_BALANCE", 100_000);
const reserveSol = numberEnv("SOL_FEE_RESERVE", 0.02);
const beggarFundBps = integerEnv("BEGGAR_FUND_BPS", 5_000);
const maxHolderSupplyBps = integerEnv("MAX_HOLDER_SUPPLY_BPS", 0);
const airdropOnlySol = numberEnv("AIRDROP_ONLY_SOL", 0);
const stateDirectory = path.resolve(process.env.REWARDS_STATE_DIR?.trim() || "work/rewards-state");
const lockPath = path.join(stateDirectory, "epoch.lock");

if (!Number.isFinite(maxClaimSol) || maxClaimSol <= 0) {
  throw new Error(`MAX_CREATOR_FEE_CLAIM_SOL must be a positive number, got ${maxClaimSol}`);
}
if (maxRecipients < 1 || maxRecipients > 50) {
  throw new Error("MAX_AIRDROP_RECIPIENTS must be an integer from 1 to 50");
}
if (!Number.isFinite(minHolderTokens) || minHolderTokens < 0) {
  throw new Error("MIN_HOLDER_TOKEN_BALANCE must be a non-negative number");
}
if (!Number.isFinite(reserveSol) || reserveSol < 0) {
  throw new Error("SOL_FEE_RESERVE must be a non-negative number");
}
if (beggarFundBps < 0 || beggarFundBps > 10_000) {
  throw new Error("BEGGAR_FUND_BPS must be an integer from 0 to 10000");
}
if (maxHolderSupplyBps < 0 || maxHolderSupplyBps > 10_000) {
  throw new Error("MAX_HOLDER_SUPPLY_BPS must be an integer from 0 to 10000");
}
if (!Number.isFinite(airdropOnlySol) || airdropOnlySol < 0) {
  throw new Error("AIRDROP_ONLY_SOL must be a non-negative number");
}

const connection = new Connection(rpcUrl, "confirmed");
const wallet = keypairFromEnv("FEE_WALLET_PRIVATE_KEY");
const sourceMint = new PublicKey(sourceMintText);
const beggarFundWallet = process.env.BEGGAR_FUND_WALLET?.trim()
  ? new PublicKey(process.env.BEGGAR_FUND_WALLET.trim())
  : null;
const sdk = new OnlinePumpSdk(connection);
const epochRecord: EpochRecord = {
  startedAt: new Date().toISOString(),
  status: "running",
  sourceMint: sourceMint.toBase58(),
  payoutAsset: "SOL",
  beggarFundWallet: beggarFundWallet?.toBase58(),
  airdropSignatures: [],
};

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
  const parsed = numberEnv(name, fallback);
  if (!Number.isInteger(parsed)) throw new Error(`${name} must be an integer`);
  return parsed;
}

function keypairFromEnv(name: string) {
  const raw = process.env[name]?.trim();
  if (!raw) throw new Error(`${name} is required`);

  let bytes: Uint8Array;
  if (raw.startsWith("[")) {
    bytes = Uint8Array.from(JSON.parse(raw) as number[]);
  } else {
    bytes = bs58.decode(raw);
  }

  if (bytes.length === 64) return Keypair.fromSecretKey(bytes);
  if (bytes.length === 32) return Keypair.fromSeed(bytes);
  throw new Error(`${name} must decode to 32 or 64 bytes`);
}

function publicKeyOrNull(value: string) {
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

function solToLamports(sol: number) {
  return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
}

function rawTokenAmount(tokens: number, decimals: number) {
  return BigInt(Math.floor(tokens * 10 ** decimals));
}

function formatRawAmount(raw: bigint, decimals: number) {
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  if (fraction === 0n) return whole.toString();

  const fractionText = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");

  return `${whole}.${fractionText}`;
}

function formatLamports(raw: bigint | number) {
  const lamports = typeof raw === "bigint" ? raw : BigInt(raw);
  return `${formatRawAmount(lamports, 9)} SOL`;
}

function formatBps(bps: number) {
  return `${bps / 100}%`;
}

function excludedHolderWallets() {
  const excluded = new Set<string>([wallet.publicKey.toBase58()]);

  if (beggarFundWallet) excluded.add(beggarFundWallet.toBase58());

  const extraWallets = process.env.EXCLUDED_HOLDER_WALLETS?.split(",") || [];
  for (const value of extraWallets) {
    const publicKey = publicKeyOrNull(value.trim());
    if (publicKey) excluded.add(publicKey.toBase58());
  }

  return excluded;
}

async function writeEpochRecord() {
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(
    path.join(stateDirectory, "last-epoch.json"),
    `${JSON.stringify(epochRecord, null, 2)}\n`,
    "utf8",
  );
}

async function completeEpoch() {
  epochRecord.status = "completed";
  epochRecord.completedAt = new Date().toISOString();
  await writeEpochRecord();
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

async function sendLegacy(
  tx: Transaction,
  label: string,
  options: { simulateInPreview?: boolean } = {},
) {
  const simulateInPreview = options.simulateInPreview ?? true;
  if (execute || simulateInPreview) {
    await simulateLegacy(tx, label);
  } else {
    console.log(`${label}: projected; not simulated because preview does not broadcast earlier transactions`);
  }

  if (!execute) return null;

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 3,
    skipPreflight: false,
  });
  await connection.confirmTransaction(signature, "confirmed");
  console.log(`${label}: ${signature}`);
  return signature;
}

async function getTokenProgram(mint: PublicKey) {
  const info = await connection.getAccountInfo(mint);
  if (!info) throw new Error(`Token mint does not exist: ${mint.toBase58()}`);
  if (info.owner.equals(TOKEN_PROGRAM_ID)) return TOKEN_PROGRAM_ID;
  if (info.owner.equals(TOKEN_2022_PROGRAM_ID)) return TOKEN_2022_PROGRAM_ID;
  throw new Error(`Unsupported mint owner: ${info.owner.toBase58()}`);
}

async function getSnapshot(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
): Promise<HolderEntry[]> {
  const balances = new Map<string, bigint>();
  const snapshotFile = process.env.HOLDER_SNAPSHOT_FILE?.trim();

  if (snapshotFile) {
    const report = JSON.parse(await readFile(snapshotFile, "utf8")) as {
      topHolders?: Array<{ owner?: string; amount?: string | number }>;
    };

    for (const holder of report.topHolders || []) {
      if (!holder.owner || holder.amount === undefined) continue;
      const owner = publicKeyOrNull(holder.owner);
      if (!owner) continue;

      const amount = BigInt(holder.amount);
      const ownerText = owner.toBase58();
      balances.set(ownerText, (balances.get(ownerText) || 0n) + amount);
    }
  }

  try {
    const accounts = balances.size
      ? []
      : await connection.getParsedProgramAccounts(sourceTokenProgram, {
          filters: [{ memcmp: { offset: 0, bytes: sourceMint.toBase58() } }],
        });

    for (const account of accounts) {
      const parsed = (account.account.data as any).parsed?.info;
      if (!parsed?.owner || !parsed?.tokenAmount?.amount) continue;
      const owner = publicKeyOrNull(parsed.owner);
      if (!owner) continue;

      const amount = BigInt(parsed.tokenAmount.amount);
      const ownerText = owner.toBase58();
      balances.set(ownerText, (balances.get(ownerText) || 0n) + amount);
    }
  } catch (error) {
    console.warn(
      `Full holder scan unavailable; using largest-holder fallback: ${
        error instanceof Error ? error.message : error
      }`,
    );

    const largest = await connection.getTokenLargestAccounts(sourceMint, "confirmed");
    const tokenAccounts = largest.value.map((entry) => entry.address);
    const parsedAccounts = await connection.getMultipleParsedAccounts(tokenAccounts, {
      commitment: "confirmed",
    });

    for (const account of parsedAccounts.value) {
      const parsed = (account?.data as any)?.parsed?.info;
      if (!parsed?.owner || !parsed?.tokenAmount?.amount) continue;
      const owner = publicKeyOrNull(parsed.owner);
      if (!owner) continue;

      const amount = BigInt(parsed.tokenAmount.amount);
      const ownerText = owner.toBase58();
      balances.set(ownerText, (balances.get(ownerText) || 0n) + amount);
    }
  }

  const excluded = excludedHolderWallets();
  const minimum = rawTokenAmount(minHolderTokens, sourceDecimals);

  const candidates = [...balances.entries()]
    .filter(([owner, amount]) => {
      const ownerKey = publicKeyOrNull(owner);
      if (!ownerKey || excluded.has(owner) || amount < minimum) return false;
      if (!PublicKey.isOnCurve(ownerKey.toBytes())) return false;
      if (
        maxHolderSupplyBps > 0 &&
        sourceSupply > 0n &&
        amount * 10_000n >= sourceSupply * BigInt(maxHolderSupplyBps)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1));

  if (!candidates.length) return [];

  const limitedCandidates = candidates.slice(0, Math.min(maxRecipients * 2, 100));
  const ownerInfos = await connection.getMultipleAccountsInfo(
    limitedCandidates.map(([owner]) => new PublicKey(owner)),
    { commitment: "confirmed" },
  );

  return limitedCandidates
    .filter((_, index) => !ownerInfos[index]?.executable)
    .slice(0, maxRecipients);
}

function buildSolTransfer(toPubkey: PublicKey, lamports: bigint) {
  if (lamports <= 0n) throw new Error("SOL transfer amount must be positive");
  if (lamports > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("SOL transfer is too large for a single SystemProgram transfer");
  }

  return SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey,
    lamports: Number(lamports),
  });
}

async function distributeSol(recipients: HolderEntry[], totalLamports: bigint) {
  if (!recipients.length) throw new Error("No eligible recipients in snapshot");
  if (totalLamports <= 0n) throw new Error("SOL airdrop amount must be positive");

  const totalWeight = recipients.reduce((sum, [, amount]) => sum + amount, 0n);
  const allocations = recipients
    .map(([owner, weight]) => [owner, (totalLamports * weight) / totalWeight] as const)
    .filter(([, amount]) => amount > 0n);
  const allocatedLamports = allocations.reduce((sum, [, amount]) => sum + amount, 0n);
  const dustLamports = totalLamports - allocatedLamports;

  console.log(`Projected SOL holder rewards: ${formatLamports(allocatedLamports)}`);
  if (dustLamports > 0n) {
    console.log(`Rounding dust retained in fee wallet: ${formatLamports(dustLamports)}`);
  }
  for (const [owner, amount] of allocations) {
    console.log(`  ${owner}: ${formatLamports(amount)}`);
  }

  if (!execute) {
    console.log("SOL airdrop batches: projected only. No transactions were broadcast.");
    return;
  }

  for (let index = 0; index < allocations.length; index += 8) {
    const tx = new Transaction();
    const batchNumber = index / 8 + 1;

    for (const [ownerText, amount] of allocations.slice(index, index + 8)) {
      tx.add(buildSolTransfer(new PublicKey(ownerText), amount));
    }

    console.log(`SOL airdrop batch ${batchNumber}: ${tx.instructions.length} transfers`);
    const signature = await sendLegacy(tx, `SOL airdrop batch ${batchNumber}`);
    if (signature) epochRecord.airdropSignatures.push(signature);
  }
}

async function sendBeggarFundTransfer(amountLamports: bigint) {
  if (amountLamports <= 0n) return null;
  if (!beggarFundWallet) {
    throw new Error("BEGGAR_FUND_WALLET is required when BEGGAR_FUND_BPS is greater than zero");
  }

  const tx = new Transaction().add(buildSolTransfer(beggarFundWallet, amountLamports));
  return sendLegacy(tx, "Beggar fund transfer", { simulateInPreview: false });
}

async function runAirdropOnly(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
) {
  if (!airdropOnly) return false;
  if (!execute) throw new Error("--airdrop-only requires --execute");
  if (airdropOnlySol <= 0) {
    throw new Error("AIRDROP_ONLY_SOL must be set when using --airdrop-only");
  }

  const airdropLamports = solToLamports(airdropOnlySol);
  const reserveLamports = solToLamports(reserveSol);
  const walletSol = BigInt(await connection.getBalance(wallet.publicKey, "confirmed"));
  if (walletSol < airdropLamports + reserveLamports) {
    throw new Error("Insufficient SOL for requested holder airdrop plus configured reserve");
  }

  const snapshot = await getSnapshot(sourceTokenProgram, sourceDecimals, sourceSupply);
  console.log(`Resuming SOL airdrop with ${formatLamports(airdropLamports)}`);
  console.log(`Eligible snapshot recipients: ${snapshot.length}`);

  epochRecord.holderRewardLamports = airdropLamports.toString();
  await distributeSol(snapshot, airdropLamports);
  await completeEpoch();
  return true;
}

async function runClaimSplitAndAirdrop(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
) {
  if (beggarFundBps > 0 && !beggarFundWallet) {
    throw new Error("BEGGAR_FUND_WALLET is required when BEGGAR_FUND_BPS is greater than zero");
  }

  const walletSol = BigInt(await connection.getBalance(wallet.publicKey, "confirmed"));
  const claimable = BigInt(
    (await sdk.getCreatorVaultBalanceBothPrograms(wallet.publicKey)).toString(),
  );
  const maxClaimLamports = solToLamports(maxClaimSol);

  console.log(`Mode: ${execute ? "EXECUTE" : "PREVIEW ONLY"}`);
  console.log(`Fee wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`Beggar fund wallet: ${beggarFundWallet?.toBase58() || "not configured"}`);
  console.log(`Holder snapshot mint: ${sourceMint.toBase58()}`);
  console.log("Holder payout asset: SOL");
  console.log(`Wallet SOL: ${formatLamports(walletSol)}`);
  console.log(`Claimable creator fees: ${formatLamports(claimable)}`);

  if (claimable > maxClaimLamports) {
    throw new Error(
      `Claimable fees exceed MAX_CREATOR_FEE_CLAIM_SOL (${formatLamports(
        claimable,
      )} > ${maxClaimSol} SOL); raise the cap before claiming`,
    );
  }

  if (claimable <= 0n) {
    console.log("No creator fees are available for this epoch; nothing to claim or distribute.");
    await completeEpoch();
    return;
  }

  const beggarFundLamports = (claimable * BigInt(beggarFundBps)) / 10_000n;
  const holderRewardLamports = claimable - beggarFundLamports;
  const reserveLamports = solToLamports(reserveSol);
  const projectedAfterClaim = walletSol + claimable;

  epochRecord.claimLamports = claimable.toString();
  epochRecord.beggarFundLamports = beggarFundLamports.toString();
  epochRecord.holderRewardLamports = holderRewardLamports.toString();

  console.log(
    `Split: ${formatBps(beggarFundBps)} to Beg Pool (${formatLamports(
      beggarFundLamports,
    )}), ${formatBps(10_000 - beggarFundBps)} to SOL holder rewards (${formatLamports(
      holderRewardLamports,
    )})`,
  );

  if (projectedAfterClaim < claimable + reserveLamports) {
    throw new Error("Insufficient SOL after projected claim for split, holder payout, and reserve");
  }

  const claimInstructions = await sdk.collectCoinCreatorFeeV2Instructions(
    wallet.publicKey,
    NATIVE_MINT,
    TOKEN_PROGRAM_ID,
    wallet.publicKey,
  );

  const claimTx = new Transaction().add(...claimInstructions);
  epochRecord.claimSignature = await sendLegacy(claimTx, "Creator fee claim");
  epochRecord.beggarFundSignature = await sendBeggarFundTransfer(beggarFundLamports);

  if (holderRewardLamports <= 0n) {
    console.log("Holder reward split is zero for this epoch; skipping holder airdrop.");
    await completeEpoch();
    return;
  }

  if (claimSplitOnly) {
    console.log("Claim/split only mode enabled; skipping holder SOL airdrop.");
    await completeEpoch();
    return;
  }

  const snapshot = await getSnapshot(sourceTokenProgram, sourceDecimals, sourceSupply);
  console.log(`Eligible snapshot recipients: ${snapshot.length}`);

  await distributeSol(snapshot, holderRewardLamports);

  if (!execute) {
    console.log("Preview complete. No transactions were broadcast.");
  }

  await completeEpoch();
}

async function main() {
  await mkdir(stateDirectory, { recursive: true });

  let lock: FileHandle;
  try {
    lock = await open(lockPath, "wx");
  } catch (error: any) {
    if (error?.code === "EEXIST") {
      console.log("Another rewards epoch is already running; skipping this interval.");
      return;
    }
    throw error;
  }

  try {
    await writeEpochRecord();

    const sourceTokenProgram = await getTokenProgram(sourceMint);
    const sourceMintInfo = await getMint(connection, sourceMint, "confirmed", sourceTokenProgram);

    if (
      await runAirdropOnly(
        sourceTokenProgram,
        sourceMintInfo.decimals,
        sourceMintInfo.supply,
      )
    ) {
      return;
    }

    await runClaimSplitAndAirdrop(
      sourceTokenProgram,
      sourceMintInfo.decimals,
      sourceMintInfo.supply,
    );
  } catch (error) {
    epochRecord.status = "failed";
    epochRecord.completedAt = new Date().toISOString();
    epochRecord.error = error instanceof Error ? error.message : String(error);
    await writeEpochRecord();
    throw error;
  } finally {
    await lock.close();
    await unlink(lockPath).catch((error: any) => {
      if (error?.code !== "ENOENT") throw error;
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
