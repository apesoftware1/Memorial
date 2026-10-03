"use client";

import { useMemo, useState, useEffect, useSyncExternalStore } from "react";
import CompanyHeader from "../CompanyHeader";
import ListingCard from "../ListingCard";
import PdfExporterButton from "../PDFExportButtons";
import { useParams } from "next/navigation";
import {
  useCompanyPerformance,
  EVENT_KEYS,
  EVENT_DEFS,
  countEvents,
  sumCounts,
  classifyPerformance,
  monthToRange,
} from "../useCompanyPerformance";

export default function CompanyPerformancePage() {
  const params = useParams();
  const documentId = (params?.slug ?? "") || "";
  // Local dark-mode state scoped to this page
  const [isDark, setIsDark] = useState(false);
  const isMounted = useSyncExternalStore(
    (cb) => () => {},
    () => true,
    () => false
  );

  // Initialize dark mode from the dashboard's stored preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reganDashboardTheme');
      setIsDark(stored === 'dark');
    } catch {}
  }, []);

  // UI State
  const [period, setPeriod] = useState("all");
  const [monthYear, setMonthYear] = useState("");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(10);
  const queryRange = useMemo(() => {
    if (period === "month" && monthYear) {
      const { start, end } = monthToRange(monthYear);
      // Strapi GraphQL declares the timestamp filter variable as Date type
      // (YYYY-MM-DD), not DateTime. ISO 8601 strings with "T" fail with
      // BAD_USER_INPUT and the entire query returns null → header/cards 0.
      // Slice to YYYY-MM-DD day-granularity which is the valid Date value.
      return {
        eventsStart: start ? start.slice(0, 10) : null,
        eventsEnd: end ? end.slice(0, 10) : null,
      };
    }

    return { eventsStart: null, eventsEnd: null };
  }, [period, monthYear]);

  const { eventsStart, eventsEnd } = queryRange;

  // Always call hook; it internally skips when documentId is empty
  const perf = useCompanyPerformance(documentId, eventsStart, eventsEnd);
  const { data, loading, error } = perf;
  const {
    totalListings,
    headerTotals,
  } = perf;

  // Safe defaults
  const company = data?.companies[0] ?? null;
  
  const listings = company?.listings ?? [];

  // When period, month, or company changes, reset the visible card count
  // back to the initial 10 so the scroll position and UX feel consistent.
  useEffect(() => {
    setVisible(10);
  }, [period, monthYear, documentId]);

  // search filter
  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((l) => (l.title || "").toLowerCase().includes(q));
  }, [search, listings]);

  // compute counts per listing, and company totals + average baseline
  const listingWithCounts = useMemo(() => {
    return filteredListings.map((l) => ({
      ...l,
      _counts: countEvents(l.analyticsEvents || []),
    }));
  }, [filteredListings]);

  const companyTotals = useMemo(() => {
    if (headerTotals) return { ...headerTotals };
    return listingWithCounts.reduce(
      (acc, l) => sumCounts(acc, l._counts),
      Object.fromEntries(EVENT_KEYS.map((k) => [k, 0]))
    );
  }, [headerTotals, listingWithCounts]);

  const companyAvg = useMemo(() => {
    const n = listingWithCounts.length || 1;
    const avg = Object.fromEntries(EVENT_KEYS.map((k) => [k, 0]));
    for (const l of listingWithCounts) {
      for (const k of EVENT_KEYS) avg[k] += l._counts[k] || 0;
    }
    for (const k of EVENT_KEYS) avg[k] = avg[k] / n;
    return avg;
  }, [listingWithCounts]);

  const allEvents = useMemo(() => {
    const out = [];
    for (const l of filteredListings || []) {
      const evs = Array.isArray(l?.analyticsEvents) ? l.analyticsEvents : [];
      for (const e of evs) out.push(e);
    }
    return out;
  }, [filteredListings]);

  const breakdown = useMemo(() => {
    const inc = (map, key) => {
      const k = typeof key === "string" ? key.trim() : "";
      if (!k) return;
      map.set(k, (map.get(k) || 0) + 1);
    };
    const hostFromUrl = (url) => {
      try {
        const u = new URL(String(url));
        return u.hostname || "";
      } catch {
        return "";
      }
    };

    const byDevice = new Map();
    const byPagePath = new Map();
    const byReferrer = new Map();
    const byUtmSource = new Map();
    const byUtmCampaign = new Map();
    const bySearchQuery = new Map();

    for (const e of allEvents) {
      inc(byDevice, e?.deviceType);
      inc(byPagePath, e?.pagePath);
      inc(byUtmSource, e?.utmSource);
      inc(byUtmCampaign, e?.utmCampaign);

      const refHost = hostFromUrl(e?.referrer);
      if (refHost) inc(byReferrer, refHost);

      if (e?.eventType === "search") inc(bySearchQuery, e?.searchQuery);
    }

    const topN = (map, n = 8) =>
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key, count]) => ({ key, count }));

    return {
      device: topN(byDevice, 6),
      pages: topN(byPagePath, 10),
      referrers: topN(byReferrer, 10),
      utmSources: topN(byUtmSource, 10),
      utmCampaigns: topN(byUtmCampaign, 10),
      searchQueries: topN(bySearchQuery, 10),
    };
  }, [allEvents]);

  const visibleItems = listingWithCounts.slice(0, visible);

  const handleLoadMore = () => {
    setVisible((v) => Math.min(listingWithCounts.length, v + 10));
  };

  // Single return with conditional UI
  return (
    <div className={isDark ? "dark" : ""}>
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="mx-auto max-w-7xl">
              {!isMounted || loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 w-64 bg-gray-200 rounded" />
                  <div className="h-8 w-48 bg-gray-200 rounded" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-56 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="mx-auto max-w-3xl text-red-600">
                  Error loading data: {error.message}
                </div>
              ) : (
            <>
              {/* Back Arrow only, remove theme toggle here */}
              <div className="mb-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-2 py-1 rounded border bg-card text-card-foreground hover:bg-accent text-sm"
                  aria-label="Go back"
                  title="Go back"
                >
                  ← Back
                </button>
              </div>

              <CompanyHeader
                logoUrl={company?.logoUrl}
                name={company?.name}
                period={period}
                monthYear={monthYear}
                onChangePeriod={setPeriod}
                onChangeMonthYear={setMonthYear}
                totals={companyTotals}
                eventDefs={EVENT_DEFS}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                <BreakdownCard title="Most Viewed Pages" items={breakdown.pages} />
                <BreakdownCard title="Top Traffic Sources" items={breakdown.referrers} />
                <BreakdownCard title="Top Campaign Sources" items={breakdown.utmSources} />
                <BreakdownCard title="Top Campaign Names" items={breakdown.utmCampaigns} />
                <BreakdownCard title="Top Searches" items={breakdown.searchQueries} />
                <BreakdownCard title="Device Types" items={breakdown.device} />
              </div>

              {/* Controls + Export */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search listings by title…"
                    className="border rounded px-3 py-2 w-72"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="text-sm text-gray-500">
                    Showing {visibleItems.length} of {listings.length}{totalListings > 0 ? ` / ${totalListings} total` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <PdfExporterButton
                    mode="company"
                    company={company}
                    listings={listingWithCounts}
                    totals={companyTotals}
                    periodLabel={period === "all" ? "All time" : monthYear}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                {visibleItems.map((l) => {
                  const perf = classifyPerformance(l._counts, companyAvg);
                  return (
                    <ListingCard
                      key={l.documentId}
                      listing={l}
                      counts={l._counts}
                      performance={perf}
                      eventDefs={EVENT_DEFS}
                    >
                      <PdfExporterButton
                        mode="listing"
                        listing={l}
                        counts={l._counts}
                        periodLabel={period === "all" ? "All time" : monthYear}
                      />
                    </ListingCard>
                  );
                })}
              </div>

              {visible < listingWithCounts.length && (
                <div className="flex flex-col md:flex-row justify-center items-center mt-8 gap-4">
                  <button
                    disabled={loading}
                    onClick={handleLoadMore}
                    className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading
                      ? `Loading data…`
                      : `Load more (${visible}/${listingWithCounts.length} shown${totalListings ? ` of ${totalListings} total` : ""})`}
                  </button>
                </div>
              )}

              {listingWithCounts.length === 0 && (
                <div className="text-center text-gray-600 mt-10">
                  No listings match your current filters.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, items }) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 space-y-2">
        {safeItems.length > 0 ? (
          safeItems.map((it) => (
            <div key={`${it.key}`} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0 text-muted-foreground truncate">{it.key}</div>
              <div className="font-semibold">{it.count}</div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No data yet</div>
        )}
      </div>
    </div>
  );
}
