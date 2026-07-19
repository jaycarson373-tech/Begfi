import Image from "next/image";

type LogoProps = {
  compact?: boolean;
  href?: string;
};

export function Logo({ compact = false, href = "#top" }: LogoProps) {
  return (
    <a href={href} className="group flex items-center gap-3" aria-label="Proof of Work home">
      <span className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/[0.15] bg-[#0a37a4] shadow-[0_0_28px_rgba(30,94,255,0.28)] transition duration-300 group-hover:border-white/30 group-hover:shadow-[0_0_36px_rgba(30,94,255,0.45)]">
        <Image
          src="/images/pow-logo.png"
          alt=""
          fill
          priority
          sizes="36px"
          className="object-cover"
        />
      </span>
      {!compact && (
        <span className="text-sm font-extrabold text-white sm:text-base">
          Proof of Work
        </span>
      )}
    </a>
  );
}
