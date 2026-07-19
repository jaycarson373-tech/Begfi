import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | Proof of Work",
  description:
    "Launch contributor campaigns funded in SOL or SPL tokens. Proof of Work ranks performance and rewards eligible workers in $POW.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pow.fun"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "POW | Proof of Work",
    description:
      "Reward the people growing your project with campaign-specific Proof of Work.",
    type: "website",
    images: [
      {
        url: "/og-campaigns.png",
        width: 1732,
        height: 908,
        alt: "Proof of Work campaign platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "POW | Proof of Work",
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
