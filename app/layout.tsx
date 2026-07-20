import type { Metadata } from "next";
import { PowWalletProvider } from "@/components/worker-onboarding/wallet-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "WORK | I work for this coin", template: "%s | WORK" },
  description: "The work network for crypto. Join campaigns, prove your contribution, build reputation, and earn $POW.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://proofofworksol.fun"),
  icons: { icon: "/icon.svg", apple: "/apple-icon.svg" },
  openGraph: {
    title: "WORK | I work for this coin",
    description: "Post your work. Build a public reputation. Get paid when your contribution moves a coin forward.",
    type: "website",
    images: [{ url: "/images/work-social.svg", width: 1200, height: 630, alt: "WORK - I work for this coin" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "WORK | I work for this coin",
    description: "The work network for crypto.",
    images: ["/images/work-social.svg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = process.env.WORKER_ONBOARD_ENABLED === "true" ? <PowWalletProvider>{children}</PowWalletProvider> : children;
  return <html lang="en"><body>{content}</body></html>;
}
