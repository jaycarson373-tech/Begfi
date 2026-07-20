import type { DashboardSnapshot } from "@/types/protocol";

export const emptyDashboardSnapshot: DashboardSnapshot = {
  round: {
    id: "—",
    status: "—",
    pool: "—",
    holderRewardPool: "$POW",
    votingWindow: "—"
  },
  metrics: [],
  submissions: [],
  previousWinners: [],
  totals: []
};
