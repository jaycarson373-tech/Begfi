import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  icon
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <div className="eyebrow">
        {icon}
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-white/[0.62] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
