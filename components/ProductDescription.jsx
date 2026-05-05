import React from "react";
import Image from "next/image";
import { Info, X } from "lucide-react";
import PropTypes from "prop-types";

export default function ProductDescription({ description, additionalDetails, manufacturingTimeframe }) {
  const formatManufacturingLeadTimeText = (days) => {
    if (days === 1) return "X1 WORKING DAY AFTER POP (Proof of Payment)";
    return `X${days} WORKING DAYS AFTER POP (Proof of Payment)`;
  };

  const formatLeadTimeValue = (raw) => {
    const value = String(raw ?? "").trim();
    if (!value) return "";
    if (/^\d+$/.test(value)) {
      const days = Number(value);
      if (Number.isFinite(days) && days > 0) return formatManufacturingLeadTimeText(days);
    }
    return value;
  };

  const normalizeItems = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => {
        if (typeof item === "string") return { value: item };
        return { value: item?.value, info: item?.info };
      })
      .filter((item) => Boolean(item?.value));
  };

  const formatInfoLines = (raw) => {
    const text = String(raw ?? "").trim();
    if (!text) return [];
    const splitByBullet = text.includes("•") ? text.split("•") : null;
    const lines = (splitByBullet || text.split("\n"))
      .map((line) => String(line).trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-–—*•\u2022]+\s*/, ""))
      .map((line) => line.replace(/^\d+[.)]\s*/, ""))
      .filter(Boolean);
    return lines.length > 0 ? lines : [text];
  };

  const InfoTooltip = ({ info }) => {
    const wrapRef = React.useRef(null);
    const [openReason, setOpenReason] = React.useState(null);
    const open = Boolean(openReason);

    React.useEffect(() => {
      if (!open) return;
      const onPointerDown = (e) => {
        const el = wrapRef.current;
        if (!el) return;
        if (el.contains(e.target)) return;
        setOpenReason(null);
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [open]);

    return (
      <span
        ref={wrapRef}
        className="relative shrink-0"
        onMouseEnter={() => setOpenReason((prev) => (prev === "click" ? prev : "hover"))}
        onMouseLeave={() => setOpenReason((prev) => (prev === "hover" ? null : prev))}
      >
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="More info"
          aria-expanded={open}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenReason((prev) => (prev === "click" ? null : "click"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpenReason(null);
          }}
        >
          <Info size={14} />
        </button>

        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 md:hidden"
              aria-label="Close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenReason(null);
              }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:absolute md:inset-auto md:left-1/2 md:top-full md:mt-2 md:block md:px-0 md:-translate-x-1/2">
              <div className="relative w-full max-w-sm rounded-md bg-gray-900 px-4 py-3 text-xs text-white shadow-lg md:w-64 md:px-3 md:py-2">
                <button
                  type="button"
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white md:hidden"
                  aria-label="Close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenReason(null);
                  }}
                >
                  <X size={16} />
                </button>
                <div className="max-h-[70vh] overflow-auto">
                  <ul className="space-y-1">
                    {formatInfoLines(info).map((line, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="shrink-0">-</span>
                        <span className="min-w-0 break-words">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </span>
    );
  };

  const renderItems = (items) => (
    <ul className="mt-0 space-y-0 ml-[54px]">
      {items.map((item, i) => (
        <li key={i} className="pl-2 relative leading-snug">
          <span className="absolute left-0 top-0 text-gray-700">•</span>
          <div className="min-w-0 flex items-start gap-2">
            <div className="min-w-0 break-words">{item.value}</div>
            {item.info ? (
              <InfoTooltip info={item.info} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );

  const transportItems = normalizeItems(additionalDetails?.transportAndInstallation);
  const foundationItems = normalizeItems(additionalDetails?.foundationOptions);
  const warrantyItems = normalizeItems(additionalDetails?.warrantyOrGuarantee);
  const installationItems = normalizeItems(additionalDetails?.installationGuarantee);
  const legacyLeadTimeItems = normalizeItems(additionalDetails?.manufacturingLeadTime);
  const leadTimeItems = manufacturingTimeframe
    ? [{ value: formatLeadTimeValue(manufacturingTimeframe) }]
    : legacyLeadTimeItems.map((item) => ({ ...item, value: formatLeadTimeValue(item.value) }));

  return (
    <div 
      className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold uppercase mb-2">Tombstone Description</h2>
        <p className="text-sm text-gray-700 mb-0">{description}</p>
      </div>

      <div className="mb-0">
        <h2 className="text-lg font-bold uppercase mb-0">Additional Tombstone Details</h2>
        <div className="space-y-0 text-sm text-gray-800">
          {transportItems.length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700 mb-0">
                <Image
                  src="/last_icons/Addional_ProductInfo_Icons/Additional_Icons_Transport.svg"
                  alt="Transport & Installation"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Transport and Installation</span>
              </div>
              {renderItems(transportItems)}
            </div>
          )}

          {foundationItems.length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/last_icons/Addional_ProductInfo_Icons/Additional_Icons_Foundations.svg"
                  alt="Foundation Options"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Foundation Options</span>
              </div>
              {renderItems(foundationItems)}
            </div>
          )}

          {warrantyItems.length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/last_icons/Addional_ProductInfo_Icons/Additional_Icons_WarrentyGuarantee.svg"
                  alt="Manufacturers Guarantee"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Manufacturers Guarantee</span>
              </div>
              {renderItems(warrantyItems)}
            </div>
          )}

          {leadTimeItems.length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/Icons&Lay-By2026/Additional-info-Icons/timeline.svg"
                  alt="Manufacturing Lead Time"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Manufacturing Lead Time</span>
              </div>
              {renderItems(leadTimeItems)}
            </div>
          )}

          {installationItems.length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/Icons&Lay-By2026/Additional-info-Icons/installation.svg"
                  alt="Installation Guarantee"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Installation Guarantee</span>
              </div>
              {renderItems(installationItems)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProductDescription.propTypes = {
  description: PropTypes.string,
  additionalDetails: PropTypes.object.isRequired,
  manufacturingTimeframe: PropTypes.string,
};
