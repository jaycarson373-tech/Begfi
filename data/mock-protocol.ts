import type { DashboardSnapshot, FaqItem } from "@/types/protocol";

export const dashboardSnapshot: DashboardSnapshot = {
  round: {
    id: "Launch round",
    status: "Live dashboard coming after launch",
    pool: "100%",
    holderRewardPool: "SOL",
    votingWindow: "5-minute scanner"
  },
  metrics: [
    {
      key: "creator-fees",
      label: "Creator Fees",
      value: "Coming soon",
      helper: "Creator-fee routing starts after launch.",
      tone: "purple"
    },
    {
      key: "current-pool",
      label: "Worker Payroll",
      value: "100%",
      helper: "Protocol fees fund the native $POW campaign reward pool.",
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
      label: "Total SOL Payroll",
      value: "Coming soon",
      helper: "Settled creator-fee payroll paid to top workers.",
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
      "Hold 1M+ $POW, post the official application format, and include the wallet you want linked to your X account."
  },
  {
    question: "How do rewards work?",
    answer:
      "After launch, 100% of creator fees are paid as SOL payroll to top verified workers by leaderboard score. Better attention can earn more score, and more score can earn a larger payroll share."
  },
  {
    question: "Minimum holdings?",
    answer:
      "Verified workers need 1M+ $POW. If the linked wallet sells down, its holding score drops. If it falls below the minimum, the worker goes pending and stops qualifying for payroll."
  },
  {
    question: "When are rewards sent?",
    answer:
      "The scanner updates every 5 minutes. Payroll cadence can be set before live claims start."
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
