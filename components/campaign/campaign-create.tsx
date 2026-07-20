"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, CalendarDays, Coins, ImagePlus, Info, ShieldCheck } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type FormState = {
  projectName: string;
  ticker: string;
  xAccount: string;
  website: string;
  description: string;
  keyword: string;
  fundingAsset: "SOL" | "SPL token";
  fundingSymbol: string;
  fundingMint: string;
  reward: string;
  startDate: string;
  endDate: string;
  winners: string;
  eligibility: string;
  rewardSplit: string;
};

const initialState: FormState = {
  projectName: "",
  ticker: "",
  xAccount: "",
  website: "",
  description: "",
  keyword: "",
  fundingAsset: "SOL",
  fundingSymbol: "",
  fundingMint: "",
  reward: "",
  startDate: "",
  endDate: "",
  winners: "10",
  eligibility: "",
  rewardSplit: "Score-weighted"
};

function duration(start: string, end: string) {
  if (!start || !end) return "Select dates";
  const milliseconds = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.ceil(milliseconds / 86_400_000);
  return days > 0 ? `${days} days` : "Check dates";
}

export function CampaignCreate() {
  const [form, setForm] = useState<FormState>(initialState);
  const [logoName, setLogoName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fundingSymbol = form.fundingAsset === "SOL" ? "SOL" : form.fundingSymbol.trim().toUpperCase() || "TOKEN";
  const summary = useMemo(
    () => ({
      reward: form.reward ? `${Number(form.reward).toLocaleString()} ${fundingSymbol}` : `0 ${fundingSymbol}`,
      duration: duration(form.startDate, form.endDate),
      winners: form.winners || "0"
    }),
    [form.endDate, form.reward, form.startDate, form.winners, fundingSymbol]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="relative isolate overflow-hidden">
      <SiteHeader />
      <main className="relative min-h-screen pb-20 pt-28 sm:pt-32">
        <div className="absolute inset-x-0 top-0 h-[42rem] overflow-hidden"><AmbientBackground /></div>
        <div className="site-shell relative z-10">
          <a href="/#campaigns" className="inline-flex items-center gap-2 text-sm font-bold text-white/[0.45] transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back to campaigns</a>

          <div className="mt-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#5f95ff]/25 bg-[#0b5cff]/10 px-3 py-1.5 text-[0.65rem] font-black uppercase text-[#a8c4ff]">Frontend Demo</span>
              <span className="text-xs font-bold text-white/[0.35]">No funds will move</span>
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[0.96] text-white sm:text-7xl">Launch a POW Campaign</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/50 sm:text-xl">Fund a campaign in SOL or an SPL token. Eligible workers receive rewards in $POW.</p>
          </div>

          <form onSubmit={submit} className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="premium-card grid gap-8 p-5 sm:p-8">
              <fieldset className="grid gap-5">
                <legend className="mb-1 text-lg font-black text-white">Project</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Project name"><input required value={form.projectName} onChange={(event) => update("projectName", event.target.value)} placeholder="Project name" className="form-input" /></Field>
                  <Field label="Token ticker"><input required value={form.ticker} onChange={(event) => update("ticker", event.target.value.toUpperCase())} placeholder="$TOKEN" className="form-input" /></Field>
                  <Field label="X account"><input required value={form.xAccount} onChange={(event) => update("xAccount", event.target.value)} placeholder="@project" className="form-input" /></Field>
                  <Field label="Website"><input required type="url" value={form.website} onChange={(event) => update("website", event.target.value)} placeholder="https://" className="form-input" /></Field>
                </div>
                <Field label="Project logo">
                  <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/[0.15] bg-white/[0.025] px-4 text-sm text-white/40 transition hover:border-[#5f95ff]/[0.35] hover:text-white/70">
                    <ImagePlus className="h-5 w-5 text-[#7fa8ff]" aria-hidden="true" />
                    <span>{logoName || "Choose PNG, JPG, or WebP"}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoName(event.target.files?.[0]?.name || "")} className="sr-only" />
                  </label>
                </Field>
                <Field label="Campaign description"><textarea required rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What should workers help your project accomplish?" className="form-input resize-none py-3" /></Field>
              </fieldset>

              <fieldset className="grid gap-5 border-t border-white/[0.08] pt-8">
                <legend className="mb-1 text-lg font-black text-white">Campaign</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Coin tag or keyword"><input required value={form.keyword} onChange={(event) => update("keyword", event.target.value)} placeholder="$TOKEN or #campaign" className="form-input" /></Field>
                  <Field label="Funding asset"><select value={form.fundingAsset} onChange={(event) => update("fundingAsset", event.target.value as FormState["fundingAsset"])} className="form-input"><option>SOL</option><option>SPL token</option></select></Field>
                  <Field label="Funding amount"><div className="relative"><input required min="0.000001" step="any" type="number" value={form.reward} onChange={(event) => update("reward", event.target.value)} placeholder="25" className="form-input pr-20" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8db3ff]">{fundingSymbol}</span></div></Field>
                  {form.fundingAsset === "SPL token" && <>
                    <Field label="Funding token symbol"><input required value={form.fundingSymbol} onChange={(event) => update("fundingSymbol", event.target.value)} placeholder="TOKEN" className="form-input" /></Field>
                    <Field label="Funding token mint"><input required value={form.fundingMint} onChange={(event) => update("fundingMint", event.target.value)} placeholder="Solana mint address" className="form-input" /></Field>
                  </>}
                  <Field label="Start date"><input required type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} className="form-input" /></Field>
                  <Field label="End date"><input required type="date" min={form.startDate} value={form.endDate} onChange={(event) => update("endDate", event.target.value)} className="form-input" /></Field>
                  <Field label="Number of winners"><input required min="1" max="1000" type="number" value={form.winners} onChange={(event) => update("winners", event.target.value)} className="form-input" /></Field>
                  <Field label="Reward split"><select value={form.rewardSplit} onChange={(event) => update("rewardSplit", event.target.value)} className="form-input"><option>Score-weighted</option><option>Equal split</option><option>Custom distribution</option></select></Field>
                </div>
                <Field label="Eligibility rules"><textarea required rows={4} value={form.eligibility} onChange={(event) => update("eligibility", event.target.value)} placeholder="Holdings, account age, geography, content requirements, or other campaign rules." className="form-input resize-none py-3" /></Field>
              </fieldset>
            </div>

            <aside className="premium-card p-6 sm:p-7 lg:sticky lg:top-28">
              <div className="flex items-center justify-between gap-3"><p className="text-lg font-black text-white">Campaign Summary</p><ShieldCheck className="h-5 w-5 text-[#7fa8ff]" /></div>
              <dl className="mt-7 divide-y divide-white/[0.08]">
                <SummaryRow label="Funding Pool" value={summary.reward} icon={<Coins className="h-4 w-4" />} />
                <SummaryRow label="Worker Payout" value="$POW" icon={<Coins className="h-4 w-4" />} />
                <SummaryRow label="Platform Fee" value="Shown before funding" icon={<Info className="h-4 w-4" />} />
                <SummaryRow label="Total Required" value={`${summary.reward} + fee`} icon={<Coins className="h-4 w-4" />} />
                <SummaryRow label="Campaign Duration" value={summary.duration} icon={<CalendarDays className="h-4 w-4" />} />
                <SummaryRow label="Estimated Winners" value={summary.winners} icon={<ShieldCheck className="h-4 w-4" />} />
              </dl>
              <div className="mt-7 rounded-lg border border-[#5f95ff]/20 bg-[#0b5cff]/10 p-4 text-sm leading-6 text-[#b4ccff]">
                Your project funds the campaign. Before launch, non-$POW deposits must be converted into a pre-funded $POW payout balance; the demo does not swap assets.
              </div>
              <button type="submit" className="button-primary mt-5 w-full">Fund and Launch Campaign<ArrowUpRight className="h-4 w-4" /></button>
              <p className="mt-3 text-center text-xs leading-5 text-white/30">Demo only. No wallet transaction will occur.</p>
              {submitted && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-lg border border-[#5f95ff]/25 bg-[#0b5cff]/10 p-4 text-sm font-bold leading-6 text-[#b4ccff]">Campaign preview created. Backend funding and launch actions are not enabled yet.</motion.div>}
            </aside>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-bold text-white/[0.65]"><span>{label}</span>{children}</label>;
}

function SummaryRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="flex items-center gap-3 py-4"><span className="text-[#7fa8ff]">{icon}</span><dt className="flex-1 text-sm text-white/40">{label}</dt><dd className="text-right text-sm font-black text-white">{value}</dd></div>;
}
