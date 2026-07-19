import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | Proof of Work",
  description:
    "Get paid for posting on CT. Proof of Work rewards the people creating crypto attention.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pow.fun"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "POW | Proof of Work",
    description:
      "Get paid for posting on CT. Post, climb the leaderboard, and earn SOL.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Proof of Work — Get paid for posting on CT."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "POW | Proof of Work",
    description: "Get paid for posting on CT.",
    images: ["/og.png"]
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
