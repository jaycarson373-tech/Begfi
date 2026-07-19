import type { Metadata } from "next";
import { CampaignCreate } from "@/components/campaign/campaign-create";

export const metadata: Metadata = {
  title: "Launch a Campaign | Proof of Work",
  description: "Create a SOL reward pool and reward the strongest contributors growing your project."
};

export default function CreateCampaignPage() {
  return <CampaignCreate />;
}
