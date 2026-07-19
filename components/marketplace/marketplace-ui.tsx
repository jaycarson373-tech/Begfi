import type { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

export function PreviewBadge({ children = "Preview" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4f8cff]/25 bg-[#1e5eff]/10 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase text-[#9fbdff]">
      <BadgeCheck className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-[#5f95ff]/30 bg-[#1e5eff]/[0.12] px-3 py-2 text-sm font-black text-[#b4ccff] shadow-[0_0_24px_rgba(30,94,255,0.18)]">
      {score} POW
    </span>
  );
}

export function ViewHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase text-[#7fa8ff]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/[0.45] sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="grid gap-6" aria-label="Loading marketplace preview">
      <div className="h-52 animate-pulse rounded-lg bg-white/[0.045]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-lg bg-white/[0.045]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg bg-white/[0.045]" />
        <div className="h-72 animate-pulse rounded-lg bg-white/[0.045]" />
      </div>
    </div>
  );
}
