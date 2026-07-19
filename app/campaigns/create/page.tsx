import type { Metadata } from "next";
import { CampaignCreate } from "@/components/campaign/campaign-create";

export const metadata: Metadata = {
  title: "Launch a Campaign | Proof of Work",
  description: "Fund a campaign in SOL or an SPL token and reward the strongest contributors in $POW."
};

export default function CreateCampaignPage() {
  return <CampaignCreate />;
}
