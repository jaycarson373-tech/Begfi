import { ArrowUpRight } from "lucide-react";
import { FooterBrandBanner } from "@/components/footer-brand-banner";
import { Logo } from "@/components/logo";
import { powCommunityUrl, powDefaultBuyUrl, powXUrl } from "@/lib/pow-config";

const links = [
  { label: "Campaigns", href: "/#campaigns" }, { label: "Leaderboard", href: "/#leaderboard" }, { label: "Post a campaign", href: "/campaigns/create" }, { label: "Jobs preview", href: "/marketplace" }, { label: "X Community", href: powCommunityUrl }, { label: "X", href: powXUrl }, { label: "Buy $POW", href: process.env.NEXT_PUBLIC_BUY_URL || powDefaultBuyUrl }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d8dee4] bg-white pt-10">
      <div className="site-shell">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"><Logo href="/" /><nav className="flex max-w-2xl flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">{links.map((link) => <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="inline-flex items-center gap-1 text-sm font-semibold text-[#62676d] hover:text-[#0a66c2]">{link.label}<ArrowUpRight className="h-3.5 w-3.5" /></a>)}</nav></div>
        <div className="mt-9 flex flex-col gap-3 border-t border-[#e3e7eb] py-6 text-xs leading-5 text-[#747a80] sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} WORK.</p><p className="max-w-2xl sm:text-right">External projects fund their own campaigns. Worker rewards are paid in $POW from pre-funded allocations. Digital assets involve risk; eligibility and rewards are subject to verification.</p></div>
      </div>
      <FooterBrandBanner />
    </footer>
  );
}
