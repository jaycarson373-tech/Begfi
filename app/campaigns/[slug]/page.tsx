import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetail } from "@/components/campaign/campaign-detail";
import { getFundedCampaign } from "@/lib/server/campaign-funding";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const campaign = await getFundedCampaign(params.slug).catch(() => null);
  if (!campaign) return {};
  return {
    title: `${campaign.name} | POW · PROOF OF WORK`,
    description: campaign.description
  };
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const campaign = await getFundedCampaign(params.slug).catch(() => null);
  if (!campaign) notFound();
  return <CampaignDetail campaign={campaign} />;
}
