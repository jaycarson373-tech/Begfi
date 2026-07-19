# ProofOfBagwork.fun

ProofOfBagwork.fun is a polished Next.js/Tailwind landing page and dashboard for a CT-native Proof of Work meta on Solana.

## Stack

- Next.js app router
- Tailwind CSS
- Framer Motion
- Lucide icons
- Launch-ready feed and dashboard placeholders
- Pump creator-fee rewards worker

## Feed Boundary

The feed and dashboard are ready for the X scanner and wallet verification services once those launch.

## Supabase

Run `supabase/migrations/001_proof_of_bagwork_rewards.sql` in your Supabase SQL editor before enabling live worker writes.

The dashboard reads live epochs, claims, swaps, reward-wallet transfers, holder payouts, and verified bagworker rows from Supabase. If Supabase envs are missing, the site falls back to launch placeholders.

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

## Rewards Worker

The worker can claim Pump creator fees, send 50% of each claim to the Proof of Bagwork bounty wallet, swap the other 50% into `$ANSEM`, snapshot eligible `$BEG` holders, and airdrop the `$ANSEM` pro-rata to holders.

It is preview-only by default.

```bash
pnpm rewards:preview
pnpm rewards:execute
pnpm rewards:daemon
```

`pnpm rewards:airdrop` can manually distribute the fee wallet's current `$ANSEM` balance to the current holder snapshot.

For Railway, deploy the same repo as a separate worker service with:

```bash
pnpm rewards:daemon
```

Set `REWARDS_DAEMON_EXECUTE=true` only when the fee wallet, Proof of Bagwork bounty wallet, `$BEG` mint, `$ANSEM` mint, RPC, and claim cap are configured. Required envs are listed in `.env.example`.

`SOURCE_TOKEN_MINT` is the `$BEG` mint used for the holder snapshot. `ANSEM_TOKEN_MINT` is the token bought and airdropped to eligible holders. `BAGWORK_REWARD_WALLET` receives the manual bounties and verified-bagworker side of the split. The older `BEGWORK_REWARD_WALLET` env still works as a fallback.

## Commands

Requires Node 22.13+.

```bash
pnpm install
pnpm dev
pnpm build
```
