import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  powApplicationHashtag,
  powCommunityId,
  powMinimumHolding,
} from "../lib/pow-config";

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
  community_id?: string;
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
  status: string | null;
  holding_tokens: string | number | null;
  accepted_at: string | null;
  created_at: string | null;
};

type PublicWorker = {
  x_user_id: string;
  x_handle: string;
  status: string | null;
  holding_tokens: string | number | null;
  score: string | number | null;
  post_count: number | null;
  impression_count: number | null;
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

const walletPattern = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const xApiBaseUrl = "https://api.x.com/2";
const xSearchUrl = `${xApiBaseUrl}/tweets/search/recent`;
const runningOnce = process.argv.includes("--once");
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

const db = createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});
const connection = new Connection(requiredEnv("SOLANA_RPC_URL"), "confirmed");
const xBearerToken = requiredEnv("X_BEARER_TOKEN");
const powMint = new PublicKey(process.env.POW_TOKEN_MINT?.trim() || requiredEnv("SOURCE_TOKEN_MINT"));
const minWorkerPow = powMinimumHolding;
const applicationQuery = `${powApplicationHashtag} -is:retweet`;
const workCashtag = process.env.POW_WORK_CASHTAG?.trim() || "$POW";
const intervalMs = integerEnv("POW_SCANNER_INTERVAL_MS", 5 * 60 * 1000);
const maxProfileScanWorkers = integerEnv("MAX_PROFILE_SCAN_WORKERS", 100);
const volumeApiUrl = process.env.POW_VOLUME_API_URL?.trim();
const volumeApiKey = process.env.POW_VOLUME_API_KEY?.trim();

if (maxProfileScanWorkers < 1 || maxProfileScanWorkers > 500) {
  throw new Error("MAX_PROFILE_SCAN_WORKERS must be an integer from 1 to 500");
}

let running = false;
let cachedDecimals: number | null = null;
let blacklistWarningShown = false;
let publicLeaderboardWarningShown = false;

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

function includesWorkCashtag(text: string) {
  return text.toLowerCase().includes(workCashtag.toLowerCase());
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
  const handle = normalizeHandle(entry.x_handle);
  const userId = entry.x_user_id?.trim();

  if (wallet) index.wallets.set(wallet, reason);
  if (userId) index.userIds.set(userId, reason);
  if (handle) index.handles.set(handle, reason);
}

async function loadBlacklist(): Promise<BlacklistIndex> {
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
    if (!blacklistWarningShown) {
      console.warn(`POW blacklist table unavailable: ${result.error.message}`);
      blacklistWarningShown = true;
    }
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
    "tweet.fields": "author_id,community_id,created_at,public_metrics",
    expansions: "author_id",
    "user.fields": "username,name",
  });

  if (sinceId) params.set("since_id", sinceId);

  const response = await fetch(`${xSearchUrl}?${params}`, {
    headers: {
      authorization: `Bearer ${xBearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`X search failed ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as XSearchResponse;
}

async function fetchWorkerTimeline(worker: VerifiedWorker, sinceId?: string) {
  const params = new URLSearchParams({
    max_results: "100",
    exclude: "retweets",
    "tweet.fields": "author_id,created_at,public_metrics",
  });

  if (sinceId) params.set("since_id", sinceId);

  const response = await fetch(`${xApiBaseUrl}/users/${worker.x_user_id}/tweets?${params}`, {
    headers: {
      authorization: `Bearer ${xBearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`X profile scan failed for @${worker.x_handle} ${response.status}: ${await response.text()}`);
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

async function scanApplications(blacklist: BlacklistIndex) {
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
    const accountExclusion = blacklistReason(blacklist, {
      xUserId: tweet.author_id,
      handle: user.username,
    });

    if (tweet.community_id !== powCommunityId) {
      rejectionReason = "application must be posted in the official POW X Community";
    } else if (accountExclusion) {
      rejectionReason = accountExclusion;
    } else if (wallet) {
      const walletExclusion = blacklistReason(blacklist, {
        wallet,
        xUserId: tweet.author_id,
        handle: user.username,
      });
      if (walletExclusion) {
        rejectionReason = walletExclusion;
      } else {
        const balance = await powBalance(wallet);
        holdingRaw = balance.raw;
        holdingTokens = balance.tokens;
        const linkedResult = await db
          .from("pow_verified_workers")
          .select("x_user_id,x_handle")
          .eq("wallet", wallet)
          .maybeSingle();
        if (linkedResult.error) throw linkedResult.error;

        if (linkedResult.data && linkedResult.data.x_user_id !== tweet.author_id) {
          rejectionReason = "wallet is already linked to another X account";
        } else {
          status = "accepted";
          rejectionReason = "";
        }
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
          status: holdingTokens >= minWorkerPow ? "verified" : "pending",
          exclusion_reason: null,
          excluded_at: null,
          holding_raw: holdingRaw,
          holding_tokens: holdingTokens,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "x_user_id" },
      );
      if (workerResult.error) throw workerResult.error;
      console.log(
        `linked @${user.username}: ${holdingTokens.toLocaleString()} POW (${holdingTokens >= minWorkerPow ? "eligible" : "below minimum"})`,
      );
    } else {
      console.log(`rejected @${user.username}: ${rejectionReason}`);
    }
  }

  if (response.meta?.newest_id) await setState("applications_since_id", response.meta.newest_id);
}

async function verifiedWorkers() {
  const result = await db
    .from("pow_verified_workers")
    .select("x_user_id,x_handle,wallet,status,holding_tokens,accepted_at,created_at")
    .in("status", ["verified", "pending", "paid"]);

  if (result.error) throw result.error;
  return (result.data ?? []) as VerifiedWorker[];
}

async function scanWorkerPosts(workers: VerifiedWorker[]) {
  if (!workers.length) return;

  for (const worker of workers.slice(0, maxProfileScanWorkers)) {
    try {
      const stateKey = `worker_posts_since_id:${worker.x_user_id}`;
      const sinceId = await getState(stateKey);
      const response = await fetchWorkerTimeline(worker, sinceId);
      const tweets = (response.data ?? []).filter((tweet) => includesWorkCashtag(tweet.text));

      for (const tweet of tweets) {
        const metrics = tweet.public_metrics ?? {};
        const postScore = engagementScore(metrics);

        const result = await db.from("pow_worker_posts").upsert({
          tweet_id: tweet.id,
          x_user_id: worker.x_user_id,
          x_handle: worker.x_handle,
          wallet: worker.wallet,
          text: tweet.text,
          url: postUrl(worker.x_handle, tweet.id),
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

      if (response.meta?.newest_id) await setState(stateKey, response.meta.newest_id);
      console.log(`profile scanned @${worker.x_handle}: ${tweets.length} ${workCashtag} posts`);
    } catch (error) {
      console.warn(`Skipping profile scan for @${worker.x_handle}`, error);
    }
  }
}

function holdingDays(worker: VerifiedWorker) {
  const start = Date.parse(worker.accepted_at ?? worker.created_at ?? new Date().toISOString());
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, (Date.now() - start) / 86_400_000);
}

async function recalculateWorkerScores(workers: VerifiedWorker[], blacklist: BlacklistIndex) {
  for (const worker of workers) {
    const exclusion = blacklistReason(blacklist, {
      wallet: worker.wallet,
      xUserId: worker.x_user_id,
      handle: worker.x_handle,
    });

    if (exclusion) {
      const updateResult = await db
        .from("pow_verified_workers")
        .update({
          status: "rejected",
          score: 0,
          exclusion_reason: exclusion,
          excluded_at: new Date().toISOString(),
          last_scored_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("x_user_id", worker.x_user_id);

      if (updateResult.error) throw updateResult.error;
      console.log(`blacklisted @${worker.x_handle}: ${exclusion}`);
      continue;
    }

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
    const qualified = balance.tokens >= minWorkerPow;
    const previousHoldingTokens = Number(worker.holding_tokens ?? 0);
    const soldDown = qualified && previousHoldingTokens > 0 && balance.tokens < previousHoldingTokens;
    const now = new Date().toISOString();
    const acceptedAt = qualified && (worker.status === "pending" || soldDown)
      ? now
      : worker.accepted_at ?? now;
    const daysHeld = qualified ? holdingDays({ ...worker, accepted_at: acceptedAt }) : 0;
    const volumeUsd = qualified ? await walletVolumeUsd(worker.wallet) : 0;

    const holdingMultiplier = qualified ? 1 + Math.min(2, daysHeld / 30) : 0;
    const holdingScore = qualified ? Math.max(0, balance.tokens / minWorkerPow) * 100 * holdingMultiplier : 0;
    const volumeScore = qualified ? Math.sqrt(volumeUsd) * 2 : 0;
    const score = qualified ? engagement * holdingMultiplier + holdingScore + volumeScore : 0;
    const status = qualified
      ? worker.status === "paid"
        ? "paid"
        : "verified"
      : "pending";

    const updateResult = await db
      .from("pow_verified_workers")
      .update({
        status,
        exclusion_reason: null,
        excluded_at: null,
        accepted_at: acceptedAt,
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

async function syncPublicLeaderboard() {
  const [campaignResult, workersResult] = await Promise.all([
    db.from("pow_campaigns").select("id").eq("slug", "pow").maybeSingle(),
    db
      .from("pow_verified_workers")
      .select("x_user_id,x_handle,status,holding_tokens,score,post_count,impression_count")
      .in("status", ["verified", "pending", "paid"])
      .order("score", { ascending: false }),
  ]);

  if (campaignResult.error || workersResult.error || !campaignResult.data?.id) {
    if (!publicLeaderboardWarningShown) {
      const message = campaignResult.error?.message || workersResult.error?.message || "native campaign is missing";
      console.warn(`Public leaderboard sync disabled until migration 003 is applied: ${message}`);
      publicLeaderboardWarningShown = true;
    }
    return;
  }

  const campaignId = campaignResult.data.id as string;
  const workers = (workersResult.data ?? []) as PublicWorker[];
  const rows = workers.map((worker, index) => ({
    campaign_id: campaignId,
    campaign_slug: "pow",
    x_user_id: worker.x_user_id,
    x_handle: worker.x_handle,
    rank: index + 1,
    score: Number(worker.score ?? 0),
    meets_minimum: Number(worker.holding_tokens ?? 0) >= minWorkerPow,
    worker_status: worker.status ?? "pending",
    post_count: worker.post_count ?? 0,
    impression_count: worker.impression_count ?? 0,
    updated_at: new Date().toISOString(),
  }));

  const deleteResult = await db
    .from("pow_public_leaderboard")
    .delete()
    .eq("campaign_id", campaignId);
  if (deleteResult.error) throw deleteResult.error;

  if (rows.length) {
    const insertResult = await db.from("pow_public_leaderboard").insert(rows);
    if (insertResult.error) throw insertResult.error;
  }

  console.log(`public leaderboard synced: ${rows.length} workers, no wallets exposed`);
}

async function runOnce() {
  console.log("POW scanner tick started");
  const blacklist = await loadBlacklist();
  await scanApplications(blacklist);
  const workers = await verifiedWorkers();
  const activeWorkers = workers.filter((worker) => !blacklistReason(blacklist, {
    wallet: worker.wallet,
    xUserId: worker.x_user_id,
    handle: worker.x_handle,
  }));
  await scanWorkerPosts(activeWorkers);
  await recalculateWorkerScores(workers, blacklist);
  await syncPublicLeaderboard();
  console.log(`POW scanner tick complete: ${activeWorkers.length} active workers`);
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
