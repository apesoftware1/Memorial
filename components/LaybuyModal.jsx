"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Clock } from "lucide-react";
import { gql, useQuery } from "@apollo/client";

const GET_COMPANY_LAYBY = gql`
  query GetCompanyLayby($id: ID!) {
    company(documentId: $id) {
      documentId
      layby {
        enabled
        early_settlement_allowed
        terms_and_conditions
        plans {
          duration_months
          interest_type
          monthly_payment_type
          deposit_required
          deposit_amount
        }
      }
    }
  }
`;

export default function LaybuyModal({ isOpen, onClose, companyId, companyName, logoSrc }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const { data, loading, error } = useQuery(GET_COMPANY_LAYBY, {
    variables: { id: companyId ?? "" },
    skip: !companyId || !isOpen,
    fetchPolicy: "network-only",
  });

  if (!isOpen) return null;

  const layby = data?.company?.layby;
  const enabled = Boolean(layby?.enabled);
  const plans = Array.isArray(layby?.plans) ? [...layby.plans] : [];
  plans.sort((a, b) => Number(a?.duration_months ?? 0) - Number(b?.duration_months ?? 0));

  const interestLabel = (v) => {
    if (v === "interest_free") return "Interest-free";
    if (v === "interest_applies") return "Interest applies";
    return v || "Interest";
  };

  const monthlyLabel = (v) => {
    if (v === "fixed") return "Fixed monthly payments";
    if (v === "custom") return "Custom monthly payments";
    return v || "Monthly payments";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-[#F4B400] px-6 py-3 text-center text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-white/90 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-2xl sm:text-3xl font-extrabold leading-tight">
            Cant Afford a BIG Upfront Cost!
          </div>
          <div className="mt-0.5 text-xl sm:text-2xl font-medium leading-tight">
            Dont Stress. Pay over time.
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center justify-center">
                {logoSrc ? (
                  <div className="relative h-20 w-28 sm:h-24 sm:w-32">
                    <Image
                      src={logoSrc}
                      alt={companyName || "Logo"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock size={18} className="text-[#0D7C99]" />
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-wide">
                    <span className="text-[#0D7C99]">LAY-BY</span>{" "}
                    <span className="text-[#C9A23A]">Options</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6 text-gray-900">
              {loading ? (
                <div className="text-sm font-semibold text-gray-700">
                  Loading lay-by options...
                </div>
              ) : error ? (
                <div className="text-sm font-semibold text-red-600">
                  Unable to load lay-by options right now.
                </div>
              ) : !enabled ? (
                <div className="text-sm font-semibold text-gray-700">
                  Lay-by options are currently not available for this manufacturer.
                </div>
              ) : plans.length === 0 ? (
                <div className="text-sm font-semibold text-gray-700">
                  No lay-by plans have been configured yet.
                </div>
              ) : (
                plans.map((plan, idx) => (
                  <div key={`${plan?.duration_months ?? idx}-${idx}`}>
                    <div className="text-2xl font-extrabold">{`Option ${idx + 1}`}</div>
                    <ul className="mt-2 list-disc pl-6 text-xl">
                      <li>{`Pay over ${plan?.duration_months ?? ""} months`}</li>
                      <li>{interestLabel(plan?.interest_type)}</li>
                      <li>{monthlyLabel(plan?.monthly_payment_type)}</li>
                      {plan?.deposit_required ? (
                        <li>
                          {`Deposit required${
                            plan?.deposit_amount !== null &&
                            plan?.deposit_amount !== undefined &&
                            plan?.deposit_amount !== ""
                              ? ` (R ${Number(plan.deposit_amount).toLocaleString("en-ZA")})`
                              : ""
                          }`}
                        </li>
                      ) : null}
                      {layby?.early_settlement_allowed ? (
                        <li>Early settlement allowed</li>
                      ) : null}
                    </ul>
                  </div>
                ))
              )}

              <div className="pt-2">
                <div className="text-sm font-extrabold">How it works</div>
                <div className="mt-2 text-sm">
                  <div>1 - Choose your tombstone</div>
                  <div>2 - Select a lay-by option</div>
                  <div>3 - Make monthly payments</div>
                  <div>4 - Installation takes place once fully paid</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-px w-full bg-gray-200" />
                <div className="mt-4 text-xs font-extrabold">Terms &amp; Conditions</div>
                {layby?.terms_and_conditions ? (
                  <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
                    {layby.terms_and_conditions}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-700">
                    No terms &amp; conditions have been provided.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
