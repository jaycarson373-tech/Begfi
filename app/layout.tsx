import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofOfBagwork.fun | Proof of Work",
  description:
    "ProofOfBagwork.fun turns CT bagwork into a Proof of Work loop with $ANSEM rewards for eligible $BEG holders.",
  metadataBase: new URL("https://proofofbagwork.fun"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "ProofOfBagwork.fun | Proof of Work",
    description:
      "Hold $BEG, do the bagwork, prove it publicly, and stay eligible for $ANSEM rewards."
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
