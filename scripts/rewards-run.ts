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
  rewardMint: string;
  beggarFundWallet?: string;
  claimLamports?: string;
  beggarFundLamports?: string;
  holderRewardLamports?: string;
  claimSignature?: string | null;
  beggarFundSignature?: string | null;
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
const claimSwapOnly = process.argv.includes("--claim-swap-only");
const swapOnlySol = numberArg("--swap-sol=");

const rpcUrl = requiredEnv("SOLANA_RPC_URL");
const sourceMintText = requiredEnv("SOURCE_TOKEN_MINT");
const rewardMintText = requiredEnv("REWARD_TOKEN_MINT");
const maxClaimSol = numberEnv("MAX_CREATOR_FEE_CLAIM_SOL", numberEnv("MAX_SWAP_SOL", 0.02));
const maxRecipients = integerEnv("MAX_AIRDROP_RECIPIENTS", 50);
const minHolderTokens = numberEnv("MIN_HOLDER_TOKEN_BALANCE", 100_000);
const slippageBps = integerEnv("SWAP_SLIPPAGE_BPS", 300);
const reserveSol = numberEnv("SOL_FEE_RESERVE", 0.02);
const beggarFundBps = integerEnv("BEGGAR_FUND_BPS", 5_000);
const maxHolderSupplyBps = integerEnv("MAX_HOLDER_SUPPLY_BPS", 0);
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
if (slippageBps < 1 || slippageBps > 5_000) {
  throw new Error("SWAP_SLIPPAGE_BPS must be an integer from 1 to 5000");
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

const connection = new Connection(rpcUrl, "confirmed");
const wallet = keypairFromEnv("FEE_WALLET_PRIVATE_KEY");
const sourceMint = new PublicKey(sourceMintText);
const rewardMint = new PublicKey(rewardMintText);
const beggarFundWallet = process.env.BEGGAR_FUND_WALLET?.trim()
  ? new PublicKey(process.env.BEGGAR_FUND_WALLET.trim())
  : null;
const sdk = new OnlinePumpSdk(connection);
const epochRecord: EpochRecord = {
  startedAt: new Date().toISOString(),
  status: "running",
  sourceMint: sourceMint.toBase58(),
  rewardMint: rewardMint.toBase58(),
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

function numberArg(prefix: string) {
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return null;
  const parsed = Number(arg.slice(prefix.length));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${prefix.slice(0, -1)} must be a positive number`);
  }
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

async function getJupiterSwap(amountLamports: number) {
  const query = new URLSearchParams({
    inputMint: NATIVE_MINT.toBase58(),
    outputMint: rewardMint.toBase58(),
    amount: String(amountLamports),
    slippageBps: String(slippageBps),
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

  console.log("Swap: simulation passed");
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 3,
    skipPreflight: false,
  });
  await connection.confirmTransaction(signature, "confirmed");
  console.log(`Swap: ${signature}`);
  return signature;
}

async function distribute(
  tokenProgram: PublicKey,
  decimals: number,
  recipients: HolderEntry[],
  totalReward: bigint,
) {
  if (!recipients.length) throw new Error("No eligible recipients in snapshot");

  const totalWeight = recipients.reduce((sum, [, amount]) => sum + amount, 0n);
  const sourceAta = getAssociatedTokenAddressSync(
    rewardMint,
    wallet.publicKey,
    false,
    tokenProgram,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  console.log(`Airdrop source account: ${sourceAta.toBase58()}`);

  const allocations = recipients
    .map(([owner, weight]) => [owner, (totalReward * weight) / totalWeight] as const)
    .filter(([, amount]) => amount > 0n);

  console.log("Projected weighted recipients:");
  for (const [owner, amount] of allocations) {
    console.log(`  ${owner}: ${formatRawAmount(amount, decimals)}`);
  }

  if (!execute) {
    console.log("Airdrop batches: projected only. No transactions were broadcast.");
    return;
  }

  for (let index = 0; index < allocations.length; index += 4) {
    const tx = new Transaction();
    const batchNumber = index / 4 + 1;

    for (const [ownerText, amount] of allocations.slice(index, index + 4)) {
      const owner = new PublicKey(ownerText);
      const destinationAta = getAssociatedTokenAddressSync(
        rewardMint,
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
          rewardMint,
          tokenProgram,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        createTransferCheckedInstruction(
          sourceAta,
          rewardMint,
          destinationAta,
          wallet.publicKey,
          amount,
          decimals,
          [],
          tokenProgram,
        ),
      );
    }

    console.log(`Airdrop batch ${batchNumber}: ${tx.instructions.length} instructions`);
    const signature = await sendLegacy(tx, `Airdrop batch ${batchNumber}`);
    if (signature) epochRecord.airdropSignatures.push(signature);
  }
}

async function sendBeggarFundTransfer(amountLamports: bigint) {
  if (amountLamports <= 0n) return null;
  if (!beggarFundWallet) {
    throw new Error("BEGGAR_FUND_WALLET is required when BEGGAR_FUND_BPS is greater than zero");
  }
  if (amountLamports > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Beggar fund transfer is too large for a single SystemProgram transfer");
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: beggarFundWallet,
      lamports: Number(amountLamports),
    }),
  );

  return sendLegacy(tx, "Beggar fund transfer", { simulateInPreview: false });
}

async function runSwapOnly(rewardDecimals: number) {
  if (swapOnlySol === null) return false;
  if (!execute) throw new Error("--swap-sol requires --execute");

  const walletSol = await connection.getBalance(wallet.publicKey, "confirmed");
  const swapLamports = Math.round(swapOnlySol * LAMPORTS_PER_SOL);
  const reserveLamports = Math.round(reserveSol * LAMPORTS_PER_SOL);

  if (walletSol < swapLamports + reserveLamports) {
    throw new Error("Insufficient SOL for requested swap plus configured reserve");
  }

  const { quote, swap } = await getJupiterSwap(swapLamports);
  console.log(
    `Swap quote: ${formatLamports(swapLamports)} -> ${formatRawAmount(
      BigInt(quote.outAmount),
      rewardDecimals,
    )} tokens`,
  );

  epochRecord.swapSignature = await sendSwap(swap.swapTransaction);
  await completeEpoch();
  return true;
}

async function runAirdropOnly(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
  rewardTokenProgram: PublicKey,
  rewardDecimals: number,
  walletTokenAta: PublicKey,
  tokenBalanceBefore: bigint,
) {
  if (!airdropOnly) return false;
  if (!execute) throw new Error("--airdrop-only requires --execute");
  if (tokenBalanceBefore <= 0n) {
    throw new Error("No reward token balance is available to resume the airdrop");
  }

  const snapshot = await getSnapshot(sourceTokenProgram, sourceDecimals, sourceSupply);
  console.log(`Resuming airdrop with ${formatRawAmount(tokenBalanceBefore, rewardDecimals)} tokens`);
  console.log(`Eligible snapshot recipients: ${snapshot.length}`);
  console.log(`Wallet reward ATA: ${walletTokenAta.toBase58()}`);

  await distribute(rewardTokenProgram, rewardDecimals, snapshot, tokenBalanceBefore);
  await completeEpoch();
  return true;
}

async function runClaimSplitSwapAndAirdrop(
  sourceTokenProgram: PublicKey,
  sourceDecimals: number,
  sourceSupply: bigint,
  rewardTokenProgram: PublicKey,
  rewardDecimals: number,
  walletTokenAta: PublicKey,
  tokenBalanceBefore: bigint,
) {
  if (beggarFundBps > 0 && !beggarFundWallet) {
    throw new Error("BEGGAR_FUND_WALLET is required when BEGGAR_FUND_BPS is greater than zero");
  }

  const walletSol = await connection.getBalance(wallet.publicKey, "confirmed");
  const claimable = BigInt(
    (await sdk.getCreatorVaultBalanceBothPrograms(wallet.publicKey)).toString(),
  );
  const maxClaimLamports = BigInt(Math.round(maxClaimSol * LAMPORTS_PER_SOL));

  console.log(`Mode: ${execute ? "EXECUTE" : "PREVIEW ONLY"}`);
  console.log(`Fee wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`Beggar fund wallet: ${beggarFundWallet?.toBase58() || "not configured"}`);
  console.log(`Source holder mint: ${sourceMint.toBase58()}`);
  console.log(`Reward mint: ${rewardMint.toBase58()}`);
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
  if (claimable > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Claimable fee amount is too large for the current transaction builder");
  }

  const beggarFundLamports = (claimable * BigInt(beggarFundBps)) / 10_000n;
  const holderRewardLamports = claimable - beggarFundLamports;
  const reserveLamports = BigInt(Math.round(reserveSol * LAMPORTS_PER_SOL));
  const projectedAfterClaim = BigInt(walletSol) + claimable;

  epochRecord.claimLamports = claimable.toString();
  epochRecord.beggarFundLamports = beggarFundLamports.toString();
  epochRecord.holderRewardLamports = holderRewardLamports.toString();

  console.log(
    `Split: ${formatBps(beggarFundBps)} to Beg Pool (${formatLamports(
      beggarFundLamports,
    )}), ${formatBps(10_000 - beggarFundBps)} to holder rewards (${formatLamports(
      holderRewardLamports,
    )})`,
  );

  if (projectedAfterClaim < claimable + reserveLamports) {
    throw new Error("Insufficient SOL after projected claim for split, swap, and reserve");
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
    console.log("Holder reward split is zero for this epoch; skipping swap and airdrop.");
    await completeEpoch();
    return;
  }

  const { quote, swap } = await getJupiterSwap(Number(holderRewardLamports));
  console.log(
    `Swap quote: ${formatLamports(holderRewardLamports)} -> ${formatRawAmount(
      BigInt(quote.outAmount),
      rewardDecimals,
    )} tokens`,
  );

  if (execute) {
    epochRecord.swapSignature = await sendSwap(swap.swapTransaction);
  } else {
    console.log("Swap: quote built. Transaction was not simulated because preview does not broadcast the claim first.");
  }

  if (claimSwapOnly) {
    await completeEpoch();
    return;
  }

  if (execute) {
    await new Promise((resolve) => setTimeout(resolve, 2_500));
  }

  const snapshot = await getSnapshot(sourceTokenProgram, sourceDecimals, sourceSupply);
  console.log(`Eligible snapshot recipients: ${snapshot.length}`);

  const rewardAmount = execute
    ? BigInt((await connection.getTokenAccountBalance(walletTokenAta, "confirmed")).value.amount) -
      tokenBalanceBefore
    : BigInt(quote.outAmount);

  if (rewardAmount <= 0n) {
    throw new Error("Swap did not increase the wallet reward token balance");
  }

  await distribute(rewardTokenProgram, rewardDecimals, snapshot, rewardAmount);

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
    const rewardTokenProgram = await getTokenProgram(rewardMint);
    const sourceMintInfo = await getMint(connection, sourceMint, "confirmed", sourceTokenProgram);
    const rewardMintInfo = await getMint(connection, rewardMint, "confirmed", rewardTokenProgram);
    const walletTokenAta = getAssociatedTokenAddressSync(
      rewardMint,
      wallet.publicKey,
      false,
      rewardTokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    const tokenAccountBefore = await connection.getAccountInfo(walletTokenAta);
    const tokenBalanceBefore = tokenAccountBefore
      ? BigInt((await connection.getTokenAccountBalance(walletTokenAta, "confirmed")).value.amount)
      : 0n;

    if (await runSwapOnly(rewardMintInfo.decimals)) return;
    if (
      await runAirdropOnly(
        sourceTokenProgram,
        sourceMintInfo.decimals,
        sourceMintInfo.supply,
        rewardTokenProgram,
        rewardMintInfo.decimals,
        walletTokenAta,
        tokenBalanceBefore,
      )
    ) {
      return;
    }

    await runClaimSplitSwapAndAirdrop(
      sourceTokenProgram,
      sourceMintInfo.decimals,
      sourceMintInfo.supply,
      rewardTokenProgram,
      rewardMintInfo.decimals,
      walletTokenAta,
      tokenBalanceBefore,
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
