import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";

const links = [
  { label: "Campaigns", href: "/#campaigns" },
  { label: "Launch Campaign", href: "/campaigns/create" },
  { label: "Marketplace Beta", href: "/marketplace" },
  { label: "X", href: "https://x.com/ProofofWork__" },
  { label: "Buy $POW", href: process.env.NEXT_PUBLIC_BUY_URL || "https://pump.fun" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] py-10 sm:py-12">
      <div className="site-shell">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <Logo href="/" />
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-xs leading-5 text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Proof of Work.</p>
          <p className="max-w-2xl sm:text-right">
            External projects fund campaigns in SOL or SPL tokens. Worker rewards are paid in $POW from pre-funded allocations. Digital assets involve risk; eligibility and rewards are subject to verification.
          </p>
        </div>
      </div>
    </footer>
  );
}
