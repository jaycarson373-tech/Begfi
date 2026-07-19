"use client";

import { motion } from "framer-motion";
import { Route } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const steps = [
  "Hold 1M+ $POW as the minimum worker requirement.",
  "Post your wallet with $POW and #POW application.",
  "The scanner verifies holdings and accepts qualified workers.",
  "Keep posting with the $POW cashtag while the AI scorer ranks real outreach.",
  "Creator fees are distributed as SOL to top workers on the leaderboard."
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="How it works"
          title="Apply, post, rank, get paid."
          icon={<Route className="h-3.5 w-3.5 text-beg-lime" aria-hidden="true" />}
        />
        <div className="mt-8 grid gap-3">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="glass-subtle grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg p-4"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-beg-purple/[0.35] bg-beg-purple/[0.12] text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="text-base font-semibold leading-7 text-white/[0.78]">
                {step}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
