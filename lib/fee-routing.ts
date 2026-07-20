import { powMinimumHolding } from "@/lib/pow-config";

export const protocolFeeRouting = {
  holders: {
    percent: 80,
    basisPoints: 8_000,
    label: "TO $POW HOLDERS",
    description: "Distributed to eligible $POW holders."
  },
  verifiedCampaigns: {
    percent: 20,
    basisPoints: 2_000,
    label: "TO VERIFIED CAMPAIGNS",
    description: "Added to reward pools for approved Proof of Work campaigns."
  },
  eligibleHolder: {
    minimumPow: powMinimumHolding,
    minimumLabel: "1M+ $POW",
    definition:
      "A verified POW Worker holding 1M+ $POW who passes the existing score and anti-cheat checks at payout time."
  }
} as const;

if (
  protocolFeeRouting.holders.percent + protocolFeeRouting.verifiedCampaigns.percent !== 100 ||
  protocolFeeRouting.holders.basisPoints + protocolFeeRouting.verifiedCampaigns.basisPoints !== 10_000
) {
  throw new Error("Protocol fee routing must total 100% (10,000 basis points).");
}

function percentageWord(percent: number, capitalize = false) {
  const words: Record<number, string> = { 20: "twenty", 80: "eighty" };
  const word = words[percent];
  if (!word) throw new Error(`Add a written label for the ${percent}% protocol fee route.`);
  return capitalize ? `${word[0].toUpperCase()}${word.slice(1)}` : word;
}

export const nativeCampaignFeeCopy =
  `The native $POW campaign is funded by protocol fees. ` +
  `${percentageWord(protocolFeeRouting.holders.percent, true)} percent of protocol fees is distributed to eligible $POW holders, ` +
  `while ${percentageWord(protocolFeeRouting.verifiedCampaigns.percent)} percent is allocated to reward pools for verified campaigns.`;
