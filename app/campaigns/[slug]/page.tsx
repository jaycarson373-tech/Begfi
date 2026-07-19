import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetail } from "@/components/campaign/campaign-detail";
import { campaignBySlug, campaigns } from "@/data/campaigns";

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const campaign = campaignBySlug(params.slug);
  if (!campaign) return {};
  return {
    title: `${campaign.name} | POW · PROOF OF WORK`,
    description: campaign.description
  };
}

export default function CampaignPage({ params }: { params: { slug: string } }) {
  const campaign = campaignBySlug(params.slug);
  if (!campaign) notFound();
  return <CampaignDetail campaign={campaign} />;
}
