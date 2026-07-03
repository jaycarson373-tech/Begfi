"use client";

import Script from "next/script";
import { motion } from "framer-motion";
import { BadgeCheck, Hash, Radio, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const feedLanes = [
  {
    title: "Public $BegFi Feed",
    body:
      "Posts using $BegFi will flow here after launch. Pure CT noise, filtered into one clean lane.",
    icon: Hash
  },
  {
    title: "Official Beggar Feed",
    body:
      "Official entries use the stricter format and only appear after eligibility checks.",
    icon: BadgeCheck
  }
];

export function LiveFeedSection() {
  return (
    <section id="feed" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="The meta is already live"
          title="The meta is already live."
          description="CT is already begging. BegFi turns it into a system."
          icon={<Radio className="h-3.5 w-3.5 text-beg-lime" aria-hidden="true" />}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="glass-surface overflow-hidden rounded-lg p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/[0.45]">
                  Social proof
                </p>
                <p className="mt-2 text-sm leading-6 text-white/[0.62]">
                  No partnership implied. Just the beg meta doing beg-meta
                  things.
                </p>
              </div>
              <a
                href="https://x.com/slingoorio/status/2072842134823039454?s=46"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm font-bold text-white/70 transition hover:border-beg-purple/[0.55] hover:text-white"
              >
                Open X
              </a>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <blockquote className="twitter-tweet" data-theme="dark">
                <p lang="en" dir="ltr">
                  CT is already begging. BegFi turns it into a system.
                </p>
                <a href="https://x.com/slingoorio/status/2072842134823039454?s=46">
                  View the BegFi meta on X
                </a>
              </blockquote>
              <Script
                src="https://platform.twitter.com/widgets.js"
                strategy="lazyOnload"
              />
            </div>
          </motion.article>

          <div className="grid gap-4">
            {feedLanes.map((lane, index) => {
              const Icon = lane.icon;

              return (
                <motion.article
                  key={lane.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="glass-subtle rounded-lg p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/[0.12] bg-white/[0.07]">
                      <Icon className="h-5 w-5 text-beg-lime" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {lane.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/[0.62]">
                        {lane.body}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-lg border border-dashed border-white/[0.16] bg-white/[0.025] p-4 text-sm leading-7 text-white/[0.58]">
                    Feed opens after launch. No fake posts. No phantom volume.
                  </div>
                </motion.article>
              );
            })}

            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="glass-surface rounded-lg p-5"
            >
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/[0.45]">
                <Wallet className="h-4 w-4 text-beg-lime" aria-hidden="true" />
                Official format
              </div>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/[0.78]">
{`$BegFi #OfficialBeggar

Wallet:
Begging for:
Why:`}
              </pre>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}
