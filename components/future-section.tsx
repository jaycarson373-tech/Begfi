"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Orbit,
  Pickaxe,
  UserRound
} from "lucide-react";

const journey = [
  { label: "Worker", icon: UserRound },
  { label: "Proof of Work", icon: Pickaxe },
  { label: "Verified Reputation", icon: BadgeCheck },
  { label: "Marketplace", icon: Orbit },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Revenue", icon: Banknote }
];

export function FutureSection() {
  return (
    <section className="section-space relative overflow-hidden">
      <div className="absolute inset-x-0 top-1/3 h-96 bg-[radial-gradient(circle_at_50%_50%,rgba(30,94,255,0.14),transparent_58%)]" />
      <div className="site-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="section-kicker">The Future of Proof of Work</p>
          <h2 className="section-title mx-auto mt-5">Reputation becomes opportunity.</h2>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/50 sm:text-xl sm:leading-9">
            Proof of Work is more than a rewards protocol. We&apos;re building the reputation and hiring infrastructure for crypto.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/50 sm:text-xl sm:leading-9">
            Today, users earn rewards for contributing. Tomorrow, projects hire directly through Proof of Work, powered by on-chain reputation instead of resumes.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-16 grid max-w-4xl gap-3 sm:mt-20 sm:grid-cols-2 lg:max-w-none lg:grid-cols-[repeat(11,minmax(0,1fr))] lg:items-center lg:gap-2">
          {journey.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="contents">
                <motion.article
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="premium-card flex min-h-36 flex-col items-center justify-center p-5 text-center lg:col-span-1 lg:min-h-44"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-[#4f8cff]/25 bg-[#1e5eff]/10 text-[#8db3ff] shadow-[0_0_30px_rgba(30,94,255,0.14)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-sm font-extrabold leading-5 text-white">{item.label}</h3>
                </motion.article>
                {index < journey.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.12 + index * 0.07 }}
                    className="hidden items-center justify-center lg:flex"
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-gradient-to-r from-[#1e5eff]/15 via-[#6b9cff] to-[#1e5eff]/15 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center lg:hidden" aria-hidden="true">
          <ArrowDown className="h-5 w-5 text-[#6b9cff]" />
        </div>
      </div>
    </section>
  );
}
