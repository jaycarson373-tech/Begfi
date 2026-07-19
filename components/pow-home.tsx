"use client";

import { FaqSection } from "@/components/faq-section";
import { FutureSection } from "@/components/future-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { LeaderboardSection } from "@/components/leaderboard-section";
import { ProofFlow } from "@/components/proof-flow";
import { RoadmapSection } from "@/components/roadmap-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhyPow } from "@/components/why-pow";

export function PowHome() {
  return (
    <div className="relative isolate overflow-hidden">
      <SiteHeader />
      <main>
        <HeroSection />
        <HowItWorks />
        <ProofFlow />
        <LeaderboardSection />
        <WhyPow />
        <FutureSection />
        <RoadmapSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
