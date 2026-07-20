type LogoProps = {
  compact?: boolean;
  href?: string;
  inverse?: boolean;
};

export function Logo({ compact = false, href = "#top", inverse = false }: LogoProps) {
  return (
    <a href={href} className="group flex shrink-0 items-center gap-2" aria-label="WORK home">
      <span className="work-mark grid h-9 w-9 place-items-center rounded-[5px] bg-[#0a66c2] text-xl font-black text-white shadow-sm transition group-hover:bg-[#004182]">
        W
      </span>
      {!compact && (
        <span className={`text-xl font-extrabold ${inverse ? "text-white" : "text-[#1f2328]"}`}>
          WORK
        </span>
      )}
    </a>
  );
}
