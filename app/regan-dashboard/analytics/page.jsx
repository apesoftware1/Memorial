"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const IMPORTANT_EVENT_TYPES = [
  "listing_view",
  "inquiry_click",
  "phone_click",
  "website_click",
  "whatsapp_tracker",
  "rep_call_tracker",
  "map_view",
  "contact_view",
  "page_view",
  "search",
  "filter_apply",
];

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

const safeNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

const hostFromUrl = (url) => {
  try {
    const u = new URL(String(url));
    return u.hostname || "";
  } catch {
    return "";
  }
};

const toCsv = (rows) => {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return rows.map((row) => row.map(esc).join(",")).join("\n");
};

const downloadTextFile = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const isConversionEvent = (eventType) => {
  return (
    eventType === "inquiry_click" ||
    eventType === "phone_click" ||
    eventType === "website_click" ||
    eventType === "whatsapp_tracker" ||
    eventType === "rep_call_tracker"
  );
};

export default function AnalyticsDashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [rangeDays, setRangeDays] = useState(DEFAULT_RANGE_DAYS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");
  const [selectedListing, setSelectedListing] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

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
          IMPORTANT_EVENT_TYPES.forEach((t, i) => {
            url.searchParams.set(`filters[eventType][$in][${i}]`, t);
          });

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
            "searchQuery",
            "metadata",
          ];
          fields.forEach((f, idx) => url.searchParams.set(`fields[${idx}]`, f));
          url.searchParams.set("populate[listing][fields][0]", "documentId");
          url.searchParams.set("populate[listing][fields][1]", "title");
          url.searchParams.set("populate[listing][fields][2]", "slug");

          const res = await fetch(url.toString(), { cache: "no-store" });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Fetch failed: HTTP ${res.status} ${text}`);
          }
          const json = await res.json();
          const items = Array.isArray(json?.data) ? json.data : [];

          for (const item of items) {
            const attrs = item?.attributes || {};
            const listingData = item?.attributes?.listing?.data;
            const listingAttrs = listingData?.attributes || {};
            const listingDocId = listingAttrs?.documentId || listingData?.documentId || null;
            const listingTitle = listingAttrs?.title || null;
            const listingSlug = listingAttrs?.slug || null;
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
              searchQuery: attrs?.searchQuery ?? null,
              metadata: attrs?.metadata ?? null,
              listingDocumentId: listingDocId,
              listingTitle,
              listingSlug,
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

  const filteredEvents = useMemo(() => {
    const listingKey = selectedListing === "all" ? null : selectedListing;
    const campaignKey = selectedCampaign === "all" ? null : selectedCampaign;
    return events.filter((e) => {
      if (listingKey && String(e?.listingDocumentId || "") !== String(listingKey)) return false;
      if (campaignKey && safeStr(e?.utmCampaign) !== campaignKey) return false;
      return true;
    });
  }, [events, selectedCampaign, selectedListing]);

  const activityEvents = useMemo(() => {
    return filteredEvents.filter((e) => !(e?.eventType === "page_view" && e?.metadata?.webVital));
  }, [filteredEvents]);

  const totalsByType = useMemo(() => {
    const counts = {};
    for (const e of activityEvents) {
      const k = safeStr(e?.eventType);
      if (!k) continue;
      counts[k] = (counts[k] || 0) + 1;
    }
    return counts;
  }, [activityEvents]);

  const conversionTotals = useMemo(() => {
    let conversions = 0;
    for (const e of activityEvents) {
      const t = safeStr(e?.eventType);
      if (isConversionEvent(t)) conversions += 1;
    }
    return conversions;
  }, [activityEvents]);

  const conversionRate = useMemo(() => {
    const opens = totalsByType.listing_view || 0;
    if (opens <= 0) return 0;
    return conversionTotals / opens;
  }, [conversionTotals, totalsByType.listing_view]);

  const dailySeries = useMemo(() => {
    const byDay = new Map();
    for (const e of activityEvents) {
      const day = safeStr(e?.timestamp);
      const type = safeStr(e?.eventType);
      if (!day || !type) continue;
      if (!byDay.has(day)) byDay.set(day, { date: day });
      const row = byDay.get(day);
      row[type] = (row[type] || 0) + 1;
      row.total = (row.total || 0) + 1;
    }
    return Array.from(byDay.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [activityEvents]);

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

    for (const e of activityEvents) {
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
  }, [activityEvents]);

  const listingOptions = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const id = e?.listingDocumentId ? String(e.listingDocumentId) : "";
      if (!id) continue;
      if (!map.has(id)) {
        const label = e?.listingTitle ? `${e.listingTitle} (${id})` : id;
        map.set(id, label);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [events]);

  const campaignOptions = useMemo(() => {
    const set = new Set();
    for (const e of events) {
      const c = safeStr(e?.utmCampaign).trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map((c) => ({ value: c, label: c }));
  }, [events]);

  const listingPerformance = useMemo(() => {
    const byListing = new Map();
    for (const e of activityEvents) {
      const id = e?.listingDocumentId ? String(e.listingDocumentId) : "";
      if (!id) continue;
      if (!byListing.has(id)) {
        byListing.set(id, {
          listingDocumentId: id,
          listingTitle: e?.listingTitle || null,
          opens: 0,
          conversions: 0,
          inquiries: 0,
          phone: 0,
          website: 0,
          whatsapp: 0,
        });
      }
      const row = byListing.get(id);
      const t = safeStr(e?.eventType);
      if (t === "listing_view") row.opens += 1;
      if (t === "inquiry_click") row.inquiries += 1;
      if (t === "phone_click") row.phone += 1;
      if (t === "website_click") row.website += 1;
      if (t === "whatsapp_tracker" || t === "rep_call_tracker") row.whatsapp += 1;
      if (isConversionEvent(t)) row.conversions += 1;
    }
    return Array.from(byListing.values())
      .map((r) => ({
        ...r,
        conversionRate: r.opens > 0 ? r.conversions / r.opens : 0,
      }))
      .sort((a, b) => b.conversions - a.conversions || b.opens - a.opens)
      .slice(0, 10);
  }, [activityEvents]);

  const campaignPerformance = useMemo(() => {
    const byCampaign = new Map();
    for (const e of activityEvents) {
      const key = safeStr(e?.utmCampaign).trim() || "(no campaign)";
      if (!byCampaign.has(key)) {
        byCampaign.set(key, { campaign: key, opens: 0, conversions: 0 });
      }
      const row = byCampaign.get(key);
      const t = safeStr(e?.eventType);
      if (t === "listing_view") row.opens += 1;
      if (isConversionEvent(t)) row.conversions += 1;
    }
    return Array.from(byCampaign.values())
      .map((r) => ({ ...r, conversionRate: r.opens > 0 ? r.conversions / r.opens : 0 }))
      .sort((a, b) => b.conversions - a.conversions || b.opens - a.opens)
      .slice(0, 10);
  }, [activityEvents]);

  const webVitals = useMemo(() => {
    const sum = new Map();
    const count = new Map();
    for (const e of filteredEvents) {
      if (e?.eventType !== "page_view") continue;
      const vital = e?.metadata?.webVital;
      const name = safeStr(vital?.name);
      const val = safeNum(vital?.value);
      if (!name || val === null) continue;
      sum.set(name, (sum.get(name) || 0) + val);
      count.set(name, (count.get(name) || 0) + 1);
    }
    const out = [];
    for (const [name, total] of sum.entries()) {
      const n = count.get(name) || 0;
      if (n <= 0) continue;
      out.push({ name, avg: total / n, samples: n });
    }
    const order = ["LCP", "INP", "CLS", "FCP", "TTFB"];
    return out.sort((a, b) => {
      const ai = order.indexOf(a.name);
      const bi = order.indexOf(b.name);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.name.localeCompare(b.name);
    });
  }, [filteredEvents]);

  const handleDownloadEventsCsv = useCallback(() => {
    const header = [
      "timestamp",
      "eventType",
      "listingDocumentId",
      "listingTitle",
      "pagePath",
      "pageUrl",
      "referrerHost",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "deviceType",
      "searchQuery",
      "metadata",
    ];
    const rows = [header];
    for (const e of filteredEvents) {
      rows.push([
        e?.timestamp || "",
        e?.eventType || "",
        e?.listingDocumentId || "",
        e?.listingTitle || "",
        e?.pagePath || "",
        e?.pageUrl || "",
        hostFromUrl(e?.referrer),
        e?.utmSource || "",
        e?.utmMedium || "",
        e?.utmCampaign || "",
        e?.deviceType || "",
        e?.searchQuery || "",
        e?.metadata ? JSON.stringify(e.metadata) : "",
      ]);
    }
    const csv = toCsv(rows);
    downloadTextFile(`analytics-events-${dateRange.start}-to-${dateRange.end}.csv`, csv, "text/csv;charset=utf-8");
  }, [dateRange.end, dateRange.start, filteredEvents]);

  const handleDownloadListingReportCsv = useCallback(() => {
    const header = [
      "listingDocumentId",
      "listingTitle",
      "listingOpens",
      "conversions",
      "conversionRate",
      "inquiries",
      "phoneClicks",
      "websiteClicks",
      "whatsappClicks",
    ];
    const rows = [header];
    for (const r of listingPerformance) {
      rows.push([
        r.listingDocumentId,
        r.listingTitle || "",
        r.opens,
        r.conversions,
        r.conversionRate,
        r.inquiries,
        r.phone,
        r.website,
        r.whatsapp,
      ]);
    }
    const csv = toCsv(rows);
    downloadTextFile(`listing-performance-${dateRange.start}-to-${dateRange.end}.csv`, csv, "text/csv;charset=utf-8");
  }, [dateRange.end, dateRange.start, listingPerformance]);

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
            <div className="flex flex-wrap items-center justify-end gap-2">
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
              <label className="text-sm text-muted-foreground ml-2">Listing</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground max-w-[260px]"
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
              >
                <option value="all">All listings</option>
                {listingOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label className="text-sm text-muted-foreground ml-2">Campaign</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground max-w-[200px]"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="all">All campaigns</option>
                {campaignOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleDownloadEventsCsv}
                className="ml-2 inline-flex items-center justify-center rounded border px-3 py-2 text-sm bg-background text-foreground hover:bg-accent"
              >
                Download Events CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadListingReportCsv}
                className="inline-flex items-center justify-center rounded border px-3 py-2 text-sm bg-background text-foreground hover:bg-accent"
              >
                Download Listing Report
              </button>
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
            <KpiCard label="Conversions" value={conversionTotals} />
            <KpiCard label="Conversion Rate" value={`${(conversionRate * 100).toFixed(1)}%`} />
            <KpiCard label={EVENT_LABELS.inquiry_click} value={totalsByType.inquiry_click || 0} />
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
            <BreakdownTable
              title="Top Listings"
              columns={["Listing", "Opens", "Conversions", "Rate"]}
              rows={listingPerformance.map((r) => [
                r.listingTitle ? `${r.listingTitle}` : r.listingDocumentId,
                r.opens,
                r.conversions,
                `${(r.conversionRate * 100).toFixed(1)}%`,
              ])}
              emptyText={loading ? "Loading…" : "No data yet"}
            />
            <BreakdownTable
              title="Top Campaigns"
              columns={["Campaign", "Opens", "Conversions", "Rate"]}
              rows={campaignPerformance.map((r) => [
                r.campaign,
                r.opens,
                r.conversions,
                `${(r.conversionRate * 100).toFixed(1)}%`,
              ])}
              emptyText={loading ? "Loading…" : "No data yet"}
            />
            <BreakdownTable
              title="Web Vitals (Avg)"
              columns={["Metric", "Average", "Samples"]}
              rows={webVitals.map((v) => [
                v.name,
                v.name === "CLS" ? v.avg.toFixed(3) : `${Math.round(v.avg)} ms`,
                v.samples,
              ])}
              emptyText={loading ? "Loading…" : "No data yet"}
            />
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

function BreakdownTable({ title, columns, rows, emptyText }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 overflow-x-auto">
        {safeRows.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                {columns.map((c) => (
                  <th key={c} className="text-left font-medium py-2 pr-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeRows.map((r, idx) => (
                <tr key={idx} className="border-t border-border">
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 pr-3 align-top">
                      <div className="min-w-0 truncate">{String(cell)}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-muted-foreground">{emptyText || "No data yet"}</div>
        )}
      </div>
    </div>
  );
}
