"use client";

import React, { useEffect, useMemo, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { FormProvider } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { updateCompanyField } from "@/graphql/mutations/updateCompany";
import LaybyPlanCard from "./LaybyPlanCard";
import {
  DEFAULT_LAYBY,
  DEFAULT_PLAN,
  buildLaybyRestPayload,
  mapLaybyToDefaults,
  useLaybyForm,
} from "@/hooks/useLaybyForm";

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

export default function LaybyModal({ isOpen, onClose, companyId }) {
  const [loadedLayby, setLoadedLayby] = useState(DEFAULT_LAYBY);
  const [lastLoadedLayby, setLastLoadedLayby] = useState(DEFAULT_LAYBY);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_COMPANY_LAYBY, {
    variables: { id: companyId },
    skip: !isOpen || !companyId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!isOpen) return;
    const fromServer = data?.company?.layby;
    const next = mapLaybyToDefaults(fromServer || DEFAULT_LAYBY);
    setLoadedLayby(next);
    setLastLoadedLayby(next);
  }, [isOpen, data]);

  const { form, plansArray } = useLaybyForm(loadedLayby);
  const { fields, append, remove } = plansArray;

  const enabled = form.watch("enabled");
  const canAddPlan = fields.length < 12 && enabled && !saving;
  const saveDisabled = saving || (enabled && (fields.length === 0 || !form.formState.isValid));

  const handleClose = () => {
    form.reset(mapLaybyToDefaults(lastLoadedLayby));
    onClose?.();
  };

  const addPlan = () => {
    if (!canAddPlan) return;
    append({ ...DEFAULT_PLAN });
  };

  const onSubmit = async (values) => {
    const currentEnabled = Boolean(values?.enabled);
    const plansCount = Array.isArray(values?.plans) ? values.plans.length : 0;
    if (currentEnabled && plansCount === 0) {
      toast({
        title: "Add at least 1 plan",
        description: "Lay-by must have at least one plan when enabled.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = buildLaybyRestPayload(values);
      const result = await updateCompanyField(companyId, payload.data);
      if (!result) {
        toast({
          title: "Save failed",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
      await refetch?.();
      toast({ title: "Lay-by settings saved" });
      onClose?.();
    } catch (e) {
      toast({
        title: "Save failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const body = useMemo(() => {
    if (loading) {
      return (
        <div className="p-6">
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
            <div className="h-4 w-4/6 rounded bg-gray-100" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="text-sm font-semibold text-red-600">Failed to load lay-by settings.</div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded bg-gray-800 px-4 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <FormProvider {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const currentEnabled = Boolean(form.getValues("enabled"));
            if (!currentEnabled) {
              onSubmit(form.getValues());
              return;
            }
            form.handleSubmit(onSubmit)();
          }}
          className="p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold text-gray-800">Enable</div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...form.register("enabled")} disabled={saving} />
            </label>
          </div>

          <div className={`mt-6 ${enabled ? "" : "opacity-60"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-bold text-gray-900">Plans</div>
              <div className="flex items-center gap-3">
                {fields.length >= 12 ? (
                  <div className="text-xs font-semibold text-gray-500">Max 12 plans</div>
                ) : null}
                <button
                  type="button"
                  onClick={addPlan}
                  disabled={!canAddPlan}
                  className="rounded bg-[#005bac] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Plan
                </button>
              </div>
            </div>

            {enabled && fields.length === 0 ? (
              <div className="mt-2 text-xs font-semibold text-red-600">
                Add at least 1 plan when enabled.
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <AnimatePresence initial={false}>
                {fields.map((f, idx) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LaybyPlanCard
                      index={idx}
                      disabled={!enabled || saving}
                      onRemove={() => remove(idx)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">early_settlement_allowed</div>
                  <input
                    type="checkbox"
                    disabled={!enabled || saving}
                    {...form.register("early_settlement_allowed")}
                  />
                </div>
              </div>

              <div className="rounded border border-gray-200 p-4 sm:col-span-2">
                <div className="text-sm font-semibold text-gray-800">terms_and_conditions</div>
                <textarea
                  disabled={!enabled || saving}
                  className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                  rows={5}
                  {...form.register("terms_and_conditions")}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-[#005bac] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saveDisabled}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </FormProvider>
    );
  }, [loading, error, enabled, saving, fields, form, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="text-lg font-bold text-gray-900">Configure Lay-By Options</div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {body}
      </div>
    </div>
  );
}
