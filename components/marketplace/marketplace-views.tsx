"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Clock3,
  LockKeyhole,
  Search,
} from "lucide-react";
import { jobs, projects, workers } from "@/components/marketplace/marketplace-data";
import { PreviewBadge, ScoreBadge, ViewHeading } from "@/components/marketplace/marketplace-ui";

export function WorkersView() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return workers;
    return workers.filter((worker) => [worker.name, worker.x, ...worker.skills].join(" ").toLowerCase().includes(value));
  }, [query]);

  return (
    <div className="grid gap-8">
      <ViewHeading
        eyebrow="Talent · Preview"
        title="Verified Workers"
        description="Discover contributors through demonstrated work, on-chain history, and reputation instead of resumes."
        action={
          <label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-white/60 xl:w-72">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Search workers</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills or people" className="w-full bg-transparent outline-none placeholder:text-white/25" />
          </label>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((worker, index) => (
          <motion.article
            key={worker.wallet}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="market-panel p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#5f95ff]/25 bg-gradient-to-br from-[#1e5eff]/30 to-white/[0.04] text-sm font-black text-white">
                {worker.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-white">{worker.name}</h2>
                  <PreviewBadge>Preview Verified</PreviewBadge>
                </div>
                <p className="mt-1 text-sm text-white/40">{worker.x} · {worker.wallet}</p>
              </div>
              <ScoreBadge score={worker.score} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {worker.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/50">{skill}</span>)}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/[0.07] py-4 text-sm">
              <div><p className="text-xs text-white/30">Availability</p><p className="mt-1 font-bold text-white/70">{worker.availability}</p></div>
              <div><p className="text-xs text-white/30">Rate</p><p className="mt-1 font-bold text-white/70">{worker.rate}</p></div>
              <div><p className="text-xs text-white/30">Completed</p><p className="mt-1 font-bold text-white/70">{worker.completed} projects</p></div>
            </div>
            <div className="mt-5 flex items-start gap-2 text-sm leading-6 text-white/40">
              <Clock3 className="mt-1 h-4 w-4 shrink-0 text-[#7fa8ff]" aria-hidden="true" />
              {worker.activity}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function ProjectsView() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <div className="grid gap-8">
      <ViewHeading eyebrow="Organizations · Preview" title="Verified Projects" description="High-signal teams looking for contributors with a public history of doing the work." action={<PreviewBadge>Pre-Beta</PreviewBadge>} />
      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project, index) => (
          <motion.article key={project.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4 }} className="market-panel p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-lg font-black text-[#05070c]">{project.mark}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-white">{project.name}</h2>
                  <PreviewBadge>Preview Verified</PreviewBadge>
                </div>
                <p className="mt-1 text-sm text-white/[0.35]">{project.stage}</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-white/50">{project.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/[0.07] py-4">
              <div><p className="text-xs text-white/30">Open roles</p><p className="mt-1 text-lg font-black text-white">{project.roles}</p></div>
              <div><p className="text-xs text-white/30">Hiring budget</p><p className="mt-1 text-lg font-black text-white">{project.budget}</p></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {project.stack.map((skill) => <span key={skill} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/[0.45]">{skill}</span>)}
              <button type="button" onClick={() => setSelectedProject(selectedProject === project.name ? null : project.name)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-extrabold text-white/70 transition hover:text-white">{selectedProject === project.name ? "Close Preview" : "View Project"} <ArrowUpRight className="h-4 w-4" /></button>
            </div>
            {selectedProject === project.name && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 overflow-hidden rounded-lg border border-[#5f95ff]/20 bg-[#1e5eff]/10 p-4 text-sm leading-6 text-white/[0.55]">
                Project profiles, verified team history, and direct hiring actions will open during Marketplace Beta.
              </motion.div>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function JobsView() {
  const [filter, setFilter] = useState("All");
  const [appliedJob, setAppliedJob] = useState<string | null>(null);
  const filtered = filter === "All" ? jobs : jobs.filter((job) => job.type === filter);
  return (
    <div className="grid gap-8">
      <ViewHeading eyebrow="Opportunities · Preview" title="Work worth doing" description="Verified opportunities from crypto teams that care about proof, not pedigree." action={<div className="flex gap-2">{["All", "Full time", "Contract"].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${filter === item ? "border-[#5f95ff]/40 bg-[#1e5eff]/[0.15] text-white" : "border-white/10 text-white/40 hover:text-white"}`}>{item}</button>)}</div>} />
      <div className="grid gap-3">
        {filtered.map((job, index) => (
          <motion.article key={`${job.title}-${job.project}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }} className="market-panel grid gap-5 p-5 transition hover:border-[#5f95ff]/30 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-white">{job.title}</h2><PreviewBadge>Preview</PreviewBadge></div>
              <p className="mt-2 text-sm font-semibold text-white/50">{job.project} · Remote · {job.type}</p>
              <div className="mt-4 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-white/40">{skill}</span>)}</div>
            </div>
            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <div className="sm:text-right"><p className="text-xs text-white/30">Reward</p><p className="mt-1 font-black text-[#9fbdff]">{job.reward}</p></div>
              <button type="button" onClick={() => setAppliedJob(`${job.title}-${job.project}`)} className="rounded-lg bg-white px-4 py-2.5 text-sm font-black text-[#05070c] transition hover:bg-[#dce8ff]">{appliedJob === `${job.title}-${job.project}` ? "Preview Saved" : "Apply"}</button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

const enterpriseFeatures = ["Verified Talent Search", "Candidate Pipeline", "Recruiting Dashboard", "Advanced Filters", "Analytics", "Organization Profiles", "API Access", "Private Talent Pool"];

export function EnterpriseView() {
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }
  return (
    <div className="grid gap-10">
      <ViewHeading eyebrow="Enterprise · Early Access" title="Enterprise Hiring" description="For protocols, startups, DAOs, and funds building high-output crypto teams." action={<PreviewBadge>Coming Soon</PreviewBadge>} />
      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="market-panel p-7 sm:p-8">
          <PreviewBadge>Early Access</PreviewBadge>
          <h2 className="mt-8 text-3xl font-black text-white">Professional Hiring Suite</h2>
          <p className="mt-4 text-base leading-7 text-white/[0.45]">One place to discover, compare, and hire contributors with verified PROOF OF WORK.</p>
          <div className="mt-8 border-t border-white/[0.08] pt-8"><span className="text-5xl font-black text-white">Coming Soon</span><p className="mt-2 text-sm text-white/[0.35]">Subscription pricing in development</p></div>
        </section>
        <section className="market-panel p-7 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {enterpriseFeatures.map((feature) => <div key={feature} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-4 text-sm font-semibold text-white/[0.65]"><Check className="h-4 w-4 text-[#7fa8ff]" aria-hidden="true" />{feature}<span className="ml-auto text-[0.6rem] font-black uppercase text-white/25">Soon</span></div>)}
          </div>
        </section>
      </div>
      <section id="early-access" className="market-panel p-7 sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div><p className="text-xs font-extrabold uppercase text-[#7fa8ff]">Waitlist Preview</p><h2 className="mt-3 text-3xl font-black text-white">Build the next crypto team here.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.45]">Early access registration will open before the marketplace beta launches.</p></div>
          {submitted ? <div className="rounded-lg border border-[#5f95ff]/25 bg-[#1e5eff]/10 p-4 text-sm font-bold text-[#b4ccff]">Preview confirmed. Real waitlist registration is coming soon.</div> : <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="market-email">Work email</label><input id="market-email" type="email" required placeholder="Work email" className="min-h-12 flex-1 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#5f95ff]/[0.45]" /><button type="submit" className="button-primary">Join Early Access</button></form>}
        </div>
      </section>
    </div>
  );
}

export function AnalyticsView() {
  return <div className="grid gap-8"><ViewHeading eyebrow="Analytics · Preview" title="See where great work happens" description="A future view of hiring demand, talent supply, and reputation across the network." action={<PreviewBadge>Coming Soon</PreviewBadge>} /><div className="grid gap-4 lg:grid-cols-3">{[["Verified matches", "2,481", 78], ["Median time to hire", "3.8 days", 62], ["Repeat project rate", "71%", 71]].map(([label, value, width], index) => <motion.article key={String(label)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="market-panel p-6"><PreviewBadge>Demo</PreviewBadge><p className="mt-8 text-3xl font-black text-white">{value}</p><p className="mt-2 text-sm text-white/40">{label}</p><div className="mt-8 h-1.5 rounded-full bg-white/[0.06]"><motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} className="h-full rounded-full bg-[#4f8cff]" /></div></motion.article>)}</div><div className="market-panel grid min-h-80 place-items-center p-8 text-center"><div><BarChart3 className="mx-auto h-9 w-9 text-[#7fa8ff]" /><h2 className="mt-5 text-2xl font-black text-white">Network analytics preview</h2><p className="mt-3 text-white/40">Advanced reports and exports arrive with Enterprise.</p></div></div></div>;
}

export function SettingsView() {
  return <div className="grid gap-8"><ViewHeading eyebrow="Settings · Preview" title="Marketplace preferences" description="Account, organization, and notification controls will be available during beta." action={<PreviewBadge>Coming Soon</PreviewBadge>} /><div className="market-panel divide-y divide-white/[0.07]">{[["Profile visibility", "Choose how projects discover your work"], ["Opportunity alerts", "Get notified about high-fit opportunities"], ["Organization access", "Manage teams and hiring permissions"], ["Private talent pools", "Curate invitation-only contributor lists"]].map(([title, body]) => <div key={title} className="flex items-center gap-4 p-6"><span className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04] text-white/[0.35]"><LockKeyhole className="h-4 w-4" /></span><div className="flex-1"><p className="font-bold text-white/70">{title}</p><p className="mt-1 text-sm text-white/[0.35]">{body}</p></div><span className="text-xs font-black uppercase text-white/20">Soon</span></div>)}</div></div>;
}
