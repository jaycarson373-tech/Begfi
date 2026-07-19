import type { DashboardSnapshot, FaqItem } from "@/types/protocol";

export const dashboardSnapshot: DashboardSnapshot = {
  round: {
    id: "Launch round",
    status: "Live dashboard coming after launch",
    pool: "100%",
    holderRewardPool: "$POW",
    votingWindow: "15-minute rewards"
  },
  metrics: [
    {
      key: "reward-pool",
      label: "$POW Reward Wallet",
      value: "Coming soon",
      helper: "The live balance appears after the first reward preview.",
      tone: "purple"
    },
    {
      key: "pow-payout",
      label: "Latest $POW Reward",
      value: "Coming soon",
      helper: "Only a capped share of the payout wallet is used each cycle.",
      tone: "magenta"
    },
    {
      key: "countdown",
      label: "Profile Scanner",
      value: "After launch",
      helper: "Verified X profiles are checked for public $POW posts every 5 minutes.",
      tone: "lime"
    },
    {
      key: "current-round",
      label: "Eligibility",
      value: "1M+ $POW",
      helper: "Current wallet activity keeps the linked account eligible.",
      tone: "steel"
    }
  ],
  submissions: [],
  previousWinners: [],
  totals: [
    {
      key: "total-work",
      label: "Verified Work",
      value: "Coming soon",
      helper: "The worker ledger starts after the first verified payout.",
      tone: "magenta"
    },
    {
      key: "total-fees",
      label: "Total $POW Paid",
      value: "Coming soon",
      helper: "Settled $POW rewards paid to eligible workers.",
      tone: "purple"
    },
    {
      key: "x-views",
      label: "Total X Views",
      value: "Coming soon",
      helper: "Views from verified profile posts using the $POW cashtag.",
      tone: "lime"
    }
  ]
};

export const faqs: FaqItem[] = [
  {
    question: "How do I submit?",
    answer:
      "Hold 1M+ $POW, then post #POWApplication and your wallet in the official POW X Community."
  },
  {
    question: "How do rewards work?",
    answer:
      "Every 15 minutes, a capped share of the funded $POW reward wallet is allocated to eligible workers by leaderboard score. Better verified attention can earn more score and a larger reward share."
  },
  {
    question: "Minimum holdings?",
    answer:
      "Verified workers need 1M+ $POW. If the private linked wallet falls below the minimum, the public leaderboard marks the account ineligible without exposing the wallet."
  },
  {
    question: "When are rewards sent?",
    answer:
      "The scanner updates every 5 minutes. The guarded reward worker runs on a separate 15-minute cycle."
  },
  {
    question: "How does the AI score work?",
    answer:
      "After the application links X to wallet, the automatic scanner checks that X profile for public $POW posts and combines their views and engagement with current holdings, hold time, and wallet activity."
  },
  {
    question: "What is the bigger PoW vision?",
    answer:
      "The roadmap points toward a PoW marketplace where projects can find trust-scored verified workers, workers can find higher-quality projects, and the protocol can earn revenue from real distribution demand."
  },
  {
    question: "Can cheaters be excluded?",
    answer:
      "Yes. Botting, fake engagement, bought views, spam, copied posts, Sybil behavior, wallet cycling, and coordinated manipulation can be filtered, blacklisted, adjusted, or withheld from payroll."
  }
];
