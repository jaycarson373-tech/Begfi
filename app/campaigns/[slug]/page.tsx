import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetail } from "@/components/campaign/campaign-detail";
import { getFundedCampaign } from "@/lib/server/campaign-funding";
import { getPayoutFeed } from "@/lib/server/payout-receipts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const campaign = await getFundedCampaign(params.slug).catch(() => null);
  if (!campaign) return {};
  return {
    title: `${campaign.native ? "WORK" : campaign.name} Campaign`,
    description: campaign.description
  };
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const campaign = await getFundedCampaign(params.slug).catch(() => null);
  if (!campaign) notFound();
  const payoutFeed = await getPayoutFeed(params.slug).catch(() => ({ receipts: [], topEarner: null }));
  return <CampaignDetail campaign={campaign} initialPayoutFeed={payoutFeed} />;
}
