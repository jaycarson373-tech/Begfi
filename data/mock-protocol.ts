import type { DashboardSnapshot, FaqItem } from "@/types/protocol";

export const dashboardSnapshot: DashboardSnapshot = {
  round: {
    id: "Launch round",
    status: "Live dashboard coming after launch",
    pool: "50%",
    holderRewardPool: "50%",
    votingWindow: "10-minute holder drops"
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
      label: "$ANSEM Holder Rewards",
      value: "50%",
      helper: "Half of creator fees are reserved for eligible $BEG holders.",
      tone: "magenta"
    },
    {
      key: "countdown",
      label: "Drop Cadence",
      value: "After launch",
      helper: "$ANSEM holder rewards target 10-minute rounds after launch.",
      tone: "lime"
    },
    {
      key: "current-round",
      label: "Eligibility",
      value: "Hold $BEG",
      helper: "Holding $BEG is on-chain begging.",
      tone: "steel"
    }
  ],
  submissions: [],
  previousWinners: [],
  totals: [
    {
      key: "total-begged",
      label: "Verified Begwork",
      value: "Coming soon",
      helper: "The begwork ledger starts after the first verified payout.",
      tone: "magenta"
    },
    {
      key: "total-fees",
      label: "Total Creator Fees Distributed",
      value: "Coming soon",
      helper: "Fees split between $ANSEM rewards and the reward wallet.",
      tone: "purple"
    },
    {
      key: "holder-rewards",
      label: "Total $ANSEM Rewards",
      value: "Coming soon",
      helper: "Eligible $BEG holders receive the $ANSEM side of the split.",
      tone: "lime"
    }
  ]
};

export const faqs: FaqItem[] = [
  {
    question: "How do I submit?",
    answer:
      "Hold $BEG, post the official Begwork format, and include the wallet you want checked."
  },
  {
    question: "How do $ANSEM rewards work?",
    answer:
      "After launch, 50% of creator fees are reserved for $ANSEM rewards to eligible $BEG holders."
  },
  {
    question: "Minimum holdings?",
    answer:
      "The public site says hold $BEG to be eligible. The exact minimum can be locked before live claims start."
  },
  {
    question: "When are rewards sent?",
    answer:
      "The target cadence for $ANSEM holder rewards is every 10 minutes after launch."
  },
  {
    question: "What is the reward wallet?",
    answer:
      "The other 50% of creator fees goes to a reward wallet for manual verified beggar payouts and bounties."
  }
];
