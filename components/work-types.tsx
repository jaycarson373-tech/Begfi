"use client";

import { motion } from "framer-motion";
import { Film, MessageCircleMore, MessagesSquare, PenLine, PictureInPicture2 } from "lucide-react";

const workTypes = [
  { title: "Posts", body: "Clear campaign posts that create attention and conversation.", icon: PenLine },
  { title: "Replies", body: "Useful replies and coordinated participation that move a narrative.", icon: MessageCircleMore },
  { title: "Memes", body: "Original visual work people actually want to share.", icon: PictureInPicture2 },
  { title: "Threads", body: "Research, explainers, and long-form campaign storytelling.", icon: MessagesSquare },
  { title: "Video", body: "Clips, edits, motion, and original campaign media.", icon: Film }
];

export function WorkTypes() {
  return (
    <section className="section-space border-b border-[#d8dee4] bg-white" aria-labelledby="work-types-title">
      <div className="site-shell">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="section-kicker">What counts as work</p>
            <h2 id="work-types-title" className="section-title mt-3">Make something people notice.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#62676d] lg:justify-self-end">Use a campaign&apos;s required coin tag or keyword. WORK connects eligible public contributions to that campaign&apos;s separate leaderboard and score.</p>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {workTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.article key={type.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="network-card min-h-[190px] p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e7f3ff] text-[#0a66c2]"><Icon className="h-4 w-4" /></span>
                <h3 className="mt-8 text-lg font-extrabold text-[#1f2328]">{type.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#62676d]">{type.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
