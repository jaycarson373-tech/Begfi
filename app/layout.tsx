import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BegFi | Beg Harder",
  description:
    "BegFi is a creator-fee protocol concept that redistributes hourly rewards to the best beggars and eligible holders.",
  metadataBase: new URL("https://begfi.vercel.app"),
  openGraph: {
    title: "BegFi | Beg Harder",
    description:
      "The first creator-fee protocol that rewards the best beggars.",
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
