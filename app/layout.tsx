import type { Metadata } from "next";
import { PowWalletProvider } from "@/components/worker-onboarding/wallet-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | PROOF OF WORK",
  description:
    "Launch contributor campaigns funded in SOL or SPL tokens. PROOF OF WORK ranks performance and rewards eligible workers in $POW.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pow.fun"),
  icons: {
    icon: "/images/pow-logo.jpg",
    apple: "/images/pow-logo.jpg"
  },
  openGraph: {
    title: "POW | PROOF OF WORK",
    description:
      "Reward the people growing your project with campaign-specific PROOF OF WORK.",
    type: "website",
    images: [
      {
        url: "/images/pow-footer-banner.jpg",
        width: 1280,
        height: 437,
        alt: "Proof of Work"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "POW | PROOF OF WORK",
    description: "Reward the people growing your project.",
    images: ["/images/pow-footer-banner.jpg"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = process.env.WORKER_ONBOARD_ENABLED === "true" ? (
    <PowWalletProvider>{children}</PowWalletProvider>
  ) : (
    children
  );

  return (
    <html lang="en" className="dark">
      <body>{content}</body>
    </html>
  );
}
