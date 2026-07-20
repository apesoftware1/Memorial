"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ManufacturerOption = {
  name: string;
  slug: string | null;
};

type LocationSearchStripProps = {
  locationLabel: string;
  manufacturers: ManufacturerOption[];
};

export default function LocationSearchStrip({
  locationLabel,
  manufacturers,
}: LocationSearchStripProps) {
  const router = useRouter();
  const [selectedManufacturer, setSelectedManufacturer] = useState(
    manufacturers[0]?.slug ?? ""
  );

  const manufacturerOptions = useMemo(
    () =>
      manufacturers.filter(
        (item, index, array) =>
          array.findIndex(
            (candidate) =>
              candidate.slug === item.slug && candidate.name === item.name
          ) === index
      ),
    [manufacturers]
  );

  return (
    <section className="border border-[#0e6d80] bg-[#0e6d80] px-4 py-3 text-white">
      <div className="container mx-auto max-w-6xl px-0">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Manufacturer Name
            </span>
            <select
              value={selectedManufacturer}
              onChange={(event) => setSelectedManufacturer(event.target.value)}
              className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none"
            >
              {manufacturerOptions.length ? (
                manufacturerOptions.map((item) => (
                  <option key={`${item.slug || item.name}`} value={item.slug || ""}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option value="">Available manufacturers</option>
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Location
            </span>
            <input
              value={locationLabel}
              readOnly
              className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() =>
              router.push(
                selectedManufacturer
                  ? `/manufacturers/${selectedManufacturer}`
                  : "/manufacturers"
              )
            }
            className="mt-[22px] h-10 min-w-[210px] justify-self-start whitespace-nowrap border border-[#f4a62a] bg-[#f4a62a] px-5 text-sm font-semibold text-white transition hover:bg-[#dc9019] lg:justify-self-end"
          >
            Search for Manufacturers
          </button>
        </div>
      </div>
    </section>
  );
}
