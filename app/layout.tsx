import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | Proof of Work",
  description:
    "POW links X accounts to wallets and turns verified $POW attention into a SOL creator-fee flywheel.",
  metadataBase: new URL("https://pow.fun"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "POW | Proof of Work",
    description:
      "Verified $POW profile work, wallet activity, trust scores, and SOL creator-fee payroll."
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
