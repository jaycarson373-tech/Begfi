"use client";

import { DashboardSection } from "@/components/dashboard-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { LiveFeedSection } from "@/components/live-feed-section";
import { RoadmapSection } from "@/components/roadmap-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PowHome() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LiveFeedSection />
        <DashboardSection />
        <HowItWorks />
        <RoadmapSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
