"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const originalPostUrl = "https://x.com/blknoiz06/status/2071586866860585432";

export function WhyWeBuiltThis() {
  return (
    <section className="relative border-b border-white/[0.06] py-20 sm:py-24">
      <div className="site-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <p className="section-kicker">Why we built this</p>
          <h2 className="mt-5 text-4xl font-black leading-[1.02] text-white sm:text-5xl">
            Ansem asked for it.
            <br />
            We built it.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
            <p>
              Ansem asked if there was a tool that could airdrop people behind the most viral posts for a specific coin.
            </p>
            <p className="font-bold text-white">Proof of Work is that tool.</p>
            <p>
              Projects fund campaigns. Workers create real attention. POW measures the contribution, ranks the workers, and rewards the people producing the strongest results.
            </p>
          </div>
          <p className="mt-5 text-xs leading-5 text-white/30">
            Inspired by a public question. Proof of Work is not affiliated with or endorsed by Ansem.
          </p>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="rounded-lg border border-[#4f9be5]/25 bg-[#07111d]/80 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-black text-white" aria-hidden="true">
              X
            </span>
            <p className="text-sm font-extrabold text-white">@blknoiz06</p>
          </div>
          <blockquote className="mt-6 text-lg font-bold leading-8 text-white sm:text-xl sm:leading-9">
            &ldquo;is there a tool that i can use to airdrop to ppl with the most viral social media posts on a specific coin tag?&rdquo;
          </blockquote>
          <a
            href={originalPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[#83bdf5] transition hover:text-white"
          >
            VIEW THE ORIGINAL POST
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.article>
      </div>
    </section>
  );
}
