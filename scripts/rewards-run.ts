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
  VersionedTransaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
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
import {
  completeEpoch as completeDbEpoch,
  dryRunPayouts,
  failEpoch as failDbEpoch,
  failPayouts,
  persistSnapshot,
  planPayouts,
  recordAnsemSwap,
  recordClaim,
  recordRewardWalletTransfer,
  settlePayouts,
  startEpoch as startDbEpoch,
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

type HolderEntry = readonly [owner: string, amount: bigint];

type EpochRecord = {
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  sourceMint: string;
  ansemMint: string;
  payoutAsset: "$ANSEM";
  rewardWallet?: string;
  claimLamports?: string;
  rewardWalletLamports?: string;
  ansemSwapLamports?: string;
  ansemBoughtRaw?: string;
  ansemBought?: string;
  ansemDistributedRaw?: string;
  ansemDistributed?: string;
  eligibleCount?: number;
  claimSignature?: string | null;
  rewardWalletSignature?: string | null;
  swapSignature?: string | null;
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
const ansemMintText = process.env.ANSEM_TOKEN_MINT?.trim() || process.env.REWARD_TOKEN_MINT?.trim();
if (!ansemMintText) throw new Error("ANSEM_TOKEN_MINT is required");

const rewardWalletText = process.env.POW_REWARD_WALLET?.trim();
const maxClaimSol = numberEnv("MAX_CREATOR_FEE_CLAIM_SOL", numberEnv("MAX_SWAP_SOL", 0.02));
const maxRecipients = integerEnv("MAX_AIRDROP_RECIPIENTS", 50);
const maxTransfersPerTx = integerEnv("MAX_AIRDROP_TRANSFERS_PER_TX", 4);
const minHolderTokens = numberEnv("MIN_HOLDER_TOKEN_BALANCE", 100_000);
const reserveSol = numberEnv("SOL_FEE_RESERVE", 0.02);
const slippageBps = integerEnv("SWAP_SLIPPAGE_BPS", 300);
const ansemAirdropBps = integerEnv("ANSEM_AIRDROP_BPS", 5_000);
const maxHolderSupplyBps = integerEnv("MAX_HOLDER_SUPPLY_BPS", 0);
const stateDirectory = path.resolve(process.env.REWARDS_STATE_DIR?.trim() || "work/rewards-state");
const lockPath = path.join(stateDirectory, "epoch.lock");

if (!Number.isFinite(maxClaimSol) || maxClaimSol <= 0) {
  throw new Error(`MAX_CREATOR_FEE_CLAIM_SOL must be a positive number, got ${maxClaimSol}`);
}
if (maxRecipients < 1 || maxRecipients > 50) {
  throw new Error("MAX_AIRDROP_RECIPIENTS must be an integer from 1 to 50");
}
if (maxTransfersPerTx < 1 || maxTransfersPerTx > 8) {
  throw new Error("MAX_AIRDROP_TRANSFERS_PER_TX must be an integer from 1 to 8");
}
if (!Number.isFinite(minHolderTokens) || minHolderTokens < 0) {
  throw new Error("MIN_HOLDER_TOKEN_BALANCE must be a non-negative number");
}
if (!Number.isFinite(reserveSol) || reserveSol < 0) {
  throw new Error("SOL_FEE_RESERVE must be a non-negative number");
}
if (slippageBps < 1 || slippageBps > 5_000) {
  throw new Error("SWAP_SLIPPAGE_BPS must be an integer from 1 to 5000");
}
if (ansemAirdropBps < 0 || ansemAirdropBps > 10_000) {
  throw new Error("ANSEM_AIRDROP_BPS must be an integer from 0 to 10000");
}
if (maxHolderSupplyBps < 0 || maxHolderSupplyBps > 10_000) {
  throw new Error("MAX_HOLDER_SUPPLY_BPS must be an integer from 0 to 10000");
}

const connection = new Connection(rpcUrl, "confirmed");
const wallet = keypairFromEnv("FEE_WALLET_PRIVATE_KEY");
const sourceMint = new PublicKey(sourceMintText);
const ansemMint = new PublicKey(ansemMintText);
const rewardWallet = rewardWalletText ? new PublicKey(rewardWalletText) : null;
const sdk = new OnlinePumpSdk(connection);
const epochRecord: EpochRecord = {
  startedAt: new Date().toISOString(),
  status: "running",
  sourceMint: sourceMint.toBase58(),
  ansemMint: ansemMint.toBase58(),
  payoutAsset: "$ANSEM",
  rewardWallet: rewardWallet?.toBase58(),
  airdropSignatures: [],
};
const epochId = epochRecord.startedAt;

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

function holderPct(rawBalance: bigint, rawSupply: bigint) {
  if (rawSupply <= 0n) return "0";
  return (Number((rawBalance * 1_000_000n) / rawSupply) / 10_000).toString();
}

function snapshotRows(recipients: HolderEntry[], sourceDecimals: number, sourceSupply: bigint) {
  return recipients.map(([wallet, amount]) => ({
    wallet,
    sourceBalanceRaw: amount.toString(),
    sourceBalance: formatRawAmount(amount, sourceDecimals),
    holderPct: holderPct(amount, sourceSupply),
  }));
}

function payoutRows(allocations: readonly (readonly [string, bigint])[], decimals: number) {
  return allocations.map(([wallet, amount]) => ({
    wallet,
    rewardAmountRaw: amount.toString(),
    rewardAmount: formatRawAmount(amount, decimals),
  }));
}

function excludedHolderWallets() {
  const excluded = new Set<string>([wallet.publicKey.toBase58()]);

  if (rewardWallet) excluded.add(rewardWallet.toBase58());

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
  await completeDbEpoch(epochId, {
    eligibleCount: epochRecord.eligibleCount ?? 0,
    claimLamports: epochRecord.claimLamports ?? "0",
    rewardWalletLamports: epochRecord.rewardWalletLamports ?? "0",
    ansemSwapLamports: epochRecord.ansemSwapLamports ?? "0",
    ansemBoughtRaw: epochRecord.ansemBoughtRaw ?? "0",
    ansemBought: epochRecord.ansemBought ?? "0",
    ansemDistributedRaw: epochRecord.ansemDistributedRaw ?? "0",
    ansemDistributed: epochRecord.ansemDistributed ?? "0",
  });
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

async function getJupiterSwap(amountLamports: bigint) {
  if (amountLamports > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Swap amount is too large for the current Jupiter request builder");
  }

  const query = new URLSearchParams({
    inputMint: NATIVE_MINT.toBase58(),
    outputMint: ansemMint.toBase58(),
    amount: amountLamports.toString(),
    slippageBps: slippageBps.toString(),
    restrictIntermediateTokens: "true",
  });

  const quoteResponse = await fetch(`https://lite-api.jup.ag/swap/v1/quote?${query}`);
  if (!quoteResponse.ok) {
    throw new Error(`Jupiter quote failed: ${await quoteResponse.text()}`);
  }

  const quote = (await quoteResponse.json()) as { outAmount: string };
  const swapResponse = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      dynamicSlippage: false,
    }),
  });

  if (!swapResponse.ok) {
    throw new Error(`Jupiter swap build failed: ${await swapResponse.text()}`);
  }

  return {
    quote,
    swap: (await swapResponse.json()) as { swapTransaction: string },
  };
}

async function sendSwap(base64: string) {
  const tx = VersionedTransaction.deserialize(Buffer.from(base64, "base64"));
  tx.sign([wallet]);

  const simulation = await connection.simulateTransaction(tx, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });

  if (simulation.value.err) {
    console.error(simulation.value.logs?.join("\n"));
    throw new Error(`Swap simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  console.log("ANSEM swap: simulation passed");
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 3,
    skipPreflight: false,
  });
  await connection.confirmTransaction(signature, "confirmed");
  console.log(`ANSEM swap: ${signature}`);
  return signature;
}

async function distributeAnsem(
  tokenProgram: PublicKey,
  decimals: number,
  recipients: HolderEntry[],
  totalReward: bigint,
) {
  if (!recipients.length) throw new Error("No eligible recipients in snapshot");
  if (totalReward <= 0n) throw new Error("$ANSEM airdrop amount must be positive");

  const totalWeight = recipients.reduce((sum, [, amount]) => sum + amount, 0n);
  const sourceAta = getAssociatedTokenAddressSync(
    ansemMint,
    wallet.publicKey,
    false,
    tokenProgram,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const allocations = recipients
    .map(([owner, weight]) => [owner, (totalReward * weight) / totalWeight] as const)
    .filter(([, amount]) => amount > 0n);
  const allocatedRaw = allocations.reduce((sum, [, amount]) => sum + amount, 0n);
  const dustRaw = totalReward - allocatedRaw;

  console.log(`ANSEM source account: ${sourceAta.toBase58()}`);
  console.log(`Projected $ANSEM holder rewards: ${formatRawAmount(allocatedRaw, decimals)}`);
  if (dustRaw > 0n) {
    console.log(`Rounding dust retained in fee wallet: ${formatRawAmount(dustRaw, decimals)} $ANSEM`);
  }
  for (const [owner, amount] of allocations) {
    console.log(`  ${owner}: ${formatRawAmount(amount, decimals)} $ANSEM`);
  }

  const dbPayoutRows = payoutRows(allocations, decimals);

  if (!execute) {
    await dryRunPayouts(epochId, dbPayoutRows);
    console.log("$ANSEM airdrop batches: projected only. No transactions were broadcast.");
    return;
  }

  for (let index = 0; index < allocations.length; index += maxTransfersPerTx) {
    const tx = new Transaction();
    const batchNumber = index / maxTransfersPerTx + 1;
    const batchAllocations = allocations.slice(index, index + maxTransfersPerTx);
    const batchPayoutRows = payoutRows(batchAllocations, decimals);

    await planPayouts(epochId, batchPayoutRows);

    for (const [ownerText, amount] of batchAllocations) {
      const owner = new PublicKey(ownerText);
      const destinationAta = getAssociatedTokenAddressSync(
        ansemMint,
        owner,
        true,
        tokenProgram,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          destinationAta,
          owner,
          ansemMint,
          tokenProgram,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        createTransferCheckedInstruction(
          sourceAta,
          ansemMint,
          destinationAta,
          wallet.publicKey,
          amount,
          decimals,
          [],
          tokenProgram,
        ),
      );
    }

    console.log(`$ANSEM airdrop batch ${batchNumber}: ${tx.instructions.length} instructions`);
    try {
      const signature = await sendLegacy(tx, `$ANSEM airdrop batch ${batchNumber}`);
      if (signature) {
        epochRecord.airdropSignatures.push(signature);
        await settlePayouts(epochId, batchPayoutRows, signature);
      }
    } catch (error) {
      await failPayouts(epochId, batchPayoutRows, error);
      throw error;
    }
  }
}

async function sendRewardWalletTransfer(amountLamports: bigint) {
  if (amountLamports <= 0n) return null;
  if (!rewardWallet) {
    throw new Error("POW_REWARD_WALLET is required for the reward-wallet split");
  }

  const tx = new Transaction().add(buildSolTransfer(rewardWallet, amountLamports));
  const signature = await sendLegacy(tx, "POW bounty wallet transfer", { simulateInPreview: false });
  await recordRewardWalletTransfer(
    epochId,
    rewardWallet.toBase58(),
    amountLamports.toString(),
    signature,
  );
  return signature;
}

async function runAirdropOnly(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
  ansemTokenProgram: PublicKey,
  ansemDecimals: number,
  ansemTokenBalance: bigint,
) {
  if (!airdropOnly) return false;
  if (!execute) throw new Error("--airdrop-only requires --execute");
  if (ansemTokenBalance <= 0n) {
    throw new Error("No $ANSEM balance is available to resume the airdrop");
  }

  const snapshot = await getSnapshot(sourceTokenProgram, sourceDecimals, sourceSupply);
  epochRecord.eligibleCount = snapshot.length;
  epochRecord.ansemDistributedRaw = ansemTokenBalance.toString();
  epochRecord.ansemDistributed = formatRawAmount(ansemTokenBalance, ansemDecimals);
  console.log(`Resuming $ANSEM airdrop with ${formatRawAmount(ansemTokenBalance, ansemDecimals)} tokens`);
  console.log(`Eligible snapshot recipients: ${snapshot.length}`);
  await persistSnapshot(epochId, snapshotRows(snapshot, sourceDecimals, sourceSupply));

  await distributeAnsem(ansemTokenProgram, ansemDecimals, snapshot, ansemTokenBalance);
  await completeEpoch();
  return true;
}

async function runClaimSplitSwapAndAirdrop(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
  ansemTokenProgram: PublicKey,
  ansemDecimals: number,
  ansemWalletAta: PublicKey,
  ansemTokenBalanceBefore: bigint,
) {
  const rewardWalletBps = 10_000 - ansemAirdropBps;
  if (rewardWalletBps > 0 && !rewardWallet) {
    throw new Error("POW_REWARD_WALLET is required for the reward-wallet split");
  }

  const walletSol = BigInt(await connection.getBalance(wallet.publicKey, "confirmed"));
  const claimable = BigInt(
    (await sdk.getCreatorVaultBalanceBothPrograms(wallet.publicKey)).toString(),
  );
  const maxClaimLamports = solToLamports(maxClaimSol);

  console.log(`Mode: ${execute ? "EXECUTE" : "PREVIEW ONLY"}`);
  console.log(`Fee wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`POW bounty wallet: ${rewardWallet?.toBase58() || "not configured"}`);
  console.log(`Holder snapshot mint: ${sourceMint.toBase58()}`);
  console.log(`ANSEM mint: ${ansemMint.toBase58()}`);
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

  const ansemSwapLamports = (claimable * BigInt(ansemAirdropBps)) / 10_000n;
  const rewardWalletLamports = claimable - ansemSwapLamports;
  const reserveLamports = solToLamports(reserveSol);
  const projectedAfterClaim = walletSol + claimable;

  epochRecord.claimLamports = claimable.toString();
  epochRecord.rewardWalletLamports = rewardWalletLamports.toString();
  epochRecord.ansemSwapLamports = ansemSwapLamports.toString();

  console.log(
    `Split: ${formatBps(ansemAirdropBps)} to $ANSEM holder rewards (${formatLamports(
      ansemSwapLamports,
    )}), ${formatBps(rewardWalletBps)} to bounty wallet (${formatLamports(
      rewardWalletLamports,
    )})`,
  );

  if (projectedAfterClaim < claimable + reserveLamports) {
    throw new Error("Insufficient SOL after projected claim for split, ANSEM swap, and reserve");
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
  epochRecord.rewardWalletSignature = await sendRewardWalletTransfer(rewardWalletLamports);

  if (ansemSwapLamports <= 0n) {
    console.log("$ANSEM holder reward split is zero for this epoch; skipping swap and airdrop.");
    await completeEpoch();
    return;
  }

  const { quote, swap } = await getJupiterSwap(ansemSwapLamports);
  console.log(
    `Swap quote: ${formatLamports(ansemSwapLamports)} -> ${formatRawAmount(
      BigInt(quote.outAmount),
      ansemDecimals,
    )} $ANSEM`,
  );

  if (execute) {
    epochRecord.swapSignature = await sendSwap(swap.swapTransaction);
  } else {
    console.log("ANSEM swap: quote built. Transaction was not simulated because preview does not broadcast the claim first.");
  }

  if (claimSplitOnly) {
    await recordAnsemSwap(
      epochId,
      ansemSwapLamports.toString(),
      quote.outAmount,
      formatRawAmount(BigInt(quote.outAmount), ansemDecimals),
      epochRecord.swapSignature ?? null,
    );
    epochRecord.ansemBoughtRaw = quote.outAmount;
    epochRecord.ansemBought = formatRawAmount(BigInt(quote.outAmount), ansemDecimals);
    console.log("Claim/split only mode enabled; skipping $ANSEM holder airdrop.");
    await completeEpoch();
    return;
  }

  if (execute) {
    await new Promise((resolve) => setTimeout(resolve, 2_500));
  }

  const snapshot = await getSnapshot(sourceTokenProgram, sourceDecimals, sourceSupply);
  epochRecord.eligibleCount = snapshot.length;
  console.log(`Eligible snapshot recipients: ${snapshot.length}`);
  await persistSnapshot(epochId, snapshotRows(snapshot, sourceDecimals, sourceSupply));

  const ansemRewardAmount = execute
    ? BigInt((await connection.getTokenAccountBalance(ansemWalletAta, "confirmed")).value.amount) -
      ansemTokenBalanceBefore
    : BigInt(quote.outAmount);

  if (ansemRewardAmount <= 0n) {
    throw new Error("ANSEM swap did not increase the wallet token balance");
  }

  epochRecord.ansemBoughtRaw = ansemRewardAmount.toString();
  epochRecord.ansemBought = formatRawAmount(ansemRewardAmount, ansemDecimals);
  epochRecord.ansemDistributedRaw = ansemRewardAmount.toString();
  epochRecord.ansemDistributed = formatRawAmount(ansemRewardAmount, ansemDecimals);
  await recordAnsemSwap(
    epochId,
    ansemSwapLamports.toString(),
    ansemRewardAmount.toString(),
    formatRawAmount(ansemRewardAmount, ansemDecimals),
    epochRecord.swapSignature ?? null,
  );

  await distributeAnsem(ansemTokenProgram, ansemDecimals, snapshot, ansemRewardAmount);

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
    await startDbEpoch({
      epochId,
      mode: execute ? "execute" : "preview",
      sourceMint: sourceMint.toBase58(),
      ansemMint: ansemMint.toBase58(),
      rewardWallet: rewardWallet?.toBase58(),
    });

    const sourceTokenProgram = await getTokenProgram(sourceMint);
    const ansemTokenProgram = await getTokenProgram(ansemMint);
    const sourceMintInfo = await getMint(connection, sourceMint, "confirmed", sourceTokenProgram);
    const ansemMintInfo = await getMint(connection, ansemMint, "confirmed", ansemTokenProgram);
    const ansemWalletAta = getAssociatedTokenAddressSync(
      ansemMint,
      wallet.publicKey,
      false,
      ansemTokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    const ansemTokenAccountBefore = await connection.getAccountInfo(ansemWalletAta);
    const ansemTokenBalanceBefore = ansemTokenAccountBefore
      ? BigInt((await connection.getTokenAccountBalance(ansemWalletAta, "confirmed")).value.amount)
      : 0n;

    if (
      await runAirdropOnly(
        sourceTokenProgram,
        sourceMintInfo.decimals,
        sourceMintInfo.supply,
        ansemTokenProgram,
        ansemMintInfo.decimals,
        ansemTokenBalanceBefore,
      )
    ) {
      return;
    }

    await runClaimSplitSwapAndAirdrop(
      sourceTokenProgram,
      sourceMintInfo.decimals,
      sourceMintInfo.supply,
      ansemTokenProgram,
      ansemMintInfo.decimals,
      ansemWalletAta,
      ansemTokenBalanceBefore,
    );
  } catch (error) {
    epochRecord.status = "failed";
    epochRecord.completedAt = new Date().toISOString();
    epochRecord.error = error instanceof Error ? error.message : String(error);
    await writeEpochRecord();
    await failDbEpoch(epochId, error);
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
