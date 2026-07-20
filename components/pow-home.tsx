"use client";

import { FaqSection } from "@/components/faq-section";
import { CampaignsSection } from "@/components/campaigns-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { LeaderboardSection } from "@/components/leaderboard-section";
import { ProofFlow } from "@/components/proof-flow";
import { RoadmapSection } from "@/components/roadmap-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhyPow } from "@/components/why-pow";
import { WhyWeBuiltThis } from "@/components/why-we-built-this";
import { RecentPayouts } from "@/components/recent-payouts";
import { NetworkPulse } from "@/components/network-pulse";
import { NetworkStatusTicker } from "@/components/network-status-ticker";
import { WorkTypes } from "@/components/work-types";
import type { Campaign } from "@/data/campaigns";
import type { PayoutFeedData } from "@/types/payouts";

export function PowHome({
  workerOnboardingEnabled,
  initialCampaigns,
  initialPayoutFeed
}: {
  workerOnboardingEnabled: boolean;
  initialCampaigns: Campaign[];
  initialPayoutFeed: PayoutFeedData;
}) {
  return (
    <div className="relative isolate overflow-hidden">
      <SiteHeader />
      <main className="pt-16">
        <NetworkStatusTicker />
        <HeroSection workerOnboardingEnabled={workerOnboardingEnabled} />
        <NetworkPulse initialCampaigns={initialCampaigns} initialPayoutFeed={initialPayoutFeed} />
        <WhyWeBuiltThis />
        <CampaignsSection initialCampaigns={initialCampaigns} />
        <HowItWorks />
        <WorkTypes />
        <ProofFlow />
        <LeaderboardSection />
        <RecentPayouts initialData={initialPayoutFeed} />
        <WhyPow />
        <RoadmapSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
