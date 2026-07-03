import type { DashboardSnapshot, FaqItem } from "@/types/protocol";

export const dashboardSnapshot: DashboardSnapshot = {
  round: {
    id: "Launch round",
    status: "Live dashboard coming after launch",
    pool: "50%",
    holderRewardPool: "50%",
    votingWindow: "Hourly rounds"
  },
  metrics: [
    {
      key: "creator-fees",
      label: "Creator Fees",
      value: "Coming soon",
      helper: "100% routes back to the BegFi community after launch.",
      tone: "purple"
    },
    {
      key: "current-pool",
      label: "Beg Pool",
      value: "50%",
      helper: "Half of fees fund the hourly payout for the best beg.",
      tone: "magenta"
    },
    {
      key: "countdown",
      label: "Round Timer",
      value: "After launch",
      helper: "Hourly rounds begin once $BEG is live.",
      tone: "lime"
    },
    {
      key: "current-round",
      label: "Eligibility",
      value: "100K+ $BEG",
      helper: "Hold enough $BEG to submit, vote, and stay in the game.",
      tone: "steel"
    }
  ],
  submissions: [],
  previousWinners: [],
  totals: [
    {
      key: "total-begged",
      label: "Total Begged",
      value: "Coming soon",
      helper: "The beg ledger starts when the first round closes.",
      tone: "magenta"
    },
    {
      key: "total-fees",
      label: "Total Creator Fees Distributed",
      value: "Coming soon",
      helper: "Every creator-fee payout belongs back on CT.",
      tone: "purple"
    },
    {
      key: "holder-rewards",
      label: "Total Holder Rewards",
      value: "Coming soon",
      helper: "Eligible holders share the other half of fees.",
      tone: "lime"
    }
  ]
};

export const faqs: FaqItem[] = [
  {
    question: "How do I submit?",
    answer:
      "Hold 100K+ $BEG, post the official beg format, and include the wallet you want checked."
  },
  {
    question: "How are winners chosen?",
    answer:
      "Eligible holders vote during the hourly round. The highest-voted valid submission wins the Beg Pool when the round closes."
  },
  {
    question: "Minimum holdings?",
    answer:
      "Hold 100K+ $BEG to be eligible."
  },
  {
    question: "When are rewards sent?",
    answer:
      "After launch, the target cadence is hourly: one Beg Pool winner payout and one holder reward distribution."
  },
  {
    question: "Is voting on-chain or signed?",
    answer:
      "Signed voting keeps the beg machine fast. If the community wants heavier rails later, voting can move on-chain."
  }
];
