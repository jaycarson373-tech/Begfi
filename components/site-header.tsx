import { ArrowUpRight, BarChart3 } from "lucide-react";
import { Logo } from "@/components/logo";

const navItems = [
  { label: "Pool", href: "#features" },
  { label: "Feed", href: "#feed" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "FAQ", href: "#faq" }
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/[0.35] backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-5 text-sm font-semibold text-white/[0.62] md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-white focus:outline-none focus:ring-2 focus:ring-beg-purple/60"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#dashboard"
            className="hidden items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-white/[0.22] hover:bg-white/[0.1] sm:flex"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </a>
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-black transition hover:bg-beg-lime focus:outline-none focus:ring-2 focus:ring-beg-lime/70"
          >
            Buy
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
