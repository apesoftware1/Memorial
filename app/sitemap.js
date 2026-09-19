import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";
import {
  toSlugSegment,
  cleanListingSlug,
  buildListingCanonicalHref,
} from "@/lib/slugs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tombstonesfinder.co.za");

const FAQS_LIVE_INDEX_URL =
  process.env.FAQS_LIVE_INDEX_URL ||
  "https://api.tombstonesfinder.co.za/api/faqs-live/index?base=%2Ffaqs";

const coreRoutes = [
  "/",
  "/tombstones-for-sale",
  "/manufacturers",
  "/contact",
  "/blogs",
  "/faqs",
];

function stripProtocol(url) {
  return typeof url === "string" ? url.replace(/^https?:\/\//i, "") : url;
}

function stripTrailingSlash(route) {
  return typeof route === "string" ? route.replace(/\/+$/, "") || "/" : "/";
}

function normalizeManufacturerSlug(raw) {
  const decoded = (() => {
    try {
      return decodeURIComponent(typeof raw === "string" ? raw : "");
    } catch (_e) {
      return String(raw || "");
    }
  })();
  return decoded
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickBestCanonicalDate(dates) {
  const candidates = (Array.isArray(dates) ? dates : [dates])
    .map((d) => (typeof d === "string" && d.trim() ? d.trim() : null))
    .filter(Boolean);
  for (const d of candidates) {
    const ts = Date.parse(d);
    if (Number.isFinite(ts)) return new Date(ts).toISOString();
  }
  return undefined;
}

function buildSiteMapEntry(route, lastMod, changeFreq, priority) {
  return {
    url: toAbsoluteUrl(stripTrailingSlash(route)),
    lastModified: lastMod || new Date().toISOString(),
    changeFrequency: changeFreq || "weekly",
    priority: Number.isFinite(priority) ? priority : 0.7,
  };
}

function isServicesAllowedByRobots(route) {
  const r = stripTrailingSlash(String(route || "")).toLowerCase();
  if (!r.startsWith("/services")) return true;
  if (r === "/services" || r === "/services/") return false;
  const lower = r.toLowerCase();
  if (lower.includes("/insights") || lower.endsWith("/insights")) return true;
  if (lower.includes("/guides") || lower.endsWith("/guides")) return true;
  if (lower.includes("/blogs") || lower.endsWith("/blogs")) return true;
  return false;
}

function isRobotsDisallowed(route) {
  const r = stripTrailingSlash(String(route || ""));
  if (r.startsWith("/api/")) return true;
  if (r.startsWith("/product/")) return true;
  if (r.startsWith("/regan-dashboard")) return true;
  if (r.startsWith("/manufacturers/manufacturers-Profile-Page")) return true;
  if (r === "/tombstones-on-special" || r.startsWith("/tombstones-on-special/")) return true;
  if (r.startsWith("/services") && !isServicesAllowedByRobots(r)) return true;
  const asUrl = (() => {
    try {
      return new URL(
        r.startsWith("http") ? r : `https://example.com${r.startsWith("/") ? r : "/" + r}`
      );
    } catch (_e) {
      return null;
    }
  })();
  if (asUrl && asUrl.searchParams.has("id")) return true;
  return false;
}

function safeSitemapEntries(entries) {
  const map = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const url =
      entry && typeof entry.url === "string" && entry.url.trim()
        ? entry.url.trim()
        : "";
    if (!url) continue;
    const path = (() => {
      try {
        return new URL(url).pathname;
      } catch (_e) {
        return "";
      }
    })();
    if (!path) continue;
    if (isRobotsDisallowed(path)) continue;
    const key = stripProtocol(url);
    if (!map.has(key)) {
      map.set(key, {
        url,
        lastModified:
          entry && entry.lastModified ? String(entry.lastModified) : new Date().toISOString(),
        changeFrequency:
          entry && entry.changeFrequency ? String(entry.changeFrequency) : "weekly",
        priority: Number.isFinite(entry?.priority) ? Number(entry.priority) : 0.7,
      });
    } else {
      const prev = map.get(key);
      const newPriority = Number.isFinite(entry?.priority) ? entry.priority : prev.priority;
      const higherPriority = Math.max(prev.priority, newPriority);
      const prevDate = Date.parse(prev.lastModified || "");
      const newDate = Date.parse(entry?.lastModified || "");
      map.set(key, {
        ...prev,
        priority: higherPriority,
        lastModified:
          newDate > prevDate ? entry.lastModified : prev.lastModified,
        changeFrequency: entry?.changeFrequency || prev.changeFrequency,
      });
    }
  }
  return Array.from(map.values());
}

async function fetchListingCanonicalEntries() {
  const data = await fetchGraphQL(
    `query SitemapListings {
      listings(pagination: { limit: -1 }, sort: "updatedAt:desc") {
        documentId
        title
        slug
        updatedAt
        publishedAt
        productDetails {
          stoneType { value id }
          style { value id }
          overallStyle { value id }
          slabStyle { value id }
        }
        branches(pagination: { limit: 1 }) {
          name
          location { town city province address }
        }
        company { slug name location }
      }
    }`
  );
  const rows = Array.isArray(data?.listings) ? data.listings : [];
  const entries = [];
  const seenCanonicalRoutes = new Map();
  for (const l of rows) {
    if (!l?.publishedAt) continue;
    if (!l?.documentId) continue;
    const canonicalRoute = buildListingCanonicalHref(l);
    if (!canonicalRoute) {
      const fallback = cleanListingSlug(l.slug, l.title);
      if (!fallback) continue;
      const lastMod = pickBestCanonicalDate([l.updatedAt, l.publishedAt]);
      const route = `/tombstones/${fallback}`;
      if (!seenCanonicalRoutes.has(route)) {
        seenCanonicalRoutes.set(route, lastMod || "");
        entries.push(buildSiteMapEntry(route, lastMod, "weekly", 0.75));
      }
      continue;
    }
    const lastMod = pickBestCanonicalDate([l.updatedAt, l.publishedAt]);
    const route = canonicalRoute;
    if (!seenCanonicalRoutes.has(route)) {
      seenCanonicalRoutes.set(route, lastMod || "");
      entries.push(buildSiteMapEntry(route, lastMod, "weekly", 0.8));
    } else {
      const prev = entries.find(
        (e) => e.url && new URL(e.url).pathname === route
      );
      if (prev) {
        const prevTs = Date.parse(prev.lastModified || "");
        const newTs = Date.parse(lastMod || "");
        if (newTs > prevTs) prev.lastModified = lastMod;
      }
    }
  }
  return entries;
}

async function fetchManufacturerCanonicalEntries() {
  const data = await fetchGraphQL(
    `query SitemapCompanies {
      companies(pagination: { limit: -1 }, sort: "updatedAt:desc") {
        documentId
        name
        slug
        updatedAt
        publishedAt
      }
    }`
  );
  const rows = Array.isArray(data?.companies) ? data.companies : [];
  const entries = [];
  for (const c of rows) {
    if (!c?.publishedAt) continue;
    if (!c?.name) continue;
    const slug = normalizeManufacturerSlug(c.slug || c.name);
    if (!slug) continue;
    const lastMod = pickBestCanonicalDate([c.updatedAt, c.publishedAt]);
    entries.push(buildSiteMapEntry(`/manufacturers/${slug}`, lastMod, "weekly", 0.8));
  }
  return entries;
}

async function fetchBlogPostCanonicalEntries() {
  const data = await fetchGraphQL(
    `query SitemapBlogs {
      blogPosts(pagination: { limit: -1 }, sort: "updatedAt:desc") {
        documentId
        slug
        title
        updatedAt
        publishedAt
      }
    }`
  );
  const rows = Array.isArray(data?.blogPosts) ? data.blogPosts : [];
  const entries = [];
  for (const p of rows) {
    if (!p?.publishedAt) continue;
    const rawSlug = typeof p?.slug === "string" ? p.slug.trim() : "";
    if (!rawSlug) continue;
    const slug = toSlugSegment(rawSlug);
    if (!slug) continue;
    const lastMod = pickBestCanonicalDate([p.updatedAt, p.publishedAt]);
    entries.push(buildSiteMapEntry(`/blogs/${slug}`, lastMod, "monthly", 0.6));
  }
  return entries;
}

async function fetchFaqCanonicalEntries() {
  const faqUrl = new URL(FAQS_LIVE_INDEX_URL);
  if (process.env.FAQS_LIVE_SITE_ID && String(process.env.FAQS_LIVE_SITE_ID).trim()) {
    faqUrl.searchParams.set("site", String(process.env.FAQS_LIVE_SITE_ID).trim());
  }
  let raw = null;
  try {
    const res = await fetch(faqUrl.toString(), {
      next: { revalidate: 15 },
      headers: { Accept: "application/json, text/html;q=0.9, */*;q=0.8" },
    });
    if (!res.ok) return [];
    raw = await res.text();
  } catch (_e) {
    return [];
  }
  if (!raw || !raw.trim()) return [];

  let payload = null;
  try {
    payload = JSON.parse(raw);
  } catch (_e) {
    payload = null;
  }

  const arrays = payload
    ? [
        Array.isArray(payload) ? payload : null,
        Array.isArray(payload?.data) ? payload.data : null,
        Array.isArray(payload?.items) ? payload.items : null,
        Array.isArray(payload?.faqs) ? payload.faqs : null,
        Array.isArray(payload?.list) ? payload.list : null,
        Array.isArray(payload?.categories) ? payload.categories : null,
        Array.isArray(payload?.pages) ? payload.pages : null,
        Array.isArray(payload?.entries) ? payload.entries : null,
        Array.isArray(payload?.attributes?.faqs) ? payload.attributes.faqs : null,
      ]
    : [];

  const flatRows = [];
  for (const arr of arrays) {
    if (!arr) continue;
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      const attrs = row.attributes || row;
      const slug = attrs.slug || attrs.canonicalSlug || row.slug || row.canonicalSlug || "";
      if (typeof slug === "string" && slug.trim()) {
        flatRows.push({
          slug: slug.trim(), // Keep exact slug string from Nick's API
          updatedAt:
            attrs.updatedAt || row.updatedAt || attrs.modifiedAt || row.modifiedAt || null,
          publishedAt:
            attrs.publishedAt || row.publishedAt || attrs.createdAt || row.createdAt || null,
        });
      }
    }
  }

  const entries = [];
  const dedupe = new Set();
  for (const row of flatRows) {
    const exactSlug = row.slug;
    if (!exactSlug) continue;
    if (dedupe.has(exactSlug)) continue;
    dedupe.add(exactSlug);
    const lastMod = pickBestCanonicalDate([row.updatedAt, row.publishedAt]);
    entries.push(buildSiteMapEntry(`/faqs/${exactSlug}`, lastMod, "weekly", 0.7));
  }
  return entries;
}

async function fetchLocationCanonicalEntries() {
  const data = await fetchGraphQL(
    `query SitemapLocations {
      listingSearchLocationOptions {
        province
        cities { city }
      }
      locationLandingSeos(pagination: { limit: -1 }) {
        province
        locationType
        locationValue
        cityContext
        slug
        title
        updatedAt
        publishedAt
      }
    }`
  );

  const entries = [];
  const seenRoutes = new Set();
  const now = new Date().toISOString();

  const { provinceOptions, cityOptions } = (() => {
    const out = { provinceOptions: [], cityOptions: [] };
    const rows = Array.isArray(data?.listingSearchLocationOptions)
      ? data.listingSearchLocationOptions
      : [];
    for (const row of rows) {
      if (!row) continue;
      const province = typeof row.province === "string" ? row.province.trim() : "";
      const pSlug = toSlugSegment(province);
      if (pSlug) out.provinceOptions.push({ province, slug: pSlug });
      for (const city of Array.isArray(row.cities) ? row.cities : []) {
        const cityName = typeof city?.city === "string" ? city.city.trim() : "";
        const cSlug = toSlugSegment(cityName);
        if (cSlug) out.cityOptions.push({ province, city: cityName, slug: cSlug });
      }
    }
    return out;
  })();

  for (const p of provinceOptions) {
    // Province aggregate landing page (not a scoped listing URL)
    const route = `/tombstones/${p.slug}`;
    if (seenRoutes.has(route)) continue;
    seenRoutes.add(route);
    entries.push(buildSiteMapEntry(route, now, "weekly", 0.7));
  }

  for (const c of cityOptions) {
    // City aggregate landing page (not a scoped listing URL)
    const route = `/tombstones/${c.slug}`;
    if (seenRoutes.has(route)) continue;
    seenRoutes.add(route);
    entries.push(buildSiteMapEntry(route, now, "weekly", 0.65));
  }

  const seoRows = Array.isArray(data?.locationLandingSeos) ? data.locationLandingSeos : [];
  for (const row of seoRows) {
    if (!row) continue;
    const explicitSlug = typeof row.slug === "string" ? row.slug.trim() : "";
    const lastMod = pickBestCanonicalDate([row.updatedAt, row.publishedAt]) || now;
    if (explicitSlug) {
      const absolute = explicitSlug.startsWith("http")
        ? explicitSlug
        : explicitSlug.startsWith("/")
          ? `${SITE_URL}${explicitSlug}`
          : `${SITE_URL}/${explicitSlug}`;
      try {
        const canonicalPath = new URL(absolute).pathname;
        const canonicalRoute = stripTrailingSlash(canonicalPath);
        const key = canonicalRoute;
        if (!seenRoutes.has(key)) {
          seenRoutes.add(key);
          entries.push(buildSiteMapEntry(canonicalRoute, lastMod, "weekly", 0.7));
        }
        continue;
      } catch (_e) {
        // fall through to segment-based build
      }
    }
    const province = typeof row.province === "string" ? row.province.trim() : "";
    const city = typeof row.cityContext === "string" ? row.cityContext.trim() : "";
    const type = typeof row.locationType === "string" ? row.locationType.trim() : "";
    const value = typeof row.locationValue === "string" ? row.locationValue.trim() : "";
    const segments = [province, city, type === "town" ? value : ""].filter(Boolean);
    if (!segments.length) continue;
    const segmentsSlug = segments.map((s) => toSlugSegment(s)).filter(Boolean);
    if (!segmentsSlug.length) continue;
    const route = `/locations/${segmentsSlug.join("/")}`;
    if (seenRoutes.has(route)) continue;
    seenRoutes.add(route);
    entries.push(buildSiteMapEntry(route, lastMod, "weekly", 0.75));
  }
  return entries;
}

async function fetchServicesHubCanonicalEntries() {
  const servicesHubRoutes = [
    { route: "/services/insights", priority: 0.7 },
    { route: "/services/guides", priority: 0.7 },
    { route: "/services/blogs", priority: 0.7 },
    { route: "/services/tombstone-finance/insights", priority: 0.65 },
    { route: "/services/tombstone-finance/guides", priority: 0.65 },
    { route: "/services/tombstone-finance/blogs", priority: 0.65 },
    { route: "/services/installation-guide/insights", priority: 0.65 },
    { route: "/services/installation-guide/guides", priority: 0.65 },
    { route: "/services/installation-guide/blogs", priority: 0.65 },
    { route: "/services/life-insurance/insights", priority: 0.65 },
    { route: "/services/life-insurance/guides", priority: 0.65 },
    { route: "/services/life-insurance/blogs", priority: 0.65 },
  ];
  const now = new Date().toISOString();
  const baseEntries = servicesHubRoutes
    .filter((r) => isServicesAllowedByRobots(r.route) && !isRobotsDisallowed(r.route))
    .map(({ route, priority }) => buildSiteMapEntry(route, now, "weekly", priority));

  let dynamicEntries = [];
  try {
    const d = await fetchGraphQL(
      `query SitemapServiceBlogs {
        serviceArticles: blogPosts(
          pagination: { limit: -1 }
          sort: "updatedAt:desc"
        ) {
          documentId
          slug
          title
          category
          section
          updatedAt
          publishedAt
        }
      }`
    );
    const rows = Array.isArray(d?.serviceArticles) ? d.serviceArticles : [];
    for (const p of rows) {
      if (!p?.publishedAt) continue;
      if (!p?.slug) continue;
      const slug = toSlugSegment(p.slug);
      if (!slug) continue;
      const sectionRaw =
        (typeof p?.section === "string" && p.section.trim()) ||
        (typeof p?.category === "string" && p.category.trim()) ||
        "";
      const section = sectionRaw.toLowerCase();
      const serviceSlugs = [
        "tombstone-finance",
        "installation-guide",
        "life-insurance",
      ];
      const matchedService = serviceSlugs.find((s) => section.includes(s));
      const hub = section.includes("guide")
        ? "guides"
        : section.includes("insight")
          ? "insights"
          : "blogs";
      const lastMod = pickBestCanonicalDate([p.updatedAt, p.publishedAt]);
      if (matchedService) {
        dynamicEntries.push(
          buildSiteMapEntry(`/services/${matchedService}/${hub}/${slug}`, lastMod, "weekly", 0.65)
        );
      } else {
        dynamicEntries.push(
          buildSiteMapEntry(`/services/${hub}/${slug}`, lastMod, "weekly", 0.65)
        );
      }
    }
  } catch (_e) {
    // No services-specific blog schema detected; skip dynamic
  }
  return [...baseEntries, ...dynamicEntries];
}

export default async function sitemap() {
  const staticEntries = coreRoutes.map((r) => {
    if (r === "/") return buildSiteMapEntry("/", new Date().toISOString(), "weekly", 1);
    if (r === "/tombstones-for-sale")
      return buildSiteMapEntry(r, new Date().toISOString(), "daily", 0.95);
    if (r === "/manufacturers")
      return buildSiteMapEntry(r, new Date().toISOString(), "weekly", 0.9);
    if (r === "/blogs") return buildSiteMapEntry(r, new Date().toISOString(), "weekly", 0.75);
    if (r === "/faqs") return buildSiteMapEntry(r, new Date().toISOString(), "weekly", 0.7);
    return buildSiteMapEntry(r, new Date().toISOString(), "monthly", 0.6);
  });

  const [
    listingEntries,
    manufacturerEntries,
    blogEntries,
    faqEntries,
    locationEntries,
    servicesHubEntries,
  ] = await Promise.all([
    fetchListingCanonicalEntries(),
    fetchManufacturerCanonicalEntries(),
    fetchBlogPostCanonicalEntries(),
    fetchFaqCanonicalEntries(),
    fetchLocationCanonicalEntries(),
    fetchServicesHubCanonicalEntries(),
  ]);

  const all = [
    ...staticEntries,
    ...listingEntries,
    ...manufacturerEntries,
    ...blogEntries,
    ...faqEntries,
    ...locationEntries,
    ...servicesHubEntries,
  ];

  const final = safeSitemapEntries(all);

  const sorted = final.slice().sort((a, b) => {
    const p = (b.priority || 0) - (a.priority || 0);
    if (p !== 0) return p;
    const d = Date.parse(b.lastModified || "") - Date.parse(a.lastModified || "");
    if (!Number.isNaN(d) && d !== 0) return d;
    return String(a.url || "").localeCompare(String(b.url || ""));
  });

  return sorted;
}
