import type { Metadata } from "next";
import { MarketplaceApp } from "@/components/marketplace/marketplace-app";

export const metadata: Metadata = {
  title: "Marketplace Preview | POW · PROOF OF WORK",
  description: "Explore the pre-beta POW marketplace for verified crypto contributors and projects."
};

export default function MarketplacePage() {
  return <MarketplaceApp />;
}
