import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | Proof of Work",
  description:
    "AI took your job. Come work for this coin. POW links X accounts to wallets and turns $POW profile work into SOL payroll.",
  metadataBase: new URL("https://pow.fun"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "POW | Proof of Work",
    description:
      "Post. Shill. Get paid. Verified $POW profile work sends creator fees to top POW workers."
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
