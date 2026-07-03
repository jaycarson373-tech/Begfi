import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BegFi | Begging is the meta",
  description:
    "BegFi turns CT's airdrop begging meta into an hourly community payout system on Solana.",
  metadataBase: new URL("https://begfi.vercel.app"),
  openGraph: {
    title: "BegFi | Begging is the meta",
    description:
      "The first Beg-To-Earn protocol on Solana.",
    images: ["/images/begfi-hero.png"]
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
