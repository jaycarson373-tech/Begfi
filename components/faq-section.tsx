"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { nativeCampaignFeeCopy, protocolFeeRouting } from "@/lib/fee-routing";
import { powMinimumHoldingLabel } from "@/lib/pow-config";

const questions = [
  { question: "How do I create a WORK profile?", answer: `Connect and sign with your wallet, link X, and hold at least ${powMinimumHoldingLabel}. The original #POWApplication community path remains available as a fallback.` },
  { question: "What does ‘I work for this coin’ mean?", answer: "It means you joined a campaign and are creating measurable public contribution for that coin. Your activity becomes a campaign score and a visible work history." },
  { question: "Who funds campaigns?", answer: "The native $POW campaign is funded by protocol fees. External projects must deposit their own SOL or SPL-token reward pool before their campaign can appear publicly." },
  { question: "Where do protocol fees go?", answer: `${protocolFeeRouting.holders.percent}% is distributed to eligible $POW holders. The remaining ${protocolFeeRouting.verifiedCampaigns.percent}% is added to reward pools for campaigns reviewed and verified by WORK.` },
  { question: "How is the native campaign funded?", answer: nativeCampaignFeeCopy },
  { question: "Can I work for more than one coin?", answer: "Yes. One verified profile can join multiple campaigns. Every campaign calculates its own score and leaderboard independently." },
  { question: "What affects my score?", answer: "Post performance, authentic engagement, on-chain activity, holdings, buys, volume, selling behavior, and overall campaign impact can contribute. Manipulated activity can be removed." },
  { question: "How are rewards paid?", answer: "Eligible workers are ranked under each campaign's rules. Confirmed $POW payouts are written to the public receipt feed with a Solscan link." }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="section-space bg-white">
      <div className="site-shell grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
        <div><p className="section-kicker">Help center</p><h2 className="section-title mt-3">How WORK works.</h2><p className="mt-4 text-base leading-7 text-[#62676d]">Straight answers about profiles, campaigns, scoring, and payouts.</p></div>
        <div className="network-card divide-y divide-[#e3e7eb]">
          {questions.map((item, index) => { const isOpen = openIndex === index; return (
            <div key={item.question}>
              <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6" aria-expanded={isOpen}><span className="font-bold text-[#1f2328] sm:text-lg">{item.question}</span><motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#62676d] hover:bg-[#edf3f8]"><Plus className="h-4 w-4" /></motion.span></button>
              <AnimatePresence initial={false}>{isOpen ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl px-5 pb-5 text-sm leading-7 text-[#62676d] sm:px-6">{item.answer}</p></motion.div> : null}</AnimatePresence>
            </div>
          ); })}
        </div>
      </div>
    </section>
  );
}
