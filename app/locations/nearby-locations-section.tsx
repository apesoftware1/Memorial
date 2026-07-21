"use client";

import { useMemo, useState } from "react";

type NearbyLocationItem = {
  documentId?: string | null;
  name: string;
  businessType?: string | null;
  description?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  streetAddress?: string | null;
  postalCode?: string | null;
};

type NearbyLocationsSectionProps = {
  townLabel: string;
  items: NearbyLocationItem[];
};

const INITIAL_VISIBLE_COUNT = 4;

function toBusinessTypeLabel(value?: string | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "Local business";
  return text
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function NearbyLocationsSection({
  townLabel,
  items,
}: NearbyLocationsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = useMemo(
    () => (expanded ? items : items.slice(0, INITIAL_VISIBLE_COUNT)),
    [expanded, items]
  );
  const hasMore = items.length > INITIAL_VISIBLE_COUNT;

  return (
    <section className="mt-6 border-t border-slate-200 pt-4">
      <h2 className="text-lg font-semibold text-[#111827]">Nearby locations</h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {visibleItems.map((item, index) => {
          const addressLine = [item.streetAddress, item.postalCode]
            .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
            .join(", ");
          const description =
            typeof item.description === "string" && item.description.trim() ? item.description.trim() : "";
          const phoneLine = [item.phone, item.mobile]
            .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
            .join(" / ");
          const website =
            typeof item.website === "string" && item.website.trim() ? item.website.trim() : "";
          const whatsapp =
            typeof item.whatsapp === "string" && item.whatsapp.trim() ? item.whatsapp.trim() : "";
          const email = typeof item.email === "string" && item.email.trim() ? item.email.trim() : "";

          return (
            <article
              key={`${item.documentId || item.name}-${index}`}
              className="border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">{item.name}</h3>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#0e6d80]">
                    {toBusinessTypeLabel(item.businessType)}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500">{townLabel}</p>
              </div>

              {addressLine ? <p className="mt-2 text-[13px] leading-5 text-[#374151]">{addressLine}</p> : null}
              {description ? <p className="mt-2 text-[12px] leading-5 text-[#4b5563]">{description}</p> : null}
              {phoneLine ? <p className="mt-3 text-[12px] text-[#374151]">Phone: {phoneLine}</p> : null}
              {whatsapp ? <p className="mt-1 text-[12px] text-[#374151]">WhatsApp: {whatsapp}</p> : null}
              {email ? <p className="mt-1 text-[12px] text-[#374151]">Email: {email}</p> : null}
              {website ? <p className="mt-1 text-[12px] text-[#374151]">Website: {website}</p> : null}
            </article>
          );
        })}

        {!items.length ? (
          <div className="border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 lg:col-span-2">
            No nearby locations were returned for this location.
          </div>
        ) : null}
      </div>

      {hasMore ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="border border-[#0e6d80] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0e6d80] transition-colors hover:bg-[#0e6d80] hover:text-white"
          >
            {expanded ? "View less" : "View more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
