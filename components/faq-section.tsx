"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const questions = [
  {
    question: "What is a Proof of Work campaign?",
    answer: "A project-defined competition where verified workers contribute, receive a campaign-specific score, and earn SOL from that campaign's reward pool."
  },
  {
    question: "Who funds the native $POW campaign?",
    answer: "The native Proof of Work Campaign is funded automatically from $POW protocol fees. It remains the default campaign on the platform."
  },
  {
    question: "Who funds external campaigns?",
    answer: "The project launching the campaign deposits its own SOL reward pool upfront. Proof of Work does not fund external project campaigns."
  },
  {
    question: "Can I join more than one campaign?",
    answer: "Yes. A verified worker can participate in multiple campaigns, but each campaign calculates its score and leaderboard independently."
  },
  {
    question: "What affects campaign score?",
    answer: "Social contribution, post performance, engagement, on-chain activity, holdings, buys, volume, selling behavior, and overall campaign impact can all contribute."
  },
  {
    question: "How are rewards distributed?",
    answer: "Each campaign defines its winner count and reward rules. At payout, eligible workers receive SOL from that campaign's funded reward pool according to the final leaderboard."
  },
  {
    question: "Can people game the leaderboard?",
    answer: "Fake engagement, bought views, spam, copied posts, wallet cycling, and coordinated manipulation can be excluded from campaign scores and rewards."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="section-space">
      <div className="site-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}>
          <p className="section-kicker">FAQ</p>
          <h2 className="section-title mt-5">Campaigns, answered.</h2>
        </motion.div>
        <div className="border-t border-white/[0.09]">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="border-b border-white/[0.09]">
                <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className="flex w-full items-center justify-between gap-5 py-6 text-left sm:py-7" aria-expanded={isOpen}>
                  <span className="text-lg font-extrabold text-white sm:text-xl">{item.question}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60"><motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.22 }}><Plus className="h-4 w-4" aria-hidden="true" /></motion.span></span>
                </button>
                <AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden"><p className="max-w-2xl pb-7 text-base leading-8 text-white/50 sm:text-lg">{item.answer}</p></motion.div>}</AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
