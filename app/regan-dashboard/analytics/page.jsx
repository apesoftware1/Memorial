"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const DEFAULT_RANGE_DAYS = 30;
const DEFAULT_REFRESH_MS = 30000;

const EVENT_LABELS = {
  listing_view: "Listing Opens",
  page_view: "Page Views",
  search: "Searches",
  filter_apply: "Filter Applies",
  map_view: "Address Opens",
  contact_view: "Show Contact Clicks",
  inquiry_click: "Inquiries Sent",
  phone_click: "Phone Calls Clicked",
  website_click: "Website Visits Clicked",
  whatsapp_tracker: "WhatsApp Chats Started",
  rep_call_tracker: "Rep Phone Calls Clicked",
};

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";

const fmtDate = (d) => {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const safeStr = (v) => (typeof v === "string" ? v : "");

const hostFromUrl = (url) => {
  try {
    const u = new URL(String(url));
    return u.hostname || "";
  } catch {
    return "";
  }
};

export default function AnalyticsDashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [rangeDays, setRangeDays] = useState(DEFAULT_RANGE_DAYS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("reganDashboardTheme");
      setIsDark(stored === "dark");
    } catch {
    }
  }, []);

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - Math.max(1, Number(rangeDays) || DEFAULT_RANGE_DAYS) + 1);
    return { start: fmtDate(start), end: fmtDate(end) };
  }, [rangeDays]);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const baseUrl = getBaseUrl();
        const pageSize = 100;
        let page = 1;
        const out = [];

        while (true) {
          const url = new URL(`${baseUrl}/analytics-events`);
          url.searchParams.set("sort", "timestamp:asc");
          url.searchParams.set("pagination[page]", String(page));
          url.searchParams.set("pagination[pageSize]", String(pageSize));
          if (dateRange.start) url.searchParams.set("filters[timestamp][$gte]", dateRange.start);
          if (dateRange.end) url.searchParams.set("filters[timestamp][$lte]", dateRange.end);

          const fields = [
            "eventType",
            "timestamp",
            "pagePath",
            "pageUrl",
            "referrer",
            "utmSource",
            "utmMedium",
            "utmCampaign",
            "utmTerm",
            "deviceType",
            "sessionId",
            "searchQuery",
            "metadata",
          ];
          fields.forEach((f, idx) => url.searchParams.set(`fields[${idx}]`, f));
          url.searchParams.set("populate[listing][fields][0]", "documentId");

          const res = await fetch(url.toString(), { cache: "no-store" });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Fetch failed: HTTP ${res.status} ${text}`);
          }
          const json = await res.json();
          const items = Array.isArray(json?.data) ? json.data : [];

          for (const item of items) {
            const attrs = item?.attributes || {};
            const listingDocId =
              item?.attributes?.listing?.data?.attributes?.documentId ||
              item?.attributes?.listing?.data?.documentId ||
              null;
            out.push({
              id: item?.id ?? null,
              eventType: attrs?.eventType ?? null,
              timestamp: attrs?.timestamp ?? null,
              pagePath: attrs?.pagePath ?? null,
              pageUrl: attrs?.pageUrl ?? null,
              referrer: attrs?.referrer ?? null,
              utmSource: attrs?.utmSource ?? null,
              utmMedium: attrs?.utmMedium ?? null,
              utmCampaign: attrs?.utmCampaign ?? null,
              utmTerm: attrs?.utmTerm ?? null,
              deviceType: attrs?.deviceType ?? null,
              sessionId: attrs?.sessionId ?? null,
              searchQuery: attrs?.searchQuery ?? null,
              metadata: attrs?.metadata ?? null,
              listingDocumentId: listingDocId,
            });
          }

          const pageCount = Number(json?.meta?.pagination?.pageCount || 1);
          if (page >= pageCount) break;
          page += 1;
        }

        if (cancelled) return;
        setEvents(out);
        setLastUpdatedAt(new Date().toLocaleString());
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, DEFAULT_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [dateRange.end, dateRange.start]);

  const totalsByType = useMemo(() => {
    const counts = {};
    for (const e of events) {
      const k = safeStr(e?.eventType);
      if (!k) continue;
      counts[k] = (counts[k] || 0) + 1;
    }
    return counts;
  }, [events]);

  const dailySeries = useMemo(() => {
    const byDay = new Map();
    for (const e of events) {
      const day = safeStr(e?.timestamp);
      const type = safeStr(e?.eventType);
      if (!day || !type) continue;
      if (!byDay.has(day)) byDay.set(day, { date: day });
      const row = byDay.get(day);
      row[type] = (row[type] || 0) + 1;
      row.total = (row.total || 0) + 1;
    }
    return Array.from(byDay.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [events]);

  const breakdown = useMemo(() => {
    const inc = (map, key) => {
      const k = typeof key === "string" ? key.trim() : "";
      if (!k) return;
      map.set(k, (map.get(k) || 0) + 1);
    };

    const byPage = new Map();
    const byRef = new Map();
    const byUtmSource = new Map();
    const byUtmCampaign = new Map();
    const bySearch = new Map();
    const byDevice = new Map();

    for (const e of events) {
      inc(byDevice, e?.deviceType);
      inc(byPage, e?.pagePath);
      inc(byUtmSource, e?.utmSource);
      inc(byUtmCampaign, e?.utmCampaign);
      const refHost = hostFromUrl(e?.referrer);
      if (refHost) inc(byRef, refHost);
      if (e?.eventType === "search") inc(bySearch, e?.searchQuery);
    }

    const topN = (map, n = 10) =>
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key, count]) => ({ key, count }));

    return {
      pages: topN(byPage, 10),
      referrers: topN(byRef, 10),
      utmSources: topN(byUtmSource, 10),
      utmCampaigns: topN(byUtmCampaign, 10),
      searches: topN(bySearch, 10),
      devices: topN(byDevice, 6),
    };
  }, [events]);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/regan-dashboard"
                className="px-2 py-1 rounded border bg-card text-card-foreground hover:bg-accent text-sm"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-semibold">Analytics</h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Range</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground"
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="mt-1 text-sm text-muted-foreground">
            {dateRange.start} → {dateRange.end}
            {lastUpdatedAt ? ` • Updated ${lastUpdatedAt}` : ""}
          </div>

          {error ? (
            <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <KpiCard label={EVENT_LABELS.listing_view} value={totalsByType.listing_view || 0} />
            <KpiCard label={EVENT_LABELS.inquiry_click} value={totalsByType.inquiry_click || 0} />
            <KpiCard label={EVENT_LABELS.phone_click} value={totalsByType.phone_click || 0} />
            <KpiCard label={EVENT_LABELS.whatsapp_tracker} value={totalsByType.whatsapp_tracker || 0} />
            <KpiCard label={EVENT_LABELS.map_view} value={totalsByType.map_view || 0} />
            <KpiCard label={EVENT_LABELS.contact_view} value={totalsByType.contact_view || 0} />
            <KpiCard label={EVENT_LABELS.search} value={totalsByType.search || 0} />
            <KpiCard label={EVENT_LABELS.filter_apply} value={totalsByType.filter_apply || 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
              <div className="text-sm font-semibold">Daily Trend</div>
              <div className="mt-3">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : dailySeries.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No data yet</div>
                ) : (
                  <ChartContainer
                    config={{
                      total: { label: "Total", color: "hsl(var(--chart-1))" },
                      listing_view: { label: EVENT_LABELS.listing_view, color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[260px]"
                  >
                    <AreaChart data={dailySeries} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickMargin={8} minTickGap={24} />
                      <YAxis width={36} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--color-total)"
                        fill="var(--color-total)"
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="listing_view"
                        stroke="var(--color-listing_view)"
                        fill="var(--color-listing_view)"
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
              <div className="text-sm font-semibold">Event Totals</div>
              <div className="mt-3 space-y-2">
                {Object.keys(EVENT_LABELS).map((k) => (
                  <Row key={k} label={EVENT_LABELS[k]} value={totalsByType[k] || 0} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            <BreakdownCard title="Most Viewed Pages" items={breakdown.pages} />
            <BreakdownCard title="Top Traffic Sources" items={breakdown.referrers} />
            <BreakdownCard title="Top Campaign Sources" items={breakdown.utmSources} />
            <BreakdownCard title="Top Campaign Names" items={breakdown.utmCampaigns} />
            <BreakdownCard title="Top Searches" items={breakdown.searches} />
            <BreakdownCard title="Device Types" items={breakdown.devices} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm rounded border border-border bg-muted px-3 py-2">
      <div className="min-w-0 truncate text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
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

