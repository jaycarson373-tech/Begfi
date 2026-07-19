"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Coins, MessageCircleMore, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect X",
    body: "Link your wallet. Verify your X.",
    icon: BadgeCheck
  },
  {
    number: "02",
    title: "Post",
    body: "Create threads, memes, replies, and content.",
    icon: MessageCircleMore
  },
  {
    number: "03",
    title: "Earn Points",
    body: "Every eligible $POW post adds to your Proof of Work.",
    icon: Trophy
  },
  {
    number: "04",
    title: "Earn SOL",
    body: "Creator fees reward the people creating attention.",
    icon: Coins
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-space relative">
      <div className="site-shell">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="section-kicker">How it works</p>
          <h2 className="section-title mt-5">Post. Get seen. Get paid.</h2>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="premium-card group min-h-[280px] p-6 sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="text-5xl font-black text-white/[0.07] transition group-hover:text-[#1e5eff]/25">
                    {step.number}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[#76a2ff] transition group-hover:border-[#3b82f6]/40 group-hover:bg-[#1e5eff]/10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-16 text-2xl font-extrabold text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/50">{step.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
