import Image from "next/image";

type LogoProps = {
  compact?: boolean;
  href?: string;
};

export function Logo({ compact = false, href = "#top" }: LogoProps) {
  return (
    <a href={href} className="group flex items-center gap-3" aria-label="POW, PROOF OF WORK home">
      <span className="relative h-11 w-11 overflow-hidden rounded-lg border border-[#1f75ff]/25 bg-[#020817] shadow-[0_0_24px_rgba(7,93,255,0.2)] transition duration-300 group-hover:border-[#1f75ff]/55 group-hover:shadow-[0_0_34px_rgba(7,93,255,0.38)]">
        <Image
          src="/images/pow-logo.jpg"
          alt=""
          fill
          priority
          sizes="44px"
          className="object-cover"
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-black text-white">POW</span>
          <span className="mt-1 text-[0.59rem] font-extrabold uppercase text-[#8fb7ff]/70">
            PROOF OF WORK
          </span>
        </span>
      )}
    </a>
  );
}
