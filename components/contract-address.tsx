"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export const powContractAddress = "GmEBKiywqs7cwwphuhSzDuNBfXnHjRujbEq89qVpump";

export function ContractAddress() {
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    const input = document.createElement("textarea");
    input.value = powContractAddress;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const didCopy = document.execCommand("copy");
    input.remove();

    if (didCopy) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <div className="flex min-h-12 max-w-full items-center gap-3 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 backdrop-blur-xl sm:px-4">
      <span className="shrink-0 text-[0.65rem] font-black uppercase text-[#8db3ff]">CA</span>
      <span className="min-w-0 font-mono text-xs text-white/60 sm:text-sm">
        <span className="sm:hidden">{`${powContractAddress.slice(0, 8)}...${powContractAddress.slice(-8)}`}</span>
        <span className="hidden sm:inline">{powContractAddress}</span>
      </span>
      <button
        type="button"
        onClick={copyAddress}
        title={copied ? "Contract address copied" : "Copy contract address"}
        aria-label={copied ? "Contract address copied" : "Copy contract address"}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white/55 transition hover:border-[#5f95ff]/40 hover:text-white"
      >
        {copied ? <Check className="h-4 w-4 text-[#8db3ff]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
