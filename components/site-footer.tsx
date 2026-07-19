import { MessageCircle, Send, Twitter } from "lucide-react";
import { Logo } from "@/components/logo";

const links = [
  {
    label: "X",
    href: "https://x.com",
    icon: Twitter
  },
  {
    label: "Telegram",
    href: "https://telegram.org",
    icon: Send
  },
  {
    label: "Pump.fun",
    href: "https://pump.fun",
    icon: MessageCircle
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="section-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.45]">
            ProofOfBagwork.fun is not affiliated with Ansem. It just turns CT
            bagwork into public Proof of Work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.055] px-3 py-2 text-sm font-bold text-white/70 transition hover:border-beg-purple/[0.55] hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
