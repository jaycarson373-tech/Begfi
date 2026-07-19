"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const applicationUrl = `https://x.com/intent/post?text=${encodeURIComponent("$POW #POW application\n\nWallet:")}`;

export function WhyPow() {
  return (
    <section id="why-pow" className="section-space relative overflow-hidden border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_50%,rgba(30,94,255,0.18),transparent_38%)]" />
      <div className="site-shell relative grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75 }}
        >
          <p className="section-kicker">Why POW exists</p>
          <h2 className="mt-6 max-w-5xl text-5xl font-black leading-[0.98] text-white sm:text-7xl lg:text-8xl">
            Crypto pays traders.
            <span className="mt-3 block text-gradient">Proof of Work pays builders.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="max-w-xl lg:pb-2"
        >
          <p className="text-xl leading-9 text-white/[0.55]">
            The people making the memes, threads, replies, and moments deserve more than likes.
          </p>
          <p className="mt-5 text-xl leading-9 text-white/[0.55]">
            POW turns that work into points, rank, and SOL.
          </p>
          <a href={applicationUrl} target="_blank" rel="noreferrer" className="button-primary mt-8 w-full sm:w-auto">
            Connect your X
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
