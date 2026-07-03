# BegFi

BegFi is a polished Next.js/Tailwind landing page and dashboard concept for a CT-native Beg-To-Earn protocol on Solana.

## Stack

- Next.js app router
- Tailwind CSS
- Framer Motion
- Lucide icons
- Launch-ready feed and dashboard placeholders
- Pump creator-fee rewards worker

## Feed Boundary

The feed and dashboard are ready for the X scanner, wallet verification, and voting services once those launch.

## Rewards Worker

The worker can claim Pump creator fees, send 50% of each claim to the Beg Pool wallet, snapshot eligible holders, swap the remaining 50% through Jupiter, and airdrop the reward token pro-rata to holders.

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

Set `REWARDS_DAEMON_EXECUTE=true` only when the fee wallet, Beg Pool wallet, mints, RPC, and claim cap are configured. Required envs are listed in `.env.example`.

`SOURCE_TOKEN_MINT` is the mint used for the holder snapshot. `REWARD_TOKEN_MINT` is the token bought with the holder-reward half and airdropped. Set both to the $BEG mint if holders should receive $BEG.

## Commands

Requires Node 22.13+.

```bash
pnpm install
pnpm dev
pnpm build
```
