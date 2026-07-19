import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POW | Proof of Work",
  description:
    "AI took your job. Come work for this coin. POW uses AI-scored outreach to turn creator fees into SOL payroll for top workers.",
  metadataBase: new URL("https://pow.fun"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "POW | Proof of Work",
    description:
      "Post. Shill. Get paid. AI-scored outreach sends creator fees to top POW workers."
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
