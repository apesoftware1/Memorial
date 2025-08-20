// hooks/useCompanyPerformance.js
"use client";

import { useQuery } from "@apollo/client";
import { GET_COMPANY_WITH_ANALYTICS } from "@/graphql/queries/GetCompanyPerformance";

export const EVENT_KEYS = ["listing_view", "map_view", "contact_view", "inquiry_click"];

export const useCompanyPerformance = (documentId, eventsStart, eventsEnd) => {
  return useQuery(GET_COMPANY_WITH_ANALYTICS, {
    variables: {
      documentId: documentId || "",
      eventsStart: eventsStart ?? null,
      eventsEnd: eventsEnd ?? null,
    },
    fetchPolicy: "cache-and-network",
    skip: !documentId,
  });
};

// Helper functions
export const countEvents = (events) => {
  const counts = { listing_view: 0, map_view: 0, contact_view: 0, inquiry_click: 0 };
  for (const ev of events || []) {
    if (counts[ev.eventType] !== undefined) counts[ev.eventType] += 1;
  }
  return counts;
};

export const sumCounts = (a, b) => {
  const out = { ...a };
  for (const k of EVENT_KEYS) out[k] = (out[k] || 0) + (b[k] || 0);
  return out;
};

export const classifyPerformance = (listingCount, companyAvg) => {
  const total = EVENT_KEYS.reduce((n, k) => n + (listingCount[k] || 0), 0);
  const avg = EVENT_KEYS.reduce((n, k) => n + (companyAvg[k] || 0), 0);

  if (avg <= 0) return { label: "moderate", color: "bg-gray-400" };
  const ratio = total / avg;
  if (ratio >= 1.5) return { label: "hot", color: "bg-green-600" };
  if (ratio <= 0.5) return { label: "slow", color: "bg-red-600" };
  return { label: "moderate", color: "bg-amber-500" };
};

export const monthToRange = (monthYear) => {
  if (!monthYear) return { start: null, end: null };
  const [y, m] = monthYear.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59));
  return { start: start.toISOString(), end: end.toISOString() };
};