# POW

POW is a polished Next.js/Tailwind landing page and dashboard for a CT-native Proof of Work meta on Solana.

AI took your job. Come work for this coin. 100% of creator fees are used to distribute SOL to top workers. Post. Shill. Get paid. The one job you actually want to work.

The POW scanner links public X accounts to wallets through an application post. After that, it scans each verified worker profile for `$POW` posts. Better posts earn more reach, more engagement, more score, and a larger share of SOL payroll, which creates a positive feedback loop for workers who keep pushing the coin.

## Stack

- Next.js app router
- Tailwind CSS
- Framer Motion
- Lucide icons
- Launch-ready feed and dashboard placeholders
- Pump creator-fee rewards worker

## Feed Boundary

The feed and dashboard are ready for the X profile scanner and wallet verification services once those launch.

## Supabase

Run `supabase/migrations/001_pow_rewards.sql` in your Supabase SQL editor before enabling live worker writes. If you already ran the first migration, also run `supabase/migrations/002_pow_anti_cheat.sql`.

The dashboard reads live epochs, claims, SOL payroll payouts, scored worker posts, applications, and verified worker rows from Supabase. If Supabase envs are missing, the site falls back to launch placeholders.

Required for Railway worker writes:

```bash
SUPABASE_URL=<SUPABASE_URL>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

Required for Vercel dashboard reads:

```bash
SUPABASE_URL=<SUPABASE_URL>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are optional fallbacks for public reads.

## POW Scanner

The scanner runs every 5 minutes. The application step only links an X account to a Solana wallet. It accepts public X applications when the post includes a wallet and that wallet holds at least 1M `$POW`.

Application format:

```text
$POW #POW application

Wallet:
```

After acceptance, the scanner checks each verified worker's X profile for posts that use the `$POW` cashtag. The AI-assisted score is based on those posts' X engagement, X views, current holdings, hold time, and optional wallet volume.

Score inputs:

- `$POW` holdings, with a 1M `$POW` minimum.
- Hold-time multiplier from the worker acceptance timestamp.
- X engagement on `$POW` posts: likes, reposts, replies, quotes, bookmarks.
- X views from post public metrics.
- Current `$POW` balance. Selling down reduces holding score.
- Wallet volume, when `POW_VOLUME_API_URL` is configured.

If a worker wallet falls below 1M `$POW`, the worker moves to pending and is excluded from payroll. If it re-qualifies later, the holding-time streak restarts.

Anti-cheat exclusions are supported through the private `pow_blacklist` Supabase table and quick Railway env lists. Excluded accounts can be filtered from applications, scoring, and SOL payroll.

```bash
pnpm pow:scanner
```

Required scanner envs:

```bash
X_BEARER_TOKEN=<X_API_BEARER_TOKEN>
SUPABASE_URL=<SUPABASE_URL>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
SOLANA_RPC_URL=<RPC_URL>
SOURCE_TOKEN_MINT=<POW_TOKEN_MINT>
MIN_WORKER_POW_BALANCE=1000000
POW_WORK_CASHTAG="$POW"
MAX_PROFILE_SCAN_WORKERS=100
BLACKLISTED_WORKER_WALLETS=
BLACKLISTED_X_HANDLES=
BLACKLISTED_X_USER_IDS=
```

`POW_VOLUME_API_URL` and `POW_VOLUME_API_KEY` are optional. Without a volume indexer, volume score stays at zero.

## SOL Payroll Worker

The worker can claim Pump creator fees and distribute 100% of each claim as SOL to top verified workers, pro-rata by leaderboard score.

It is preview-only by default.

```bash
pnpm rewards:preview
pnpm rewards:execute
pnpm rewards:daemon
```

For Railway, deploy the same repo as a separate worker service with:

```bash
pnpm rewards:daemon
```

Set `REWARDS_DAEMON_EXECUTE=true` only when the fee wallet, `$POW` mint, RPC, Supabase, and claim cap are configured. Required envs are listed in `.env.example`.

`SOURCE_TOKEN_MINT` is the `$POW` mint used for worker eligibility checks. `MIN_WORKER_SCORE`, `MAX_PAYOUT_WORKERS`, and `MIN_PAYOUT_LAMPORTS` control who gets paid from each SOL payroll epoch.

## Commands

Requires Node 22.13+.

```bash
pnpm install
pnpm dev
pnpm build
```
