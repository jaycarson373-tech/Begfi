import Image from "next/image";

export function FooterBrandBanner() {
  return (
    <div className="relative overflow-hidden border-t border-[#1f75ff]/15 bg-[#01030c]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#1f75ff]/80 to-transparent shadow-[0_0_22px_rgba(31,117,255,0.75)]" />
      <div className="relative mx-auto aspect-[1280/437] w-full max-w-[1600px]">
        <Image
          src="/images/pow-footer-banner.jpg"
          alt="Proof of Work banner"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
