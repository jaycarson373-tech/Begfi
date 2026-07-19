export type CampaignLeaderboardRow = {
  rank: number;
  xAccount: string;
  wallet: string;
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
  workers: string;
  posts: string;
  timeRemaining: string;
  status: string;
  fundingSource: "Protocol Fees" | "Funded by Project";
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
    name: "Proof of Work Campaign",
    ticker: "$POW",
    mark: "POW",
    logo: "/images/pow-logo.png",
    description:
      "Protocol fees continuously fund the native Proof of Work campaign, rewarding the strongest contributors helping grow $POW.",
    rewardPool: "Coming soon",
    workers: "—",
    posts: "—",
    timeRemaining: "Ongoing",
    status: "Live",
    fundingSource: "Protocol Fees",
    keyword: "$POW",
    schedule: "Continuous campaign",
    eligibility: [
      "Connect a verified X account to an eligible wallet.",
      "Hold at least 1M $POW to remain eligible.",
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
    workers: "186",
    posts: "1,420",
    timeRemaining: "12 days",
    status: "Preview",
    fundingSource: "Funded by Project",
    keyword: "$VCTR",
    schedule: "August 1 – August 21",
    eligibility: [
      "Verified Proof of Worker profile.",
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
      { rank: 1, xAccount: "@alexbuilds", wallet: "9vJ4...m2Pq", score: "9,840", estimatedReward: "4.20 SOL" },
      { rank: 2, xAccount: "@mayamakes", wallet: "7dKe...x91L", score: "8,960", estimatedReward: "3.65 SOL" },
      { rank: 3, xAccount: "@ravilabs", wallet: "3Qsw...7aVn", score: "8,220", estimatedReward: "3.10 SOL" },
      { rank: 4, xAccount: "@sofiaonchain", wallet: "B8tr...p4Kx", score: "7,740", estimatedReward: "2.70 SOL" }
    ]
  },
  {
    slug: "arc",
    name: "Arc Community Launch",
    ticker: "$ARC",
    mark: "A",
    description:
      "A fictional launch campaign rewarding useful threads, replies, and original community content.",
    rewardPool: "25 SOL",
    workers: "94",
    posts: "680",
    timeRemaining: "18 days",
    status: "Preview",
    fundingSource: "Funded by Project",
    keyword: "$ARC",
    schedule: "August 8 – September 1",
    eligibility: [
      "Verified Proof of Worker profile.",
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
      { rank: 1, xAccount: "@drewcuts", wallet: "5Lmk...c2Rz", score: "7,410", estimatedReward: "3.40 SOL" },
      { rank: 2, xAccount: "@zanegrows", wallet: "Ee71...w9Sa", score: "6,980", estimatedReward: "3.05 SOL" },
      { rank: 3, xAccount: "@mayamakes", wallet: "7dKe...x91L", score: "6,250", estimatedReward: "2.60 SOL" },
      { rank: 4, xAccount: "@sofiaonchain", wallet: "B8tr...p4Kx", score: "5,890", estimatedReward: "2.25 SOL" }
    ]
  }
];

export function campaignBySlug(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}
