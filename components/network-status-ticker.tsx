"use client";

import { motion } from "framer-motion";

const statusItems = [
  "WORK NETWORK LIVE",
  "FUNDED CAMPAIGNS ONLY",
  "PUBLIC WORK. PRIVATE WALLETS.",
  "CONFIRMED PAYOUT RECEIPTS",
  "EVERY CAMPAIGN HAS ITS OWN SCORE"
];

export function NetworkStatusTicker() {
  const items = [...statusItems, ...statusItems];

  return (
    <div className="network-status-rail border-b border-[#07529a] bg-[#0a66c2] text-white" aria-label="WORK network status">
      <div className="overflow-hidden">
        <motion.div
          className="flex w-max items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, ease: "linear", repeat: Infinity }}
        >
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-3 px-5 py-2 text-[0.68rem] font-extrabold uppercase sm:px-7">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7fd3a8] shadow-[0_0_10px_rgba(127,211,168,0.95)]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
