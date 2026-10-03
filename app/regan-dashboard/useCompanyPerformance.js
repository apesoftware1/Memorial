// hooks/useCompanyPerformance.js
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  "whatsapp_tracker",
  "rep_call_tracker",
];

export const EVENT_DEFS = [
  { key: "listing_view", label: "Listing Opens" },
  { key: "map_view", label: "Address Opens" },
  { key: "contact_view", label: "Show Contact Clicks" },
  { key: "inquiry_click", label: "Inquiries Sent" },
  { key: "phone_click", label: "Phone Calls Clicked" },
  { key: "whatsapp_tracker", label: "WhatsApp Chats Started" },
  { key: "rep_call_tracker", label: "Rep Phone Calls Clicked" },
];

const HEADER_TOTALS_KEY_MAP = [
  ["listing_view", "listingViews"],
  ["map_view", "mapViews"],
  ["contact_view", "contactViews"],
  ["inquiry_click", "inquiryClicks"],
  ["phone_click", "phoneClicks"],
  ["whatsapp_tracker", "whatsappClicks"],
  ["rep_call_tracker", "repCallClicks"],
];

// Strapi v5 enforces a server-side maxPageSize = 50 on ALL top-level and
// nested queries (irrespective of pageSize requested client-side). Each
// individual page request returns AT MOST 50 rows. We therefore paginate
// EVERY top-level collection until the returned rows < 50.
const SERVER_DEFAULT_MAX_PER_PAGE = 50;
// Safety ceiling on pagination loops. Real data has ~1067 listing_view rows
// for the largest company = 22 event pages of 50, so 500 is more than enough.
const MAX_PAGES = 500;

function groupAnalyticsByListing(listings, events) {
  const byListing = new Map();
  if (Array.isArray(events)) {
    for (const ev of events) {
      const docId = ev?.listing?.documentId;
      if (!docId) continue;
      const bucket = byListing.get(docId) || [];
      bucket.push(ev);
      byListing.set(docId, bucket);
    }
  }
  if (!Array.isArray(listings)) return [];
  return listings.map((l) => ({
    ...l,
    analyticsEvents: byListing.get(String(l.documentId)) || [],
  }));
}

function buildHeaderTotalsFromServerResponse(data) {
  const out = Object.fromEntries(EVENT_KEYS.map((k) => [k, 0]));
  if (!data || typeof data !== "object") return out;
  for (const [eventKey, fieldKey] of HEADER_TOTALS_KEY_MAP) {
    const total = Number(data?.[fieldKey]?.pageInfo?.total) || 0;
    out[eventKey] = total;
  }
  return out;
}

function dedupeByDocumentId(items) {
  const seen = new Set();
  const out = [];
  for (const it of items || []) {
    const id = String(it?.documentId ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(it);
  }
  return out;
}

export function useCompanyPerformance(documentId, eventsStart, eventsEnd) {
  const [resetKey, setResetKey] = useState(0);
  const [allListings, setAllListings] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const fetchedListingPagesRef = useRef(new Set());
  const fetchedEventPagesRef = useRef(new Set());
  const currentlyFetchingRef = useRef(false);

  const startClean =
    typeof eventsStart === "string" && eventsStart.length > 0
      ? eventsStart.slice(0, 10)
      : "2024-01-01";
  const endClean =
    typeof eventsEnd === "string" && eventsEnd.length > 0
      ? eventsEnd.slice(0, 10)
      : "2099-12-31";

  const useExtended =
    typeof process !== "undefined" &&
    typeof process.env?.NEXT_PUBLIC_ANALYTICS_EXTENDED === "string" &&
    ["1", "true", "yes"].includes(process.env.NEXT_PUBLIC_ANALYTICS_EXTENDED.toLowerCase());
  const query = useExtended ? GET_COMPANY_WITH_ANALYTICS_EXTENDED : GET_COMPANY_WITH_ANALYTICS;
  const variables = useMemo(() => {
    const v = {
      documentId: documentId || "",
      page: 1,
      pageSize: SERVER_DEFAULT_MAX_PER_PAGE,
      eventsStart: startClean,
      eventsEnd: endClean,
      eventsPage: 1,
      eventsPageSize: SERVER_DEFAULT_MAX_PER_PAGE,
    };
    return v;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, startClean, endClean, resetKey]);

  const result = useQuery(query, {
    variables,
    fetchPolicy: "network-only",
    skip: !documentId,
    notifyOnNetworkStatusChange: true,
  });

  const { data, fetchMore } = result;
  const companiesRaw = Array.isArray(data?.companies) ? data.companies : [];
  const listingsRaw = Array.isArray(data?.listings) ? data.listings : [];
  const eventsPageRaw = Array.isArray(data?.analyticsEventsPage) ? data.analyticsEventsPage : [];
  const totalListings = Number(data?.listingsMeta?.pageInfo?.total) || 0;
  const listingPageCount = Math.max(1, Number(data?.listingsMeta?.pageInfo?.pageCount) || 1);
  const headerTotals = buildHeaderTotalsFromServerResponse(data);

  // Reset state whenever the company or date range changes.
  useEffect(() => {
    setAllListings([]);
    setAllEvents([]);
    fetchedListingPagesRef.current = new Set();
    fetchedEventPagesRef.current = new Set();
    currentlyFetchingRef.current = false;
    setResetKey((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, startClean, endClean]);

  // Drain remaining pages of listings + analytics events after the initial
  // page-1 query snapshot resolves. Uses Apollo fetchMore with updateQuery
  // concat + client-side dedupe-by-id to merge successive server pages into
  // the complete universe sets allListings + allEvents.
  useEffect(() => {
    if (!fetchMore || !data) return;
    if (currentlyFetchingRef.current) return;

    // Seed page 1 from initial query response.
    if (!fetchedListingPagesRef.current.has(1) && listingsRaw.length > 0) {
      fetchedListingPagesRef.current.add(1);
      setAllListings((prev) => dedupeByDocumentId([...prev, ...listingsRaw]));
    }
    if (!fetchedEventPagesRef.current.has(1) && eventsPageRaw.length > 0) {
      fetchedEventPagesRef.current.add(1);
      setAllEvents((prev) => dedupeByDocumentId([...prev, ...eventsPageRaw]));
    }

    async function drainRemainingPages() {
      currentlyFetchingRef.current = true;
      try {
        // ---- LISTINGS PAGINATION (pages 2..listingPageCount inclusive) ----
        for (let p = 2; p <= listingPageCount && p <= MAX_PAGES; p++) {
          if (fetchedListingPagesRef.current.has(p)) continue;
          fetchedListingPagesRef.current.add(p);
          const fm = await fetchMore({
            variables: { page: p, pageSize: SERVER_DEFAULT_MAX_PER_PAGE },
            updateQuery: (prev, { fetchMoreResult: fmr }) => {
              if (!fmr) return prev;
              return {
                ...prev,
                listings: [...(prev.listings || []), ...(fmr.listings || [])],
              };
            },
          });
          const rows = Array.isArray(fm?.data?.listings) ? fm.data.listings : [];
          if (rows.length > 0) {
            setAllListings((prev) => dedupeByDocumentId([...prev, ...rows]));
          }
        }

        // ---- ANALYTICS EVENTS PAGINATION (page 2 → until < 50 returned) ----
        let eventsPage = 2;
        while (eventsPage <= MAX_PAGES) {
          if (fetchedEventPagesRef.current.has(eventsPage)) {
            eventsPage += 1;
            continue;
          }
          fetchedEventPagesRef.current.add(eventsPage);
          const fm = await fetchMore({
            variables: { eventsPage, eventsPageSize: SERVER_DEFAULT_MAX_PER_PAGE },
            updateQuery: (prev, { fetchMoreResult: fmr }) => {
              if (!fmr) return prev;
              return {
                ...prev,
                analyticsEventsPage: [
                  ...(prev.analyticsEventsPage || []),
                  ...(fmr.analyticsEventsPage || []),
                ],
              };
            },
          });
          const rows = Array.isArray(fm?.data?.analyticsEventsPage)
            ? fm.data.analyticsEventsPage
            : [];
          if (rows.length > 0) {
            setAllEvents((prev) => dedupeByDocumentId([...prev, ...rows]));
          }
          if (rows.length < SERVER_DEFAULT_MAX_PER_PAGE) break;
          eventsPage += 1;
        }
      } finally {
        currentlyFetchingRef.current = false;
      }
    }

    // Only start draining if:
    //   - There are more listing pages beyond page 1
    //     OR
    //   - The initial event page returned exactly 50 rows (implying more exist)
    const moreListingPages = listingPageCount > 1;
    const maybeMoreEvents = eventsPageRaw.length >= SERVER_DEFAULT_MAX_PER_PAGE;
    const alreadyDrained = fetchedListingPagesRef.current.size >= listingPageCount &&
      fetchedEventPagesRef.current.size > 0 &&
      eventsPageRaw.length < SERVER_DEFAULT_MAX_PER_PAGE;
    if ((moreListingPages || maybeMoreEvents) && !alreadyDrained) {
      drainRemainingPages().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const companyRaw = companiesRaw[0] || null;
  const hasMoreListings = false;
  const page = 1;
  const pageSize = SERVER_DEFAULT_MAX_PER_PAGE;

  const loadMoreListings = async () => {
    // All listing + event pages already fully drained into memory above;
    // UI button simply increments the "visible" slice by 10 (handled in page).
  };
  const resetToFirstPage = () => {
    // Reset is driven by docId/range useEffect via resetKey.
  };

  const companies = useMemo(() => {
    if (!companyRaw) return [];
    const listings = groupAnalyticsByListing(allListings, allEvents);
    return [{ ...companyRaw, listings }];
  }, [companyRaw, allListings, allEvents]);

  const nextData = { companies, headerTotals };

  return {
    ...result,
    data: nextData,
    headerTotals,
    totalListings,
    pageCount: listingPageCount,
    page,
    pageSize,
    hasMoreListings,
    loadMoreListings,
    resetToFirstPage,
  };
}

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
