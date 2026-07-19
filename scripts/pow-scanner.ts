import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Connection, PublicKey } from "@solana/web3.js";

type XMetrics = {
  like_count?: number;
  retweet_count?: number;
  reply_count?: number;
  quote_count?: number;
  bookmark_count?: number;
  impression_count?: number;
};

type XTweet = {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
  public_metrics?: XMetrics;
};

type XUser = {
  id: string;
  username: string;
  name?: string;
};

type XSearchResponse = {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
  };
  meta?: {
    newest_id?: string;
  };
};

type VerifiedWorker = {
  x_user_id: string;
  x_handle: string;
  wallet: string;
  accepted_at: string | null;
  created_at: string | null;
};

const walletPattern = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const xBaseUrl = "https://api.x.com/2/tweets/search/recent";
const runningOnce = process.argv.includes("--once");

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

const db = createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});
const connection = new Connection(requiredEnv("SOLANA_RPC_URL"), "confirmed");
const xBearerToken = requiredEnv("X_BEARER_TOKEN");
const powMint = new PublicKey(requiredEnv("SOURCE_TOKEN_MINT"));
const minWorkerPow = numberEnv("MIN_WORKER_POW_BALANCE", 1_000_000);
const applicationQuery = process.env.POW_APPLICATION_QUERY?.trim() || "$POW #POW application -is:retweet";
const postQuery = process.env.POW_POST_QUERY?.trim() || "$POW -is:retweet";
const intervalMs = integerEnv("POW_SCANNER_INTERVAL_MS", 5 * 60 * 1000);
const volumeApiUrl = process.env.POW_VOLUME_API_URL?.trim();
const volumeApiKey = process.env.POW_VOLUME_API_KEY?.trim();

let running = false;
let cachedDecimals: number | null = null;

function userMap(response: XSearchResponse) {
  return new Map((response.includes?.users ?? []).map((user) => [user.id, user]));
}

function postUrl(handle: string, tweetId: string) {
  return `https://x.com/${handle}/status/${tweetId}`;
}

function validPublicKey(value: string) {
  try {
    return new PublicKey(value).toBase58();
  } catch {
    return null;
  }
}

function extractWallet(text: string) {
  for (const match of text.matchAll(walletPattern)) {
    const wallet = validPublicKey(match[0]);
    if (wallet) return wallet;
  }
  return null;
}

async function tokenDecimals() {
  if (cachedDecimals !== null) return cachedDecimals;
  const supply = await connection.getTokenSupply(powMint, "confirmed");
  cachedDecimals = supply.value.decimals;
  return cachedDecimals;
}

async function powBalance(wallet: string) {
  const owner = new PublicKey(wallet);
  const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint: powMint }, "confirmed");
  const decimals = await tokenDecimals();
  let raw = 0n;

  for (const account of accounts.value) {
    const amount = account.account.data.parsed.info.tokenAmount.amount as string;
    raw += BigInt(amount);
  }

  return {
    raw: raw.toString(),
    tokens: Number(raw) / 10 ** decimals,
  };
}

async function getState(key: string) {
  const result = await db.from("pow_scanner_state").select("value").eq("key", key).maybeSingle();
  if (result.error) throw result.error;
  return result.data?.value as string | undefined;
}

async function setState(key: string, value: string) {
  const result = await db.from("pow_scanner_state").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (result.error) throw result.error;
}

async function searchX(query: string, sinceId?: string) {
  const params = new URLSearchParams({
    query,
    max_results: "50",
    sort_order: "recency",
    "tweet.fields": "author_id,created_at,public_metrics",
    expansions: "author_id",
    "user.fields": "username,name",
  });

  if (sinceId) params.set("since_id", sinceId);

  const response = await fetch(`${xBaseUrl}?${params}`, {
    headers: {
      authorization: `Bearer ${xBearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`X search failed ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as XSearchResponse;
}

function engagementScore(metrics: XMetrics | undefined) {
  const likes = metrics?.like_count ?? 0;
  const reposts = metrics?.retweet_count ?? 0;
  const replies = metrics?.reply_count ?? 0;
  const quotes = metrics?.quote_count ?? 0;
  const bookmarks = metrics?.bookmark_count ?? 0;
  const views = metrics?.impression_count ?? 0;

  return likes * 2 + reposts * 6 + replies * 4 + quotes * 5 + bookmarks * 3 + views * 0.02;
}

async function walletVolumeUsd(wallet: string) {
  if (!volumeApiUrl) return 0;

  const url = new URL(volumeApiUrl);
  url.searchParams.set("wallet", wallet);
  url.searchParams.set("mint", powMint.toBase58());

  const response = await fetch(url, {
    headers: volumeApiKey ? { authorization: `Bearer ${volumeApiKey}` } : undefined,
  });

  if (!response.ok) {
    console.warn(`Volume API failed for ${wallet}: ${response.status}`);
    return 0;
  }

  const data = (await response.json()) as { volumeUsd?: unknown; volume_usd?: unknown };
  const parsed = Number(data.volumeUsd ?? data.volume_usd ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function scanApplications() {
  const sinceId = await getState("applications_since_id");
  const response = await searchX(applicationQuery, sinceId);
  const users = userMap(response);
  const tweets = response.data ?? [];

  for (const tweet of tweets) {
    const user = users.get(tweet.author_id);
    if (!user) continue;

    const wallet = extractWallet(tweet.text);
    const url = postUrl(user.username, tweet.id);
    let status: "accepted" | "rejected" = "rejected";
    let rejectionReason = "missing wallet";
    let holdingRaw = "0";
    let holdingTokens = 0;

    if (wallet) {
      const balance = await powBalance(wallet);
      holdingRaw = balance.raw;
      holdingTokens = balance.tokens;
      if (holdingTokens >= minWorkerPow) {
        status = "accepted";
        rejectionReason = "";
      } else {
        rejectionReason = `below ${minWorkerPow.toLocaleString()} POW minimum`;
      }
    }

    const applicationResult = await db.from("pow_worker_applications").upsert({
      tweet_id: tweet.id,
      x_user_id: tweet.author_id,
      x_handle: user.username,
      wallet,
      text: tweet.text,
      url,
      holding_raw: holdingRaw,
      holding_tokens: holdingTokens,
      status,
      rejection_reason: rejectionReason || null,
      tweet_created_at: tweet.created_at,
      scanned_at: new Date().toISOString(),
    });
    if (applicationResult.error) throw applicationResult.error;

    if (status === "accepted" && wallet) {
      const workerResult = await db.from("pow_verified_workers").upsert(
        {
          x_user_id: tweet.author_id,
          x_handle: user.username,
          wallet,
          handle: `@${user.username}`,
          proof_url: url,
          application_tweet_id: tweet.id,
          application_text: tweet.text,
          category: "verified worker",
          status: "verified",
          holding_raw: holdingRaw,
          holding_tokens: holdingTokens,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "x_user_id" },
      );
      if (workerResult.error) throw workerResult.error;
      console.log(`accepted @${user.username}: ${holdingTokens.toLocaleString()} POW`);
    } else {
      console.log(`rejected @${user.username}: ${rejectionReason}`);
    }
  }

  if (response.meta?.newest_id) await setState("applications_since_id", response.meta.newest_id);
}

async function verifiedWorkers() {
  const result = await db
    .from("pow_verified_workers")
    .select("x_user_id,x_handle,wallet,accepted_at,created_at")
    .in("status", ["verified", "pending"]);

  if (result.error) throw result.error;
  return (result.data ?? []) as VerifiedWorker[];
}

async function scanWorkerPosts(workers: VerifiedWorker[]) {
  if (!workers.length) return;

  const workerByUserId = new Map(workers.map((worker) => [worker.x_user_id, worker]));
  const sinceId = await getState("posts_since_id");
  const response = await searchX(postQuery, sinceId);
  const users = userMap(response);
  const tweets = response.data ?? [];

  for (const tweet of tweets) {
    const worker = workerByUserId.get(tweet.author_id);
    if (!worker) continue;

    const user = users.get(tweet.author_id);
    const handle = user?.username || worker.x_handle;
    const metrics = tweet.public_metrics ?? {};
    const postScore = engagementScore(metrics);

    const result = await db.from("pow_worker_posts").upsert({
      tweet_id: tweet.id,
      x_user_id: tweet.author_id,
      x_handle: handle,
      wallet: worker.wallet,
      text: tweet.text,
      url: postUrl(handle, tweet.id),
      like_count: metrics.like_count ?? 0,
      repost_count: metrics.retweet_count ?? 0,
      reply_count: metrics.reply_count ?? 0,
      quote_count: metrics.quote_count ?? 0,
      bookmark_count: metrics.bookmark_count ?? 0,
      impression_count: metrics.impression_count ?? 0,
      engagement_score: postScore,
      tweet_created_at: tweet.created_at,
      updated_at: new Date().toISOString(),
    });
    if (result.error) throw result.error;
  }

  if (response.meta?.newest_id) await setState("posts_since_id", response.meta.newest_id);
}

function holdingDays(worker: VerifiedWorker) {
  const start = Date.parse(worker.accepted_at ?? worker.created_at ?? new Date().toISOString());
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, (Date.now() - start) / 86_400_000);
}

async function recalculateWorkerScores(workers: VerifiedWorker[]) {
  for (const worker of workers) {
    const [postsResult, balance] = await Promise.all([
      db
        .from("pow_worker_posts")
        .select("like_count,repost_count,reply_count,quote_count,bookmark_count,impression_count,engagement_score")
        .eq("x_user_id", worker.x_user_id),
      powBalance(worker.wallet),
    ]);

    if (postsResult.error) throw postsResult.error;

    const posts = postsResult.data ?? [];
    const likes = posts.reduce((sum, post) => sum + Number(post.like_count ?? 0), 0);
    const reposts = posts.reduce((sum, post) => sum + Number(post.repost_count ?? 0), 0);
    const replies = posts.reduce((sum, post) => sum + Number(post.reply_count ?? 0), 0);
    const quotes = posts.reduce((sum, post) => sum + Number(post.quote_count ?? 0), 0);
    const views = posts.reduce((sum, post) => sum + Number(post.impression_count ?? 0), 0);
    const engagement = posts.reduce((sum, post) => sum + Number(post.engagement_score ?? 0), 0);
    const daysHeld = holdingDays(worker);
    const volumeUsd = await walletVolumeUsd(worker.wallet);

    const holdingMultiplier = 1 + Math.min(2, daysHeld / 30);
    const holdingScore = Math.max(0, balance.tokens / minWorkerPow) * 100 * holdingMultiplier;
    const volumeScore = Math.sqrt(volumeUsd) * 2;
    const score = engagement * holdingMultiplier + holdingScore + volumeScore;

    const updateResult = await db
      .from("pow_verified_workers")
      .update({
        status: balance.tokens >= minWorkerPow ? "verified" : "pending",
        holding_raw: balance.raw,
        holding_tokens: balance.tokens,
        holding_days: daysHeld,
        volume_usd: volumeUsd,
        score,
        engagement_score: engagement,
        holding_score: holdingScore,
        volume_score: volumeScore,
        post_count: posts.length,
        like_count: likes,
        repost_count: reposts,
        reply_count: replies,
        quote_count: quotes,
        impression_count: views,
        last_scored_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("x_user_id", worker.x_user_id);

    if (updateResult.error) throw updateResult.error;
  }
}

async function runOnce() {
  console.log("POW scanner tick started");
  await scanApplications();
  const workers = await verifiedWorkers();
  await scanWorkerPosts(workers);
  await recalculateWorkerScores(workers);
  console.log(`POW scanner tick complete: ${workers.length} verified workers`);
}

async function loop() {
  if (running) {
    console.log("Previous POW scanner tick is still running; skipping.");
    return;
  }

  running = true;
  try {
    await runOnce();
  } catch (error) {
    console.error("POW scanner tick failed", error);
  } finally {
    running = false;
  }
}

if (runningOnce) {
  runOnce().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} else {
  loop();
  setInterval(loop, intervalMs);
}
