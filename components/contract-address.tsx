"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { powContractAddress, powXHandle, powXUrl } from "@/lib/pow-config";

export function ContractAddress({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyAddress() {
    await navigator.clipboard.writeText(powContractAddress);
    setCopied(true);
  }

  return (
    <div className={`flex min-w-0 flex-col gap-3 rounded-lg border border-[#1f75ff]/20 bg-[#075dff]/[0.07] p-3 sm:flex-row sm:items-center ${className}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="shrink-0 text-[0.65rem] font-black uppercase text-[#69a2ff]">CA</span>
        <a
          href={`https://solscan.io/token/${powContractAddress}`}
          target="_blank"
          rel="noreferrer"
          className="group flex min-w-0 items-center gap-2 font-mono text-xs font-bold text-white/65 transition hover:text-white"
          title={powContractAddress}
        >
          <span className="truncate">{powContractAddress}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/30 transition group-hover:text-[#69a2ff]" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={copyAddress}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 text-white/45 transition hover:border-[#1f75ff]/40 hover:text-white"
          aria-label={copied ? "Contract address copied" : "Copy contract address"}
          title={copied ? "Copied" : "Copy contract address"}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#69a2ff]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <a
        href={powXUrl}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 text-xs font-extrabold text-[#b6d2ff] transition hover:text-white"
      >
        @{powXHandle}
      </a>
    </div>
  );
}
