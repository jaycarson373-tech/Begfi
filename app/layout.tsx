import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | PROOF OF WORK",
  description:
    "Launch contributor campaigns funded in SOL or SPL tokens. PROOF OF WORK ranks performance and rewards eligible workers in $POW.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pow.fun"),
  icons: {
    icon: "/images/pow-network-mark.svg",
    apple: "/images/pow-network-mark.svg"
  },
  openGraph: {
    title: "POW | PROOF OF WORK",
    description:
      "Reward the people growing your project with campaign-specific PROOF OF WORK.",
    type: "website",
    images: [
      {
        url: "/og-campaigns.png",
        width: 1732,
        height: 908,
        alt: "POW campaign platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "POW | PROOF OF WORK",
    description: "Reward the people growing your project.",
    images: ["/og-campaigns.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
