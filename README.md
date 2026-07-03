# BegFi

BegFi is a polished Next.js/Tailwind landing page and dashboard concept for a creator-fee protocol themed around Crypto Twitter airdrop culture.

## Stack

- Next.js app router
- Tailwind CSS
- Framer Motion
- Lucide icons
- Mock data only

## Data Boundary

The dashboard reads from `lib/protocol-data.ts`, which currently returns static mock data from `data/mock-protocol.ts`. Replace that service layer with live APIs for creator-fee indexing, wallet verification, signed or on-chain voting, and reward distribution without redesigning the UI.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
```
