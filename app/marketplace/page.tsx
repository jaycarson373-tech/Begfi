import type { Metadata } from "next";
import { MarketplaceApp } from "@/components/marketplace/marketplace-app";

export const metadata: Metadata = {
  title: "Jobs Preview",
  description: "Preview the WORK marketplace for verified crypto contributors and projects."
};

export default function MarketplacePage() {
  return <MarketplaceApp />;
}
