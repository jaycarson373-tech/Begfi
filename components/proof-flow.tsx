"use client";

import { motion } from "framer-motion";

const stages = [
  { label: "Social", detail: "Posts and engagement" },
  { label: "On-chain", detail: "Holdings, buys, volume, selling" },
  { label: "Campaign Score", detail: "Ranked separately in every campaign" },
  { label: "SOL", detail: "Strongest workers earn" }
];

export function ProofFlow() {
  return (
    <section className="section-space relative overflow-hidden border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,94,255,0.17),transparent_52%)]" />
      <div className="site-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="section-kicker">Campaign scoring</p>
          <h2 className="section-title mt-5">Every signal counts.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
            Social contribution, post performance, engagement, holdings, buys, volume, and selling behavior combine into a campaign-specific score.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-16 max-w-3xl py-5 sm:mt-24">
          <motion.svg
            className="absolute left-1/2 top-0 h-full w-20 -translate-x-1/2 overflow-visible"
            viewBox="0 0 80 880"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="pow-flow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1E5EFF" stopOpacity="0" />
                <stop offset="0.18" stopColor="#3B82F6" />
                <stop offset="0.82" stopColor="#8DB3FF" />
                <stop offset="1" stopColor="#1E5EFF" stopOpacity="0" />
              </linearGradient>
              <filter id="pow-glow" x="-200%" y="-20%" width="500%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M40 0 V880"
              stroke="url(#pow-flow)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
            <motion.circle
              cx="40"
              r="5"
              fill="#ffffff"
              filter="url(#pow-glow)"
              animate={{ cy: [20, 860], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
            />
          </motion.svg>

          <div className="relative grid gap-24 sm:gap-28">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className={`grid grid-cols-[1fr_52px_1fr] items-center gap-3 ${index % 2 ? "text-left" : "text-right"}`}
              >
                <div className={index % 2 ? "order-3" : "order-1"}>
                  <p className="text-sm font-semibold text-[#8db3ff]">{stage.detail}</p>
                  <h3 className="mt-2 text-3xl font-black text-white sm:text-5xl">{stage.label}</h3>
                </div>
                <div className="order-2 mx-auto h-4 w-4 rounded-full border-4 border-[#05070c] bg-white shadow-[0_0_28px_rgba(59,130,246,1)]" />
                <div className={index % 2 ? "order-1" : "order-3"} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
