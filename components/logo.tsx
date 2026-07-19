import Image from "next/image";

type LogoProps = {
  compact?: boolean;
  href?: string;
};

export function Logo({ compact = false, href = "#top" }: LogoProps) {
  return (
    <a href={href} className="group flex items-center gap-3" aria-label="POW, PROOF OF WORK home">
      <span className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/[0.15] bg-[#0a66c2] shadow-[0_0_24px_rgba(10,102,194,0.24)] transition duration-300 group-hover:border-white/30 group-hover:shadow-[0_0_32px_rgba(10,102,194,0.4)]">
        <Image
          src="/images/pow-network-mark.svg"
          alt=""
          fill
          priority
          sizes="40px"
          className="object-cover"
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-black text-white">POW</span>
          <span className="mt-1 text-[0.59rem] font-extrabold uppercase text-white/45">
            PROOF OF WORK
          </span>
        </span>
      )}
    </a>
  );
}
