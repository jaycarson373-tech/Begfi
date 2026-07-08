# Begwork

Begwork is a polished Next.js/Tailwind landing page and dashboard concept for a CT-native Ansem-rewarded begging meta on Solana.

## Stack

- Next.js app router
- Tailwind CSS
- Framer Motion
- Lucide icons
- Launch-ready feed and dashboard placeholders
- Pump creator-fee rewards worker

## Feed Boundary

The feed and dashboard are ready for the X scanner and wallet verification services once those launch.

## Rewards Worker

The worker can claim Pump creator fees, send 50% of each claim to the Begwork reward wallet, swap the other 50% into `$ANSEM`, snapshot eligible `$BEG` holders, and airdrop the `$ANSEM` pro-rata to holders.

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

Set `REWARDS_DAEMON_EXECUTE=true` only when the fee wallet, Begwork reward wallet, `$BEG` mint, `$ANSEM` mint, RPC, and claim cap are configured. Required envs are listed in `.env.example`.

`SOURCE_TOKEN_MINT` is the `$BEG` mint used for the holder snapshot. `ANSEM_TOKEN_MINT` is the token bought and airdropped to eligible holders. `BEGWORK_REWARD_WALLET` receives the manual bounties and verified-beggar side of the split.

## Commands

Requires Node 22.13+.

```bash
pnpm install
pnpm dev
pnpm build
```
