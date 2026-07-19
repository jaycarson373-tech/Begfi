import Image from "next/image";

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="POW home">
      <span className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/[0.15] bg-white/[0.08] shadow-glow">
        <Image
          src="/images/pow-logo.png"
          alt=""
          fill
          sizes="36px"
          className="object-cover"
          priority
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-black text-white">POW</span>
        <span className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/[0.45]">
          Proof of Work
        </span>
      </span>
    </a>
  );
}
