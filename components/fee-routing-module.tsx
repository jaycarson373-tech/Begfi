"use client";

import { protocolFeeRouting } from "@/lib/fee-routing";

const routes = [protocolFeeRouting.holders, protocolFeeRouting.verifiedCampaigns];

export function FeeRoutingModule() {
  return (
    <div className="network-card p-4 sm:p-5">
      <p className="text-xs font-extrabold uppercase text-[#62676d]">Protocol fee routing</p>
      <div className="mt-3 grid grid-cols-2 divide-x divide-[#e3e7eb] border-y border-[#e3e7eb] py-3">
        {routes.map((route) => (
          <div key={route.label} className="px-3 first:pl-0 last:pr-0">
            <p className="text-2xl font-extrabold text-[#0a66c2]">{route.percent}%</p>
            <p className="mt-1 text-[0.63rem] font-bold uppercase leading-4 text-[#34383c]">{route.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-[#62676d]">Fees reward eligible holders and approved campaigns. No fake countdowns or estimates.</p>
    </div>
  );
}
