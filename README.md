# POW · PROOF OF WORK

PROOF OF WORK links an X account to a private Solana wallet, scans public `$POW` posts, ranks verified contribution, and rewards eligible workers in `$POW`.

## Current Product Boundary

- The native `$POW` scanner and guarded payout worker are implemented, but they still require a staged dry run and manual funding before live activation.
- The scanner checks applications every 5 minutes and refreshes worker scores.
- The public leaderboard contains X handles, score, post totals, views, and minimum-hold status. It never stores or returns a wallet address.
- The rewards daemon runs every 15 minutes and pays only pre-funded `$POW` from a dedicated payout wallet.
- External campaign creation is still a frontend preview. It does not accept deposits or launch a real campaign yet.
- Creator-fee claiming and the displayed 80/20 routing are not automated by this repository yet. The payout wallet must be funded manually.
- In-app wallet/X onboarding creates a pending review row. Until an approved row is synchronized into `pow_verified_workers`, the X Community `#POWApplication` scanner is the complete leaderboard path.
- Campaigns may eventually be funded in SOL or any SPL token, but worker payouts are always `$POW`.
- No automatic SOL/token-to-`$POW` swap is implemented. Convert and fund the payout wallet manually for now.

## Supabase

For a fresh project using the Supabase SQL Editor, run the complete `supabase/setup_all.sql` file once. It applies all migrations in order.

For the tracked CLI workflow, apply these migrations in order:

1. `supabase/migrations/001_pow_rewards.sql`
2. `supabase/migrations/002_pow_anti_cheat.sql`
3. `supabase/migrations/003_pow_campaigns_privacy_and_token_rewards.sql`
4. `supabase/migrations/004_pow_worker_onboarding.sql`
5. `supabase/migrations/005_pow_campaign_funding_wallets.sql`
6. `supabase/migrations/006_pow_payout_receipts.sql`
7. `supabase/migrations/007_pow_brand_assets.sql`

The third migration is required. It adds campaign funding records, `$POW` payout accounting, the wallet-free public leaderboard, and removes public access to wallet-bearing tables.

Supabase recommends applying tracked migrations with the CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Do not mix manual SQL Editor changes with the tracked CLI workflow on the same production database without repairing migration history. Supabase tracks CLI-applied migrations separately.

Wallet-free leaderboard check:

```sql
select
  rank,
  x_handle,
  score,
  meets_minimum,
  worker_status,
  post_count,
  impression_count,
  updated_at
from pow_public_leaderboard
where campaign_slug = 'pow'
order by rank;
```

## Vercel

Import the GitHub repository at `https://vercel.com/new`. The default Next.js build settings are sufficient.

Add these variables to Production and Preview in Project Settings > Environment Variables:

```bash
SUPABASE_URL=<Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_BUY_URL=https://jup.ag/?sell=So11111111111111111111111111111111111111112&buy=GSB16i8W1BvhfdJQBpe6LD9EvLYjXYa6JsmAwxJgpump
NEXT_PUBLIC_SOLANA_RPC_URL=<optional public Solana RPC URL for wallet-adapter state>
WORKER_ONBOARD_ENABLED=false
WORKER_MIN_BALANCE=500000
SESSION_SECRET=<at least 32 random characters>
HELIUS_API_KEY=<server-side Helius key>
POW_TOKEN_MINT=GSB16i8W1BvhfdJQBpe6LD9EvLYjXYa6JsmAwxJgpump
POW_REWARD_WALLET=<public address of the pre-funded native $POW reward wallet>
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never rename it with a `NEXT_PUBLIC_` prefix.
`HELIUS_API_KEY` is also server-only. Never expose it as a `NEXT_PUBLIC_` variable.

Only active Supabase campaigns with a valid `funding_wallet` can appear on the public board. A confirmed zero balance is hidden. The native campaign uses `POW_REWARD_WALLET` when set; otherwise it uses the row's `funding_wallet`. Helius success responses are cached for five minutes, and failed refreshes return `—` rather than a database or mock amount.

## Railway Scanner

Open `https://railway.com/new`, import the same GitHub repository, and create a persistent service named `pow-scanner`.

Build command:

```bash
pnpm install --frozen-lockfile
```

Start command:

```bash
pnpm pow:scanner
```

Scanner variables:

```bash
SUPABASE_URL=<Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
SOLANA_RPC_URL=<private production Solana RPC URL>
POW_TOKEN_MINT=GSB16i8W1BvhfdJQBpe6LD9EvLYjXYa6JsmAwxJgpump
WORKER_MIN_BALANCE=500000
X_BEARER_TOKEN=<X API v2 bearer token>
POW_WORK_CASHTAG="$POW"
POW_SCANNER_INTERVAL_MS=300000
MAX_PROFILE_SCAN_WORKERS=100
BLACKLISTED_WORKER_WALLETS=
BLACKLISTED_X_HANDLES=
BLACKLISTED_X_USER_IDS=
```

Optional wallet-volume inputs:

```bash
POW_VOLUME_API_URL=
POW_VOLUME_API_KEY=
```

Application format:

```text
#POWApplication <wallet address>
```

A valid application must be posted inside `https://x.com/i/communities/2032569869326004522` and contain `#POWApplication` plus the wallet. Accounts below 500K `$POW` appear as pending and cannot receive rewards. The private wallet is used for balance checks and payout construction; the public leaderboard only receives the X account and eligibility result.

### Manual First-Round Submission

Run this as a one-off command in the Railway scanner service for each manually approved worker:

```bash
pnpm worker:add -- --handle <x-handle> --wallet <solana-wallet> --score <points> --proof-url <x-post-url>
```

The command resolves the X account, checks the wallet's live `$POW` balance, rejects wallets below `WORKER_MIN_BALANCE`, upserts the private verified-worker row, and rebuilds the public wallet-free leaderboard. `--proof-url` is optional. If X lookup is unavailable, pass the numeric X ID with `--x-user-id <id>`.

Keep payouts in preview mode after adding workers. Run `pnpm rewards:preview` and inspect the planned recipients and amounts before enabling any live transaction.

## Railway Rewards

Create a second persistent Railway service from the same repository named `pow-rewards`. Do not share its private key with the scanner service.

Build command:

```bash
pnpm install --frozen-lockfile
```

Start command:

```bash
pnpm rewards:daemon
```

Use a dedicated low-balance payout wallet, not the main fee wallet or treasury. Fund it manually with the intended `$POW` allocation and enough SOL for associated-token-account rent and transaction fees.

Rewards variables:

```bash
SUPABASE_URL=<Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
SOLANA_RPC_URL=<private production Solana RPC URL>
POW_TOKEN_MINT=GSB16i8W1BvhfdJQBpe6LD9EvLYjXYa6JsmAwxJgpump
WORKER_MIN_BALANCE=500000
POW_PAYOUT_WALLET_PRIVATE_KEY=<base58 secret or JSON byte array>
MIN_WORKER_SCORE=1
MAX_PAYOUT_WORKERS=100
SOL_FEE_RESERVE=0.25
REWARDS_EPOCH_MS=900000
POW_PAYOUT_BALANCE_BPS=1
MAX_POW_PAYOUT_TOKENS_PER_EPOCH=10000
POW_TOKEN_RESERVE=1000000
MIN_POW_PAYOUT_TOKENS=100
MAX_TOKEN_TRANSFERS_PER_TX=1
REWARDS_DAEMON_EXECUTE=false
PAYOUT_ENABLED=false
ENABLE_POW_PAYOUTS=false
POW_PAYOUT_EXECUTION_ACK=
```

`POW_PAYOUT_BALANCE_BPS=1` means 0.01% of the spendable payout-wallet balance per 15-minute cycle, before the absolute epoch cap and reserve. If every cycle executes, that is at most roughly 0.96% per day before those additional limits.

### Safe Activation

1. Apply `supabase/setup_all.sql` or all tracked migrations 001-007.
2. Run both Railway services with rewards in preview mode.
3. Confirm scanner rows appear in `pow_public_leaderboard` without wallets.
4. Confirm preview epochs and `dry_run` payouts in Supabase.
5. Verify the real `$POW` mint, payout-wallet address, token balance, and SOL reserve.
6. Set an intentionally small balance cap and absolute per-epoch cap.
7. Enable live execution only after a manual preview review:

```bash
REWARDS_DAEMON_EXECUTE=true
PAYOUT_ENABLED=true
ENABLE_POW_PAYOUTS=true
POW_PAYOUT_EXECUTION_ACK=I_UNDERSTAND_POW_PAYOUTS_ARE_LIVE
```

The worker also uses one database epoch ID per 15-minute window, so a duplicate Railway process cannot intentionally settle the same time bucket twice. Each live worker receipt uses its own transaction so the public ledger has one unique Solana signature per payout. Set `PAYOUT_ENABLED=false` or `REWARDS_DAEMON_EXECUTE=false` and redeploy to stop live payouts.

## Campaign Payments For Now

Until the campaign funding API and swap/settlement layer are built:

1. Receive outside-project SOL or SPL-token funding into a treasury or multisig.
2. Verify the deposit manually.
3. Convert the agreed campaign allocation into `$POW` manually.
4. Transfer only the campaign's capped `$POW` budget to the dedicated payout wallet.
5. Keep the campaign in `awaiting_conversion` until the `$POW` balance is ready.

Do not let the Railway worker custody arbitrary campaign tokens or perform automatic swaps yet. A production swap path needs slippage limits, price validation, liquidity checks, transaction simulation, and a separate approval policy.

## Commands

Requires Node 22.13+.

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
pnpm pow:scanner
pnpm rewards:preview
pnpm rewards:daemon
```
