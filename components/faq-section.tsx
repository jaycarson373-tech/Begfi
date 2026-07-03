import { CircleHelp } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { getFaqItems } from "@/lib/protocol-data";

export function FaqSection() {
  const faqs = getFaqItems();

  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="FAQ"
          title="Protocol questions before the contracts exist."
          description="These answers describe the intended integration path and current mock UI state."
          icon={<CircleHelp className="h-3.5 w-3.5 text-beg-lime" aria-hidden="true" />}
        />
        <div className="mt-8 grid gap-3">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group glass-subtle rounded-lg p-4 open:border-beg-purple/[0.35]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-white">
                {item.question}
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.12] bg-white/[0.06] text-white/[0.58] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/[0.62]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
