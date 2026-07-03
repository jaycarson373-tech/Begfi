import clsx from "clsx";
import type { ProtocolMetric } from "@/types/protocol";

const toneClasses: Record<ProtocolMetric["tone"], string> = {
  purple: "from-beg-purple/[0.34] to-white/[0.03] text-beg-purple",
  magenta: "from-beg-magenta/30 to-white/[0.03] text-beg-magenta",
  lime: "from-beg-lime/[0.26] to-white/[0.03] text-beg-lime",
  steel: "from-white/[0.16] to-white/[0.03] text-beg-steel"
};

type MetricTileProps = {
  metric: ProtocolMetric;
  valueOverride?: string;
};

export function MetricTile({ metric, valueOverride }: MetricTileProps) {
  return (
    <article className="glass-subtle rounded-lg p-4">
      <div
        className={clsx(
          "mb-4 h-1 w-16 rounded-lg bg-gradient-to-r",
          toneClasses[metric.tone]
        )}
      />
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/[0.45]">
        {metric.label}
      </p>
      <p className="mt-3 text-2xl font-black text-white sm:text-3xl">
        {valueOverride ?? metric.value}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/[0.54]">{metric.helper}</p>
    </article>
  );
}
