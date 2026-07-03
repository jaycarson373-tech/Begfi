"use client";

import { DashboardSection } from "@/components/dashboard-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function BegFiHome() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardSection />
        <HowItWorks />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
