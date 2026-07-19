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
      helper: "Creator-fee routing starts after launch. No fake live rewards.",
      tone: "purple"
    },
    {
      key: "current-pool",
      label: "Worker Payroll",
      value: "100%",
      helper: "Creator fees are reserved for top workers on the leaderboard.",
      tone: "magenta"
    },
    {
      key: "countdown",
      label: "Scanner Cadence",
      value: "After launch",
      helper: "Applications and $POW posts are scanned every 5 minutes.",
      tone: "lime"
    },
    {
      key: "current-round",
      label: "Eligibility",
      value: "1M+ $POW",
      helper: "Holding $POW is the on-chain proof.",
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
      helper: "The proof ledger starts after the first verified payout.",
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
      key: "holder-rewards",
      label: "Total X Views",
      value: "Coming soon",
      helper: "Views from scored posts using the $POW cashtag.",
      tone: "lime"
    }
  ]
};

export const faqs: FaqItem[] = [
  {
    question: "How do I submit?",
    answer:
      "Hold 1M+ $POW, post the official POW application format, and include the wallet you want checked."
  },
  {
    question: "How do rewards work?",
    answer:
      "After launch, 100% of creator fees are paid as SOL payroll to top verified workers by leaderboard score."
  },
  {
    question: "Minimum holdings?",
    answer:
      "Verified workers need 1M+ $POW. Holder-reward eligibility can use the same minimum unless you change it before launch."
  },
  {
    question: "When are rewards sent?",
    answer:
      "The scanner updates every 5 minutes. Payroll cadence can be set before live claims start."
  },
  {
    question: "What counts toward score?",
    answer:
      "Holdings, hold-time multiplier, volume, $POW post engagement, and X views all feed the worker score."
  }
];
