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
      helper: "Creator fees are reserved for top workers on the leaderboard.",
      tone: "magenta"
    },
    {
      key: "countdown",
      label: "AI Scanner",
      value: "After launch",
      helper: "Applications and public $POW posts are scored every 5 minutes.",
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
      helper: "Views from AI-scored posts using the $POW cashtag.",
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
      "After launch, 100% of creator fees are paid as SOL payroll to top verified workers by leaderboard score. Better outreach can earn more score, and more score can earn a larger payroll share."
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
    question: "How does the AI score work?",
    answer:
      "The AI-assisted scoring layer scans public $POW posts and combines outreach quality signals with X views, engagement, holdings, hold time, and wallet volume."
  },
  {
    question: "Can cheaters be excluded?",
    answer:
      "Yes. Botting, fake engagement, bought views, spam, copied posts, Sybil behavior, wallet cycling, and coordinated manipulation can be filtered, blacklisted, adjusted, or withheld from payroll."
  }
];
