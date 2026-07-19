export type MetricTone = "purple" | "magenta" | "lime" | "steel";

export type ProtocolMetric = {
  key: string;
  label: string;
  value: string;
  helper: string;
  tone: MetricTone;
};

export type Submission = {
  rank: number;
  wallet: string;
  lane: string;
  proof: string;
  status: string;
  score?: string;
  holdings?: string;
  holdTime?: string;
  volume?: string;
  views?: string;
  engagement?: string;
};

export type PreviousWinner = {
  round: string;
  wallet: string;
  payout: string;
  reason: string;
};

export type DashboardSnapshot = {
  round: {
    id: string;
    status: string;
    pool: string;
    holderRewardPool: string;
    votingWindow: string;
  };
  metrics: ProtocolMetric[];
  submissions: Submission[];
  previousWinners: PreviousWinner[];
  totals: ProtocolMetric[];
};

export type FaqItem = {
  question: string;
  answer: string;
};
