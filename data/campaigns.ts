export type CampaignLeaderboardRow = {
  rank: number;
  xAccount: string;
  eligibility: string;
  score: string;
  estimatedReward: string;
};

export type Campaign = {
  slug: string;
  name: string;
  ticker: string;
  mark: string;
  logo?: string;
  description: string;
  rewardPool: string;
  fundingWallet: string;
  fundingToken: string;
  fundingBalance: number | null;
  solscanUrl: string;
  workers: string;
  posts: string;
  timeRemaining: string;
  status: string;
  fundingSource: "Protocol Fees" | "Funded by Project";
  fundingAsset: string;
  payoutAsset: "$POW";
  keyword: string;
  schedule: string;
  eligibility: string[];
  winners: string;
  rewardSplit: string;
  engagement: string;
  native: boolean;
  demo: boolean;
  leaderboard: CampaignLeaderboardRow[];
};

export const campaigns: Campaign[] = [
  {
    slug: "pow",
    name: "POW Campaign",
    ticker: "$POW",
    mark: "POW",
    logo: "/images/pow-network-mark.svg",
    description:
      "Protocol fees continuously fund the native POW campaign, rewarding the strongest contributors helping grow $POW.",
    rewardPool: "—",
    fundingWallet: "",
    fundingToken: "",
    fundingBalance: null,
    solscanUrl: "",
    workers: "—",
    posts: "—",
    timeRemaining: "Ongoing",
    status: "Live",
    fundingSource: "Protocol Fees",
    fundingAsset: "Protocol fees",
    payoutAsset: "$POW",
    keyword: "$POW",
    schedule: "Continuous campaign",
    eligibility: [
      "Post #POWApplication and your wallet in the official X Community.",
      "Hold at least 1M $POW to become and remain eligible.",
      "Use $POW in qualifying public posts.",
      "Pass engagement and wallet-behavior verification."
    ],
    winners: "Top eligible workers",
    rewardSplit: "Score-weighted distribution",
    engagement: "Coming soon",
    native: true,
    demo: false,
    leaderboard: []
  },
  {
    slug: "vector",
    name: "Vector Growth Sprint",
    ticker: "$VCTR",
    mark: "V",
    description:
      "A three-week content and community campaign for a fictional Solana liquidity project.",
    rewardPool: "40 SOL",
    fundingWallet: "",
    fundingToken: "SOL",
    fundingBalance: null,
    solscanUrl: "",
    workers: "186",
    posts: "1,420",
    timeRemaining: "12 days",
    status: "Preview",
    fundingSource: "Funded by Project",
    fundingAsset: "SOL",
    payoutAsset: "$POW",
    keyword: "$VCTR",
    schedule: "August 1 – August 21",
    eligibility: [
      "Verified POW Worker profile.",
      "Public posts must include $VCTR.",
      "Original content only; copied posts are excluded.",
      "Minimum campaign score of 250 points."
    ],
    winners: "Top 25 workers",
    rewardSplit: "Score-weighted distribution",
    engagement: "2.8M",
    native: false,
    demo: true,
    leaderboard: [
      { rank: 1, xAccount: "@alexbuilds", eligibility: "Minimum met", score: "9,840", estimatedReward: "420K $POW" },
      { rank: 2, xAccount: "@mayamakes", eligibility: "Minimum met", score: "8,960", estimatedReward: "365K $POW" },
      { rank: 3, xAccount: "@ravilabs", eligibility: "Minimum met", score: "8,220", estimatedReward: "310K $POW" },
      { rank: 4, xAccount: "@sofiaonchain", eligibility: "Minimum met", score: "7,740", estimatedReward: "270K $POW" }
    ]
  },
  {
    slug: "arc",
    name: "Arc Community Launch",
    ticker: "$ARC",
    mark: "A",
    description:
      "A fictional launch campaign rewarding useful threads, replies, and original community content.",
    rewardPool: "2M $ARC",
    fundingWallet: "",
    fundingToken: "",
    fundingBalance: null,
    solscanUrl: "",
    workers: "94",
    posts: "680",
    timeRemaining: "18 days",
    status: "Preview",
    fundingSource: "Funded by Project",
    fundingAsset: "$ARC",
    payoutAsset: "$POW",
    keyword: "$ARC",
    schedule: "August 8 – September 1",
    eligibility: [
      "Verified POW Worker profile.",
      "Public posts must include $ARC.",
      "No bought engagement or coordinated spam.",
      "Workers can join while the campaign is open."
    ],
    winners: "Top 15 workers",
    rewardSplit: "Top 15 weighted by score",
    engagement: "1.1M",
    native: false,
    demo: true,
    leaderboard: [
      { rank: 1, xAccount: "@drewcuts", eligibility: "Minimum met", score: "7,410", estimatedReward: "340K $POW" },
      { rank: 2, xAccount: "@zanegrows", eligibility: "Minimum met", score: "6,980", estimatedReward: "305K $POW" },
      { rank: 3, xAccount: "@mayamakes", eligibility: "Minimum met", score: "6,250", estimatedReward: "260K $POW" },
      { rank: 4, xAccount: "@sofiaonchain", eligibility: "Below minimum", score: "5,890", estimatedReward: "Ineligible" }
    ]
  }
];

export function campaignBySlug(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}
