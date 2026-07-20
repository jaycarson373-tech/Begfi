import { PowHome } from "@/components/pow-home";
import type { Campaign } from "@/data/campaigns";
import { getFundedCampaigns } from "@/lib/server/campaign-funding";
import { emptyPayoutFeed, getPayoutFeed } from "@/lib/server/payout-receipts";

export const dynamic = "force-dynamic";

export default async function Page() {
  let campaigns: Campaign[] = [];
  let payoutFeed = emptyPayoutFeed;
  try {
    [campaigns, payoutFeed] = await Promise.all([getFundedCampaigns(), getPayoutFeed()]);
  } catch (error) {
    console.warn("Homepage trust data is unavailable", error);
  }

  return (
    <PowHome
      workerOnboardingEnabled={process.env.WORKER_ONBOARD_ENABLED === "true"}
      initialCampaigns={campaigns}
      initialPayoutFeed={payoutFeed}
    />
  );
}
