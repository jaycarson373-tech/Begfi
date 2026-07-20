"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Lightbulb, MessageSquareQuote } from "lucide-react";

const originalPostUrl = "https://x.com/blknoiz06/status/2071586866860585432";

export function WhyWeBuiltThis() {
  return (
    <section className="border-b border-[#d8dee4] bg-white py-16 sm:py-20">
      <div className="site-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e7f3ff] text-[#0a66c2]"><Lightbulb className="h-5 w-5" /></span>
          <p className="section-kicker mt-5">Why WORK exists</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#1f2328] sm:text-4xl">A public question became a working product.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#62676d]">Ansem asked for a tool that could reward the people behind a coin&apos;s most viral posts. WORK connects that contribution to a profile, a rank, and a payout.</p>
          <p className="mt-4 text-xs leading-5 text-[#747a80]">Inspired by a public post. WORK is not affiliated with or endorsed by Ansem.</p>
        </motion.div>

        <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="network-card p-5 sm:p-7">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-black text-sm font-black text-white">X</span><div><p className="font-bold text-[#1f2328]">Ansem</p><p className="text-sm text-[#62676d]">@blknoiz06</p></div></div>
          <MessageSquareQuote className="mt-7 h-6 w-6 text-[#0a66c2]" />
          <blockquote className="mt-3 text-xl font-semibold leading-8 text-[#1f2328] sm:text-2xl sm:leading-9">&ldquo;is there a tool that i can use to airdrop to ppl with the most viral social media posts on a specific coin tag?&rdquo;</blockquote>
          <a href={originalPostUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0a66c2] hover:underline">View the original post<ArrowUpRight className="h-4 w-4" /></a>
        </motion.article>
      </div>
    </section>
  );
}
