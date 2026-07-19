"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const questions = [
  {
    question: "How do I join?",
    answer: "Hold at least 1M $POW, then post $POW, #POW application, and the wallet you want linked to your X account."
  },
  {
    question: "What counts as work?",
    answer: "Eligible public posts from your verified X account that use $POW. Threads, memes, replies, and original content can all count."
  },
  {
    question: "How do I earn points?",
    answer: "Create attention. Your eligible posts, their real engagement, your current $POW holdings, and how long you hold all contribute to your score."
  },
  {
    question: "How do I earn SOL?",
    answer: "Creator fees are distributed to qualifying workers based on leaderboard points. More verified work means a larger share."
  },
  {
    question: "When are rewards sent?",
    answer: "Rewards are sent in payroll rounds after creator fees are claimed and the eligible leaderboard is finalized."
  },
  {
    question: "Can people game the leaderboard?",
    answer: "Fake engagement, bought views, spam, copied posts, wallet cycling, and coordinated manipulation can be excluded from points and rewards."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-space">
      <div className="site-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-kicker">FAQ</p>
          <h2 className="section-title mt-5">Questions, answered.</h2>
        </motion.div>

        <div className="border-t border-white/[0.09]">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="border-b border-white/[0.09]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 py-6 text-left sm:py-7"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-extrabold text-white sm:text-xl">{item.question}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60">
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.22 }}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 text-base leading-8 text-white/50 sm:text-lg">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
