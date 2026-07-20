"use client";

import { motion } from "framer-motion";
import { protocolFeeRouting } from "@/lib/fee-routing";

const routes = [protocolFeeRouting.holders, protocolFeeRouting.verifiedCampaigns];

export function FeeRoutingModule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.4 }}
      className="mt-7 max-w-2xl overflow-hidden rounded-lg border border-[#4f9be5]/20 bg-[#07111d]/70 shadow-[0_18px_55px_rgba(0,0,0,0.2)] backdrop-blur-xl"
    >
      <p className="border-b border-white/[0.08] px-4 py-3 text-[0.65rem] font-black uppercase text-[#83bdf5] sm:px-5">
        Protocol fee routing
      </p>
      <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
        {routes.map((route) => (
          <div key={route.label} className="px-4 py-4 sm:px-5">
            <p className="text-2xl font-black text-white sm:text-3xl">{route.percent}%</p>
            <p className="mt-1 text-[0.65rem] font-black uppercase leading-4 text-white/45">
              {route.label}
            </p>
            <p className="mt-2 text-[0.7rem] leading-5 text-white/35">{route.description}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.08] px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold leading-5 text-white/55">
          Every protocol fee strengthens the people holding the network and the campaigns putting it to work.
        </p>
        <p className="mt-2 text-[0.7rem] leading-5 text-white/35">
          Eligible holder: {protocolFeeRouting.eligibleHolder.definition}
        </p>
      </div>
    </motion.div>
  );
}
