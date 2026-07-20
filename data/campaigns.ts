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
