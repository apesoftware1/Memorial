const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

const ANALYTICS_QUERY = `
  query AllAnalyticsEvents($eventsStart: Date, $eventsEnd: Date) {
    companies(pagination: { limit: -1 }) {
      documentId
      name
      listings(pagination: { limit: -1 }) {
        documentId
        title
        slug
        analyticsEvents(
          pagination: { limit: -1 }
          filters: { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ) {
          documentId
          eventType
          timestamp
          pagePath
          pageUrl
          referrer
          utmSource
          utmMedium
          utmCampaign
          utmTerm
          deviceType
          searchQuery
          metadata
        }
      }
    }
  }
`;

const WEBSITE_QUERY = `
  query WebsiteAnalytics($eventsStart: Date, $eventsEnd: Date) {
    analyticsEvents(
      pagination: { limit: -1 }
      filters: {
        timestamp: { gte: $eventsStart, lte: $eventsEnd }
        eventType: { in: ["page_view", "search", "filter_apply"] }
      }
    ) {
      documentId
      eventType
      timestamp
      pagePath
      pageUrl
      referrer
      utmSource
      utmMedium
      utmCampaign
      utmTerm
      deviceType
      searchQuery
      metadata
    }
  }
`;

function readDateRange(searchParams) {
  const start = searchParams.get("filters[timestamp][$gte]") || null;
  const end = searchParams.get("filters[timestamp][$lte]") || null;
  return { start, end };
}

function readEventTypesFilter(searchParams) {
  const set = new Set();
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filters[eventType][$in][")) set.add(value);
  }
  if (set.size === 0) return null;
  return set;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const { start: eventsStart, end: eventsEnd } = readDateRange(url.searchParams);
    const eventTypesFilter = readEventTypesFilter(url.searchParams);

    const variables = {
      eventsStart: eventsStart ?? null,
      eventsEnd: eventsEnd ?? null,
    };

    const [companyRes, websiteRes] = await Promise.all([
      fetchGraphQL(ANALYTICS_QUERY, variables),
      fetchGraphQL(WEBSITE_QUERY, variables),
    ]);

    const companies = Array.isArray(companyRes?.companies) ? companyRes.companies : [];
    const websiteEvents = Array.isArray(websiteRes?.analyticsEvents) ? websiteRes.analyticsEvents : [];

    const flat = [];
    const seen = new Set();

    const includeEvt = (eventType) =>
      !eventTypesFilter || eventTypesFilter.has(String(eventType));

    for (const company of companies) {
      const listings = Array.isArray(company?.listings) ? company.listings : [];
      for (const listing of listings) {
        const listingDocId = listing?.documentId || null;
        const listingTitle = listing?.title || null;
        const listingSlug = listing?.slug || null;
        const events = Array.isArray(listing?.analyticsEvents) ? listing.analyticsEvents : [];
        for (const ev of events) {
          const docId = ev?.documentId;
          if (!docId) continue;
          if (seen.has(docId)) continue;
          seen.add(docId);
          if (!includeEvt(ev?.eventType)) continue;
          flat.push(normalizeEvent(ev, { listingDocId, listingTitle, listingSlug }));
        }
      }
    }

    for (const ev of websiteEvents) {
      const docId = ev?.documentId;
      if (!docId) continue;
      if (seen.has(docId)) continue;
      seen.add(docId);
      if (!includeEvt(ev?.eventType)) continue;
      flat.push(normalizeEvent(ev, { listingDocId: null, listingTitle: null, listingSlug: null }));
    }

    flat.sort((a, b) => {
      const ta = String(a.attributes.timestamp || "");
      const tb = String(b.attributes.timestamp || "");
      if (ta === tb) return String(a.id).localeCompare(String(b.id));
      return ta.localeCompare(tb);
    });

    const rawPage = Number(url.searchParams.get("pagination[page]")) || 1;
    const rawPageSize = Number(url.searchParams.get("pagination[pageSize]")) || 100;
    const page = Math.max(1, rawPage);
    const pageSize = Math.max(1, Math.min(5000, rawPageSize));
    const total = flat.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const startIdx = (page - 1) * pageSize;
    const paged = flat.slice(startIdx, startIdx + pageSize);

    return Response.json({
      data: paged,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total,
        },
      },
    });
  } catch (error) {
    console.error("Analytics proxy: Error:", error);
    return Response.json(
      { error: "Failed to fetch analytics events", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

function normalizeEvent(ev, listing) {
  const docId = ev?.documentId;
  const attributes = {
    eventType: ev?.eventType ?? null,
    timestamp: ev?.timestamp ?? null,
    pagePath: ev?.pagePath ?? null,
    pageUrl: ev?.pageUrl ?? null,
    referrer: ev?.referrer ?? null,
    utmSource: ev?.utmSource ?? null,
    utmMedium: ev?.utmMedium ?? null,
    utmCampaign: ev?.utmCampaign ?? null,
    utmTerm: ev?.utmTerm ?? null,
    deviceType: ev?.deviceType ?? null,
    searchQuery: ev?.searchQuery ?? null,
    metadata: ev?.metadata ?? null,
    listing: listing.listingDocId
      ? {
          data: {
            documentId: listing.listingDocId,
            attributes: {
              documentId: listing.listingDocId,
              title: listing.listingTitle,
              slug: listing.listingSlug,
            },
          },
        }
      : { data: null },
  };
  return {
    id: docId,
    documentId: docId,
    attributes,
  };
}

async function fetchGraphQL(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) {
    console.error("Analytics proxy: GraphQL errors", json.errors);
    return null;
  }
  return json?.data ?? null;
}
