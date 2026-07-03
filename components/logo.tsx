import Image from "next/image";

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="BegFi home">
      <span className="relative grid h-10 w-10 overflow-hidden rounded-lg border border-white/[0.15] bg-black shadow-glow">
        <Image
          src="/assets/begfi-raccoon-logo.png"
          alt="BegFi raccoon mascot"
          width={40}
          height={40}
          sizes="40px"
          className="h-full w-full object-cover object-center"
          priority
        />
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
