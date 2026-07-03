import { Coins } from "lucide-react";

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="BegFi home">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.15] bg-white/[0.08] shadow-glow">
        <Coins className="h-4 w-4 text-beg-lime" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-black text-white">BegFi</span>
        <span className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/[0.45]">
          $BEG
        </span>
      </span>
    </a>
  );
}
