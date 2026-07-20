import { PowHome } from "@/components/pow-home";
import type { Campaign } from "@/data/campaigns";
import { getFundedCampaigns } from "@/lib/server/campaign-funding";

export const dynamic = "force-dynamic";

export default async function Page() {
  let campaigns: Campaign[] = [];
  try {
    campaigns = await getFundedCampaigns();
  } catch (error) {
    console.warn("Homepage campaign funding is unavailable", error);
  }

  return (
    <PowHome
      workerOnboardingEnabled={process.env.WORKER_ONBOARD_ENABLED === "true"}
      initialCampaigns={campaigns}
    />
  );
}
