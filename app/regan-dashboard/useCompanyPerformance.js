// hooks/useCompanyPerformance.js
"use client";

import { useQuery } from "@apollo/client";
import {
  GET_COMPANY_WITH_ANALYTICS,
  GET_COMPANY_WITH_ANALYTICS_EXTENDED,
} from "@/graphql/queries/GetCompanyPerformance";

export const EVENT_KEYS = [
  "listing_view",
  "map_view",
  "contact_view",
  "inquiry_click",
  "phone_click",
  "website_click",
  "whatsapp_tracker",
  "rep_call_tracker",
];

export const EVENT_DEFS = [
  { key: "listing_view", label: "Listing Opens" },
  { key: "map_view", label: "Address Opens" },
  { key: "contact_view", label: "Show Contact Clicks" },
  { key: "inquiry_click", label: "Inquiries Sent" },
  { key: "phone_click", label: "Phone Calls Clicked" },
  { key: "website_click", label: "Website Visits Clicked" },
  { key: "whatsapp_tracker", label: "WhatsApp Chats Started" },
  { key: "rep_call_tracker", label: "Rep Phone Calls Clicked" },
];

export const useCompanyPerformance = (documentId, eventsStart, eventsEnd) => {
  const useExtended =
    typeof process !== "undefined" &&
    typeof process.env?.NEXT_PUBLIC_ANALYTICS_EXTENDED === "string" &&
    ["1", "true", "yes"].includes(process.env.NEXT_PUBLIC_ANALYTICS_EXTENDED.toLowerCase());
  const query = useExtended ? GET_COMPANY_WITH_ANALYTICS_EXTENDED : GET_COMPANY_WITH_ANALYTICS;
  return useQuery(query, {
    variables: {
      documentId: documentId || "",
      eventsStart: eventsStart ?? null,
      eventsEnd: eventsEnd ?? null,
    },
    fetchPolicy: "cache-first",
    skip: !documentId,
  });
};

// Helper functions
export const countEvents = (events) => {
  const counts = Object.fromEntries(EVENT_KEYS.map((k) => [k, 0]));
  for (const ev of events || []) {
    const key = ev?.eventType;
    if (typeof key === "string" && counts[key] !== undefined) counts[key] += 1;
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
