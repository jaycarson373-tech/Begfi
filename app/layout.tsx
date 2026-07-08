import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Begwork | It's not bagworking",
  description:
    "Begwork turns CT's Ansem-era begging meta into $ANSEM rewards for eligible $BEG holders.",
  metadataBase: new URL("https://begwork.vercel.app"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "Begwork | It's not bagworking",
    description:
      "Hold $BEG, do the begwork, and stay eligible for $ANSEM rewards.",
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
