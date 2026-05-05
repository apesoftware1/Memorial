"use client";

import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

export default function LaybyPlanCard({ index, disabled, onRemove }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const depositRequired = useWatch({
    control,
    name: `plans.${index}.deposit_required`,
  });

  const durationError = errors?.plans?.[index]?.duration_months?.message;
  const interestError = errors?.plans?.[index]?.interest_type?.message;
  const monthlyError = errors?.plans?.[index]?.monthly_payment_type?.message;
  const depositError = errors?.plans?.[index]?.deposit_amount?.message;

  const depositReg = register(`plans.${index}.deposit_required`);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-gray-900">Plan {index + 1}</div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700">duration_months</label>
          <input
            type="number"
            inputMode="numeric"
            disabled={disabled}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            {...register(`plans.${index}.duration_months`, {
              required: "Required",
              min: { value: 1, message: "Must be > 0" },
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          {durationError ? (
            <div className="mt-1 text-xs font-semibold text-red-600">{durationError}</div>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">interest_type</label>
          <select
            disabled={disabled}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            {...register(`plans.${index}.interest_type`, { required: "Required" })}
          >
            <option value="interest_free">interest_free</option>
            <option value="interest_applies">interest_applies</option>
          </select>
          {interestError ? (
            <div className="mt-1 text-xs font-semibold text-red-600">{interestError}</div>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">monthly_payment_type</label>
          <select
            disabled={disabled}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            {...register(`plans.${index}.monthly_payment_type`, { required: "Required" })}
          >
            <option value="fixed">fixed</option>
            <option value="custom">custom</option>
          </select>
          {monthlyError ? (
            <div className="mt-1 text-xs font-semibold text-red-600">{monthlyError}</div>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
          <div className="text-xs font-semibold text-gray-700">deposit_required</div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              {...depositReg}
              onChange={(e) => {
                depositReg.onChange(e);
                if (!e.target.checked) {
                  setValue(`plans.${index}.deposit_amount`, null, { shouldValidate: true, shouldDirty: true });
                }
              }}
            />
          </label>
        </div>
      </div>

      {depositRequired ? (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700">deposit_amount</label>
          <input
            type="number"
            inputMode="decimal"
            disabled={disabled}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            {...register(`plans.${index}.deposit_amount`, {
              validate: (v) => {
                if (!depositRequired) return true;
                if (v === null || v === undefined) return "Required";
                const n = Number(v);
                if (!Number.isFinite(n)) return "Required";
                return n > 0 || "Must be > 0";
              },
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {depositError ? (
            <div className="mt-1 text-xs font-semibold text-red-600">{depositError}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

