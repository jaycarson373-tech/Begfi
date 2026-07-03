"use client";

import { motion } from "framer-motion";
import { Route } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const steps = [
  "Hold the minimum amount of $BEG.",
  "Submit your wallet and why you deserve an airdrop.",
  "Holders vote.",
  "Every hour one submission wins.",
  "Remaining creator fees are distributed to eligible holders."
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="How it works"
          title="Simple enough for CT. Structured enough for a real protocol."
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
