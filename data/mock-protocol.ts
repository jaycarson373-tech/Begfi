import type { DashboardSnapshot, FaqItem } from "@/types/protocol";

export const dashboardSnapshot: DashboardSnapshot = {
  round: {
    id: "Round 042",
    status: "Mock voting round",
    pool: "7.41 SOL",
    holderRewardPool: "7.41 SOL",
    votingWindow: "Hourly window"
  },
  metrics: [
    {
      key: "creator-fees",
      label: "Live Creator Fees",
      value: "14.82 SOL",
      helper: "Static mock snapshot. Connect this to a fee indexer later.",
      tone: "purple"
    },
    {
      key: "current-pool",
      label: "Current Beg Pool",
      value: "7.41 SOL",
      helper: "50% of mock creator fees assigned to this round.",
      tone: "magenta"
    },
    {
      key: "countdown",
      label: "Countdown Timer",
      value: "Top of hour",
      helper: "Client clock only until a round API is wired.",
      tone: "lime"
    },
    {
      key: "current-round",
      label: "Current Voting Round",
      value: "Round 042",
      helper: "Replace mock round state with signed vote data.",
      tone: "steel"
    }
  ],
  submissions: [
    {
      rank: 1,
      wallet: "7egF...9rQ2",
      losses: "$18,420",
      story:
        "Round-tripped a top blast, sold the bottom, then bought the screenshot.",
      votes: 1284
    },
    {
      rank: 2,
      wallet: "A1rD...pLs7",
      losses: "$12,060",
      story:
        "Held through three influencers, two spaces, and one very sincere roadmap.",
      votes: 1017
    },
    {
      rank: 3,
      wallet: "SoLB...eg44",
      losses: "$8,777",
      story:
        "Bridged in late, clicked every claim button, and still paid gas for hope.",
      votes: 876
    },
    {
      rank: 4,
      wallet: "Meme...0x69",
      losses: "$5,505",
      story:
        "Posted a thread, got engagement, forgot to take profit like a professional.",
      votes: 544
    }
  ],
  previousWinners: [
    {
      round: "041",
      wallet: "NoBid...aE11",
      payout: "6.92 SOL",
      reason: "Best documented realized-loss arc."
    },
    {
      round: "040",
      wallet: "Exit...LiQ9",
      payout: "5.88 SOL",
      reason: "Most votes from eligible holders."
    },
    {
      round: "039",
      wallet: "Pain...DCA2",
      payout: "4.73 SOL",
      reason: "Clear wallet, clean loss proof, elite begging."
    }
  ],
  totals: [
    {
      key: "total-begged",
      label: "Total Begged",
      value: "69.4 SOL",
      helper: "Aggregate mock winner payouts.",
      tone: "magenta"
    },
    {
      key: "total-fees",
      label: "Total Creator Fees Distributed",
      value: "138.8 SOL",
      helper: "Mock distribution ledger total.",
      tone: "purple"
    },
    {
      key: "holder-rewards",
      label: "Total Holder Rewards",
      value: "69.4 SOL",
      helper: "Mock pro-rata holder side.",
      tone: "lime"
    }
  ]
};

export const faqs: FaqItem[] = [
  {
    question: "How do I submit?",
    answer:
      "Hold the minimum amount of $BEG, connect a wallet, submit the wallet that took the loss, add realized-loss proof, and write the short beg story. The current build uses mock data only."
  },
  {
    question: "How are winners chosen?",
    answer:
      "Eligible holders vote during the hourly round. The highest-voted valid submission wins the Beg Pool when the round closes."
  },
  {
    question: "Minimum holdings?",
    answer:
      "The interface is designed for a configurable threshold. A production integration should read the current minimum from the token-gating API or governance config."
  },
  {
    question: "When are rewards sent?",
    answer:
      "The target cadence is hourly: one Beg Pool winner payout and one pro-rata holder reward distribution after the voting window closes."
  },
  {
    question: "Is voting on-chain or signed?",
    answer:
      "The UI supports either path. Signed votes are the lighter default for speed; on-chain votes can be integrated later if the protocol wants stronger settlement guarantees."
  }
];
