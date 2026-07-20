"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { powContractAddress, powXHandle, powXUrl } from "@/lib/pow-config";

export function ContractAddress({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!copied) return; const timer = window.setTimeout(() => setCopied(false), 1600); return () => window.clearTimeout(timer); }, [copied]);
  async function copyAddress() { await navigator.clipboard.writeText(powContractAddress); setCopied(true); }

  return (
    <div className={`network-card p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-extrabold uppercase text-[#62676d]">$POW contract</p><a href={powXUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#0a66c2]">@{powXHandle}</a></div>
      <div className="mt-3 flex min-w-0 items-center gap-2 rounded-md bg-[#edf3f8] p-2.5">
        <a href={`https://solscan.io/token/${powContractAddress}`} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-2 font-mono text-xs font-semibold text-[#34383c]" title={powContractAddress}><span className="truncate">{powContractAddress}</span><ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#62676d]" /></a>
        <button type="button" onClick={copyAddress} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#0a66c2] hover:bg-white" aria-label={copied ? "Contract address copied" : "Copy contract address"}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
      </div>
    </div>
  );
}
