import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Connection, PublicKey } from "@solana/web3.js";
import { powMinimumHolding } from "../lib/pow-config";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1]?.trim() : undefined;
}

function normalizeHandle(value: string) {
  const handle = value.trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9_]{1,15}$/.test(handle)) throw new Error("--handle must be a valid X handle");
  return handle;
}

async function resolveXUser(handle: string) {
  const suppliedId = argument("--x-user-id");
  if (suppliedId) return { id: suppliedId, username: handle };

  const response = await fetch(`https://api.x.com/2/users/by/username/${encodeURIComponent(handle)}`, {
    headers: { authorization: `Bearer ${requiredEnv("X_BEARER_TOKEN")}` }
  });
  if (!response.ok) throw new Error(`X user lookup failed (${response.status}): ${await response.text()}`);
  const payload = (await response.json()) as { data?: { id?: string; username?: string } };
  if (!payload.data?.id || !payload.data.username) throw new Error(`X account @${handle} was not found`);
  return { id: payload.data.id, username: payload.data.username.toLowerCase() };
}

async function main() {
  const handle = normalizeHandle(argument("--handle") || "");
  const wallet = new PublicKey(argument("--wallet") || "").toBase58();
  const score = Number(argument("--score"));
  if (!Number.isFinite(score) || score <= 0) throw new Error("--score must be a positive number");

  const minimum = Number(process.env.WORKER_MIN_BALANCE?.trim() || powMinimumHolding);
  if (!Number.isFinite(minimum) || minimum <= 0) throw new Error("WORKER_MIN_BALANCE must be positive");

  const mint = new PublicKey(process.env.POW_TOKEN_MINT?.trim() || requiredEnv("SOURCE_TOKEN_MINT"));
  const connection = new Connection(requiredEnv("SOLANA_RPC_URL"), "confirmed");
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), { mint }, "confirmed");
  const supply = await connection.getTokenSupply(mint, "confirmed");
  const raw = tokenAccounts.value.reduce(
    (sum, account) => sum + BigInt(account.account.data.parsed.info.tokenAmount.amount as string),
    0n
  );
  const minimumRaw = BigInt(Math.trunc(minimum)) * 10n ** BigInt(supply.value.decimals);
  const tokens = Number(raw) / 10 ** supply.value.decimals;
  if (raw < minimumRaw) {
    throw new Error(`${wallet} holds ${tokens.toLocaleString()} $POW; ${minimum.toLocaleString()} is required`);
  }

  const xUser = await resolveXUser(handle);
  const db = createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });
  const existing = await db
    .from("pow_verified_workers")
    .select("x_user_id,x_handle")
    .eq("wallet", wallet)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data && existing.data.x_user_id !== xUser.id) {
    throw new Error(`Wallet is already linked to @${existing.data.x_handle}`);
  }

  const now = new Date().toISOString();
  const worker = await db.from("pow_verified_workers").upsert(
    {
      x_user_id: xUser.id,
      x_handle: xUser.username,
      wallet,
      handle: `@${xUser.username}`,
      proof_url: argument("--proof-url") || `https://x.com/${xUser.username}`,
      application_text: "Manually approved POW submission",
      category: "verified worker",
      status: "verified",
      exclusion_reason: null,
      excluded_at: null,
      holding_raw: raw.toString(),
      holding_tokens: tokens,
      score,
      accepted_at: now,
      last_scored_at: now,
      updated_at: now
    },
    { onConflict: "x_user_id" }
  );
  if (worker.error) throw worker.error;

  const [campaignResult, workersResult] = await Promise.all([
    db.from("pow_campaigns").select("id").eq("slug", "pow").maybeSingle(),
    db
      .from("pow_verified_workers")
      .select("x_user_id,x_handle,status,holding_tokens,score,post_count,impression_count")
      .in("status", ["verified", "pending", "paid"])
      .order("score", { ascending: false })
  ]);
  if (campaignResult.error) throw campaignResult.error;
  if (workersResult.error) throw workersResult.error;
  if (!campaignResult.data?.id) throw new Error("Native POW campaign is missing; run supabase/setup_all.sql");

  const campaignId = campaignResult.data.id as string;
  const rows = (workersResult.data ?? []).map((entry, index) => ({
    campaign_id: campaignId,
    campaign_slug: "pow",
    x_user_id: entry.x_user_id,
    x_handle: entry.x_handle,
    rank: index + 1,
    score: Number(entry.score ?? 0),
    meets_minimum: Number(entry.holding_tokens ?? 0) >= minimum,
    worker_status: entry.status ?? "pending",
    post_count: entry.post_count ?? 0,
    impression_count: entry.impression_count ?? 0,
    updated_at: now
  }));
  const cleared = await db.from("pow_public_leaderboard").delete().eq("campaign_id", campaignId);
  if (cleared.error) throw cleared.error;
  if (rows.length) {
    const published = await db.from("pow_public_leaderboard").insert(rows);
    if (published.error) throw published.error;
  }

  console.log(`Added @${xUser.username}: ${tokens.toLocaleString()} $POW, ${score.toLocaleString()} points`);
  console.log(`Public leaderboard refreshed with ${rows.length} workers; wallet remains private.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
