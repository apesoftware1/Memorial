"use client";

import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export const DEFAULT_PLAN = {
  duration_months: 6,
  interest_type: "interest_free",
  monthly_payment_type: "fixed",
  deposit_required: false,
  deposit_amount: null,
};

export const DEFAULT_LAYBY = {
  enabled: false,
  early_settlement_allowed: false,
  terms_and_conditions: "",
  plans: [],
};

export function mapLaybyToDefaults(layby) {
  const safe = layby && typeof layby === "object" ? layby : {};
  const plans = Array.isArray(safe.plans) ? safe.plans : [];
  return {
    enabled: Boolean(safe.enabled),
    early_settlement_allowed: Boolean(safe.early_settlement_allowed),
    terms_and_conditions: typeof safe.terms_and_conditions === "string" ? safe.terms_and_conditions : "",
    plans: plans.map((p) => ({
      duration_months: Number.isFinite(Number(p?.duration_months)) ? Number(p.duration_months) : DEFAULT_PLAN.duration_months,
      interest_type: p?.interest_type === "interest_applies" ? "interest_applies" : "interest_free",
      monthly_payment_type: p?.monthly_payment_type === "custom" ? "custom" : "fixed",
      deposit_required: Boolean(p?.deposit_required),
      deposit_amount:
        p?.deposit_required === true
          ? (Number.isFinite(Number(p?.deposit_amount)) ? Number(p.deposit_amount) : null)
          : null,
    })),
  };
}

export function valuesToLayby(values) {
  const enabled = Boolean(values?.enabled);
  const plansRaw = Array.isArray(values?.plans) ? values.plans : [];
  const plans = plansRaw.slice(0, 12).map((p) => {
    const depositRequired = Boolean(p?.deposit_required);
    const duration = Number(p?.duration_months);
    const duration_months = Number.isFinite(duration) ? duration : DEFAULT_PLAN.duration_months;
    const interest_type = p?.interest_type === "interest_applies" ? "interest_applies" : "interest_free";
    const monthly_payment_type = p?.monthly_payment_type === "custom" ? "custom" : "fixed";
    const depositAmountNum = Number(p?.deposit_amount);
    const deposit_amount =
      depositRequired && Number.isFinite(depositAmountNum) ? depositAmountNum : null;
    return {
      duration_months,
      interest_type,
      monthly_payment_type,
      deposit_required: depositRequired,
      deposit_amount,
    };
  });

  return {
    enabled,
    early_settlement_allowed: Boolean(values?.early_settlement_allowed),
    terms_and_conditions: typeof values?.terms_and_conditions === "string" ? values.terms_and_conditions : "",
    plans,
  };
}

export function buildLaybyRestPayload(values) {
  return { data: { layby: valuesToLayby(values) } };
}

export function useLaybyForm(initialLayby) {
  const defaults = useMemo(() => {
    return mapLaybyToDefaults(initialLayby || DEFAULT_LAYBY);
  }, [initialLayby]);

  const form = useForm({
    defaultValues: defaults,
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  const plansArray = useFieldArray({
    control: form.control,
    name: "plans",
  });

  return { form, plansArray };
}
