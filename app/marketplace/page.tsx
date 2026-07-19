import type { Metadata } from "next";
import { MarketplaceApp } from "@/components/marketplace/marketplace-app";

export const metadata: Metadata = {
  title: "Marketplace Preview | Proof of Work",
  description: "Explore the pre-beta Proof of Work marketplace for verified crypto contributors and projects."
};

export default function MarketplacePage() {
  return <MarketplaceApp />;
}
