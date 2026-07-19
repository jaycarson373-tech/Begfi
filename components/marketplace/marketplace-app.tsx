"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";
import { Logo } from "@/components/logo";
import { MarketplaceDashboard } from "@/components/marketplace/marketplace-dashboard";
import {
  AnalyticsView,
  EnterpriseView,
  JobsView,
  ProjectsView,
  SettingsView,
  WorkersView
} from "@/components/marketplace/marketplace-views";
import { MarketplaceSkeleton, PreviewBadge } from "@/components/marketplace/marketplace-ui";

type MarketplaceView = "dashboard" | "workers" | "projects" | "jobs" | "analytics" | "enterprise" | "settings";

const navItems: Array<{ id: MarketplaceView; label: string; icon: typeof LayoutDashboard; status?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "workers", label: "Workers", icon: Users, status: "Beta" },
  { id: "projects", label: "Projects", icon: Building2, status: "Beta" },
  { id: "jobs", label: "Jobs", icon: BriefcaseBusiness, status: "Beta" },
  { id: "analytics", label: "Analytics", icon: BarChart3, status: "Soon" },
  { id: "enterprise", label: "Enterprise", icon: ShieldCheck, status: "Early" },
  { id: "settings", label: "Settings", icon: Settings, status: "Soon" }
];

export function MarketplaceApp() {
  const [view, setView] = useState<MarketplaceView>("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, []);

  function selectView(nextView: MarketplaceView) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openWaitlist() {
    setView("enterprise");
    window.setTimeout(() => document.getElementById("early-access")?.scrollIntoView({ behavior: "smooth" }), 120);
  }

  const activeLabel = navItems.find((item) => item.id === view)?.label || "Dashboard";

  return (
    <div className="marketplace-root min-h-screen bg-[#03050a] text-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.08] bg-[#050811]/95 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center justify-between px-4 lg:px-5">
              <div className="flex items-center gap-3">
                <Logo compact href="/" />
                <div>
                  <p className="text-sm font-black text-white">Marketplace</p>
                  <p className="mt-0.5 text-[0.62rem] font-bold uppercase text-[#7fa8ff]">Pre-Beta</p>
                </div>
              </div>
              <a href="/" aria-label="Back to Proof of Work" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/40 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>

            <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:grid lg:overflow-visible lg:px-3 lg:pb-0" aria-label="Marketplace navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectView(item.id)}
                    className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition lg:w-full ${
                      active ? "bg-[#1e5eff]/[0.15] text-white shadow-[inset_0_0_0_1px_rgba(95,149,255,0.18)]" : "text-white/[0.42] hover:bg-white/[0.04] hover:text-white/75"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-[#7fa8ff]" : "text-white/30"}`} aria-hidden="true" />
                    {item.label}
                    {item.status && <span className="ml-auto rounded-full border border-white/[0.07] px-2 py-0.5 text-[0.55rem] font-black uppercase text-white/25">{item.status}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto hidden p-5 lg:block">
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
                <p className="text-xs font-bold text-white/60">Product preview</p>
                <p className="mt-2 text-xs leading-5 text-white/30">Demo data only. No marketplace actions are live.</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#03050a]/80 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/30">Marketplace</span>
              <span className="text-white/[0.15]">/</span>
              <span className="font-bold text-white/70">{activeLabel}</span>
            </div>
            <PreviewBadge>Interactive Preview</PreviewBadge>
          </header>

          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8 xl:p-10">
            {loading ? (
              <MarketplaceSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24 }}
                >
                  {view === "dashboard" && <MarketplaceDashboard onExplore={() => selectView("workers")} onWaitlist={openWaitlist} />}
                  {view === "workers" && <WorkersView />}
                  {view === "projects" && <ProjectsView />}
                  {view === "jobs" && <JobsView />}
                  {view === "analytics" && <AnalyticsView />}
                  {view === "enterprise" && <EnterpriseView />}
                  {view === "settings" && <SettingsView />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
