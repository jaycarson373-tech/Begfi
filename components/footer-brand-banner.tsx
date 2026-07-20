import { BriefcaseBusiness, CircleDollarSign, MessageSquareText } from "lucide-react";

export function FooterBrandBanner() {
  return (
    <div className="work-cover text-white">
      <div className="site-shell grid min-h-[230px] items-center gap-8 py-10 sm:grid-cols-[1fr_auto]">
        <div><p className="text-xs font-bold uppercase text-white/70">The work network for crypto</p><p className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">I work for this coin.</p></div>
        <div className="flex gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><MessageSquareText className="h-5 w-5" /></span><span className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><BriefcaseBusiness className="h-5 w-5" /></span><span className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><CircleDollarSign className="h-5 w-5" /></span></div>
      </div>
    </div>
  );
}
