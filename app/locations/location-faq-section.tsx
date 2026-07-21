"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

type LocationFaqItem = {
  question: string;
  answer: string;
};

type LocationFaqSectionProps = {
  title: string;
  items: LocationFaqItem[];
};

export default function LocationFaqSection({
  title,
  items,
}: LocationFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-6 border-t border-slate-200 pt-4">
      <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>

      <div className="mt-4 w-full">
        <div className="h-px bg-[#e0e0e0] w-full" />

        {items.map((item, index) => (
          <div key={`${item.question}-${index}`} className="group relative w-full">
            <button
              type="button"
              className={`flex w-full items-center gap-4 py-3 text-left transition-colors ${
                openIndex === index ? "bg-[#f9f9f9]" : "hover:bg-[#f9f9f9]"
              }`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="min-w-0 flex-1 pr-4 text-base font-bold uppercase tracking-tight text-[#0b4c5f]">
                {item.question}
              </span>
              <span className="ml-auto flex shrink-0 items-center text-[#0b4c5f]">
                {openIndex === index ? (
                  <Minus className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </span>
            </button>

            {openIndex === index ? (
              <div className="py-2">
                <div className="rounded bg-[#f9f9f9] p-4 text-base leading-relaxed text-[#0b4c5f]">
                  {item.answer}
                </div>
              </div>
            ) : null}

            {index < items.length - 1 ? (
              <div className="h-px bg-[#e0e0e0] w-full" />
            ) : null}
          </div>
        ))}

        <div className="h-px bg-[#e0e0e0] w-full" />

        {!items.length ? (
          <div className="mt-4 border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No FAQ content was returned for this location.
          </div>
        ) : null}
      </div>
    </section>
  );
}
