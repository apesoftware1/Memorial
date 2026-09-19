import {
  normalizeListingSlug,
  cleanListingSlug,
  buildListingCanonicalSlug,
  extractUrlTownSegment,
  listingAvailableAtTown,
  buildAllCanonicalSlugsForListing,
  normalizeTownCompare,
} from "@/lib/slugs";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

export function toAbsoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function withSearchParams(pathname: string, searchParams: { [key: string]: string | string[] | undefined } | null | undefined) {
  if (!searchParams) return pathname;
  const entries = Object.entries(searchParams).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (!entries.length) return pathname;
  const params = new URLSearchParams();
  for (const [k, v] of entries) {
    if (Array.isArray(v)) {
      for (const item of v) params.append(k, item);
    } else if (typeof v === "string") {
      params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function normalizeLower(s: any): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

export function uniqStrings(list: unknown[]) {
  return Array.from(
    new Set(list.map((v) => String(v ?? "").trim()).filter(Boolean))
  );
}

export function coercePrice(value: unknown) {
  if (value == null) return null;
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]+/g, ""));
  return Number.isFinite(num) ? num : null;
}

export async function fetchGraphQL<TData>(query: string, variables: Record<string, unknown>, revalidate = 30) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return (json?.data as TData) ?? null;
}

export type LocationSeoPage = {
  name?: string;
  slug?: string;
  locationType?: string;
  locationValue?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  heroImage?: { url?: string } | null;
} | null;

export async function fetchLocationSeoPage(slug: string): Promise<LocationSeoPage> {
  const data = await fetchGraphQL<{
    locationSeoPageBySlug?: LocationSeoPage;
  }>(
    `
      query LocationSeoPageBySlug($slug: String!) {
        locationSeoPageBySlug(slug: $slug) {
          name
          slug
          locationType
          locationValue
          seoTitle
          seoDescription
          metaTitle
          metaDescription
          heroImage { url }
        }
      }
    `,
    { slug }
  );
  return (data?.locationSeoPageBySlug as LocationSeoPage) ?? null;
}

export async function fetchListingBySavedSlug(slug: string, companySlug?: string) {
  const companyFilter = companySlug ? `, company: { slug: { eqi: $companySlug } }` : "";
  const companyVar = companySlug ? `, $companySlug: String!` : "";
  const variables: any = { slug };
  if (companySlug) variables.companySlug = companySlug;
  const data = await fetchGraphQL<{ listings?: any[] }>(
    `
      query ListingBySavedSlug($slug: String!${companyVar}) {
        listings(filters: { slug: { eq: $slug }${companyFilter} }, pagination: { limit: 1 }) {
          documentId
          title
          mainImageUrl
          mainImagePublicId
          thumbnailUrls
          thumbnailPublicIds
          description
          price
          slug
          manufacturingTimeframe
          isOnSpecial
          specials {
            active
            sale_price
            start_date
            end_date
          }
          listing_category {
            documentId
            name
          }
          productDetails {
            id
            color { id value icon }
            style { id value icon }
            overallStyle { id value icon }
            stoneType { id value icon }
            slabStyle { id value icon }
            customization { id value icon }
          }
          additionalProductDetails {
            id
            transportAndInstallation { id value info }
            foundationOptions { id value info }
            warrantyOrGuarantee { id value info }
            installationGuarantee { id value info }
          }
          inquiries_c { documentId }
          branches(pagination: { limit: 25 }) {
            documentId
            name
            location {
              town
              city
              province
              address
            }
          }
          company {
            enableWhatsAppButton
            documentId
            slug
            phone
            name
            mapUrl
            location
            latitude
            longitude
            googleRating
            logoUrl
            logoUrlPublicId
            operatingHours {
              id
              monToFri
              saturday
              sunday
              publicHoliday
            }
            sales_reps {
              call
              whatsapp
              name
              avatar { url }
            }
            socialLinks {
              id
              facebook
              website
              instagram
              tiktok
              youtube
              x
              whatsapp
              messenger
            }
          }
        }
      }
    `,
    variables,
    300
  );
  return Array.isArray(data?.listings) && data.listings.length > 0 ? data.listings[0] : null;
}

export const LISTING_RESULT_FRAGMENT = `
  documentId
  title
  slug
  mainImageUrl
  thumbnailUrls
  thumbnailPublicIds
  description
  price
  manufacturingTimeframe
  isOnSpecial
  specials {
    active
    sale_price
    start_date
    end_date
  }
  listing_category {
    documentId
    name
  }
  productDetails {
    id
    color { id value icon }
    style { id value icon }
    overallStyle { id value icon }
    stoneType { id value icon }
    slabStyle { id value icon }
    customization { id value icon }
  }
  additionalProductDetails {
    id
    transportAndInstallation { id value info }
    foundationOptions { id value info }
    warrantyOrGuarantee { id value info }
    installationGuarantee { id value info }
  }
  inquiries_c { documentId }
  branches(pagination: { limit: 25 }) {
    documentId
    name
    location { town city province address }
  }
  company {
    enableWhatsAppButton
    documentId
    slug
    phone
    name
    mapUrl
    location
    latitude
    longitude
    googleRating
    logoUrl
    logoUrlPublicId
    operatingHours {
      id
      monToFri
      saturday
      sunday
      publicHoliday
    }
    sales_reps {
      call
      whatsapp
      name
      avatar { url }
    }
    socialLinks {
      id
      facebook
      website
      instagram
      tiktok
      youtube
      x
      whatsapp
      messenger
    }
  }
`;

export const PRODUCT_KEYWORDS = [
  "granite", "marble", "sandstone", "limestone", "slate", "travertine", "stone",
  "pillars", "pillar", "pillared", "column", "columns", "obelisk",
  "arch", "arched", "dome", "domed", "mausoleum", "teddybear", "teddy",
  "tombstone", "gravestone", "headstone", "memorial", "tomb",
  "executive", "heart", "book", "openbook", "classic", "modern",
  "double", "single", "family", "child", "infant", "pet",
  "standard", "premium", "luxury", "economy", "budget", "value",
];

export function extractListingNamePrefixes(normalized: string): string[] {
  if (!normalized) return [];
  const tokens = normalized.split("-").filter(Boolean);
  const stopIdx = tokens.findIndex((t) => PRODUCT_KEYWORDS.includes(t.toLowerCase()));
  const nameEndIdx = stopIdx === -1 ? Math.min(tokens.length, 5) : stopIdx;
  if (nameEndIdx <= 0) return [tokens[0] || ""].filter(Boolean);
  const variants: string[] = [];
  for (let len = nameEndIdx; len >= 1; len -= 1) {
    variants.push(tokens.slice(0, len).join("-"));
  }
  const compact = variants[0]?.replace(/-+/g, "") || "";
  if (compact && !variants.includes(compact)) variants.push(compact);
  const spaced = variants[0]?.replace(/-+/g, " ") || "";
  if (spaced && !variants.includes(spaced)) variants.push(spaced);
  return variants.filter(Boolean);
}

export function extractListingNamePrefix(normalized: string): string {
  return extractListingNamePrefixes(normalized)[0] || "";
}

export async function fetchListingsByTitleNormalized(normalizedTitle: string, companySlug?: string) {
  if (!normalizedTitle) return [];
  const dashToSpace = normalizedTitle.replace(/-+/g, " ");
  const companyFilter = companySlug ? `, company: { slug: { eqi: $companySlug } }` : "";
  const companyVar = companySlug ? `, $companySlug: String!` : "";
  const variables: any = { q: dashToSpace };
  if (companySlug) variables.companySlug = companySlug;
  const data = await fetchGraphQL<{ listings?: any[] }>(
    `
      query ListingsByTitleFragment($q: String!${companyVar}) {
        listings(filters: { title: { containsi: $q }${companyFilter} }, pagination: { limit: 20 }) {
          ${LISTING_RESULT_FRAGMENT}
        }
      }
    `,
    variables,
    300
  );
  return Array.isArray(data?.listings) ? data.listings : [];
}

export async function fetchListingsBySimplePrefixSearch(prefixes: string[], companySlug?: string) {
  const safe = Array.isArray(prefixes) ? prefixes.filter((p) => typeof p === "string" && p.length >= 1).slice(0, 6) : [];
  if (safe.length === 0) return [];
  const companyFilter = companySlug ? `, company: { slug: { eqi: $companySlug } }` : "";
  const companyVar = companySlug ? `, $companySlug: String!` : "";
  const bySlugEq: any[] = [];
  const byNameRows: any[] = [];
  for (const prefix of safe) {
    const dashToSpace = prefix.replace(/-+/g, " ");
    const compact = prefix.replace(/-+/g, "");
    const variables: any = { prefix, dashPrefix: dashToSpace, compact, slugEq: prefix };
    if (companySlug) variables.companySlug = companySlug;
    const data = await fetchGraphQL<{ bySlug?: any[]; byName?: any[] }>(
      `
        query ListingsBySimplePrefix($prefix: String!, $dashPrefix: String!, $compact: String!, $slugEq: String!${companyVar}) {
          bySlug: listings(filters: { slug: { eq: $slugEq }${companyFilter} }, pagination: { limit: 1 }) {
            ${LISTING_RESULT_FRAGMENT}
          }
          byName: listings(
            filters: {
              or: [
                { title: { containsi: $prefix } }
                { title: { containsi: $dashPrefix } }
                { title: { containsi: $compact } }
                { title: { startsWith: $dashPrefix } }
                { slug: { containsi: $prefix } }
                { slug: { startsWith: $prefix } }
                { slug: { containsi: $compact } }
                { slug: { startsWith: $compact } }
              ]${companySlug ? ", company: { slug: { eqi: $companySlug } }" : ""}
            },
            pagination: { limit: 20 },
            sort: "updatedAt:desc"
          ) {
            ${LISTING_RESULT_FRAGMENT}
          }
        }
      `,
      variables,
      300
    );
    if (Array.isArray(data?.bySlug)) bySlugEq.push(...data.bySlug);
    if (Array.isArray(data?.byName)) byNameRows.push(...data.byName);
  }
  const seen = new Set<string>();
  const merged: any[] = [];
  for (const row of [...bySlugEq, ...byNameRows]) {
    const key = String(row?.documentId || row?.id || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
}

export async function fetchListingsByNamePrefix(prefix: string, fullNormalized: string, companySlug?: string) {
  if (!prefix) return [];
  const prefixVariants = extractListingNamePrefixes(fullNormalized);
  const dashToSpace = prefix.replace(/-+/g, " ");
  const compact = prefix.replace(/-+/g, "");
  const variantsForGql = prefixVariants.length ? prefixVariants.slice(0, 4) : [prefix];
  const companyFilter = companySlug ? `, company: { slug: { eqi: $companySlug } }` : "";
  const companyVar = companySlug ? `, $companySlug: String!` : "";
  const variables: any = {
    prefix,
    dashPrefix: dashToSpace,
    compact,
    fullNormalized,
    p0: variantsForGql[0] || prefix,
    p1: variantsForGql[1] || prefix,
    p2: variantsForGql[2] || prefix,
    p3: variantsForGql[3] || prefix,
  };
  if (companySlug) variables.companySlug = companySlug;
  const data = await fetchGraphQL<{ bySlug?: any[]; byName?: any[] }>(
    `
      query ListingsByNamePrefix($prefix: String!, $dashPrefix: String!, $compact: String!, $fullNormalized: String!, $p0: String!, $p1: String!, $p2: String!, $p3: String!${companyVar}) {
        bySlug: listings(filters: { slug: { eq: $fullNormalized }${companyFilter} }, pagination: { limit: 1 }) {
          ${LISTING_RESULT_FRAGMENT}
        }
        byName: listings(
          filters: {
            or: [
              { title: { containsi: $prefix } }
              { title: { containsi: $dashPrefix } }
              { title: { containsi: $compact } }
              { title: { containsi: $p0 } }
              { title: { containsi: $p1 } }
              { title: { startsWith: $dashPrefix } }
              { title: { startsWith: $p0 } }
              { slug: { containsi: $prefix } }
              { slug: { startsWith: $prefix } }
              { slug: { containsi: $compact } }
              { slug: { containsi: $p0 } }
              { slug: { startsWith: $p0 } }
            ]${companySlug ? ", company: { slug: { eqi: $companySlug } }" : ""}
          },
          pagination: { limit: 30 },
          sort: "updatedAt:desc"
        ) {
          ${LISTING_RESULT_FRAGMENT}
        }
      }
    `,
    variables,
    300
  );
  const bySlug = Array.isArray(data?.bySlug) ? data.bySlug : [];
  const byName = Array.isArray(data?.byName) ? data.byName : [];
  const seen = new Set<string>();
  const merged: any[] = [];
  for (const row of [...bySlug, ...byName]) {
    const key = String(row?.documentId || row?.id || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
}

export function candidateMatchesAnyPrefix(candidate: any, prefixVariants: string[]): boolean {
  if (!candidate || !prefixVariants.length) return false;
  const cTitle = normalizeLower(candidate?.title ?? "");
  const cSlug = normalizeLower(candidate?.slug ?? "");
  const cCompact = (cTitle || cSlug).replace(/[\s-]+/g, "");
  return prefixVariants.some((p) => {
    const pLower = normalizeLower(p);
    const pCompact = pLower.replace(/[\s-]+/g, "");
    if (!pLower) return false;
    if (cTitle && (cTitle === pLower || cTitle.startsWith(pLower) || cTitle.includes(pLower))) return true;
    if (cSlug && (cSlug.startsWith(pLower) || cSlug.includes(pLower))) return true;
    if (pCompact && cCompact && (cCompact === pCompact || cCompact.startsWith(pCompact) || cCompact.includes(pCompact))) return true;
    return false;
  });
}

export function productSegmentsMatchNormalizedUrl(listing: any, normalized: string): boolean {
  if (!listing || !normalized) return false;
  const listingCanonical = normalizeListingSlug(buildListingCanonicalSlug(listing) || "");
  const listingClean = normalizeListingSlug(cleanListingSlug(listing?.slug, listing?.title) || "");
  if (listingCanonical === normalized || listingClean === normalized) return true;
  const urlTokens = normalized.split("-").filter(Boolean);
  const allListing = buildAllCanonicalSlugsForListing(listing);
  if (Array.isArray(allListing)) {
    for (const altSlug of allListing) {
      if (normalizeListingSlug(altSlug) === normalized) return true;
    }
  }
  const urlPrefix = extractListingNamePrefix(normalized);
  const lCanonicalPrefix = extractListingNamePrefix(listingCanonical);
  const lCleanPrefix = extractListingNamePrefix(listingClean);
  const matchPrefix =
    (urlPrefix && lCanonicalPrefix && urlPrefix === lCanonicalPrefix) ||
    (urlPrefix && lCleanPrefix && urlPrefix === lCleanPrefix);
  if (!matchPrefix) return false;
  const stone = normalizeLower(Array.isArray(listing?.productDetails?.stoneType) ? listing.productDetails.stoneType[0]?.value : "");
  const head = normalizeLower(
    (Array.isArray(listing?.productDetails?.style) ? listing.productDetails.style[0]?.value : "") ||
    (Array.isArray(listing?.productDetails?.overallStyle) ? listing.productDetails.overallStyle[0]?.value : "")
  );
  const coreTokens = [urlPrefix, stone, head].filter(Boolean);
  for (const tok of coreTokens) {
    if (!urlTokens.includes(tok)) {
      const compacted = tok.replace(/[\s-]+/g, "");
      const found = urlTokens.some((t) => t === compacted || t.startsWith(compacted) || compacted.startsWith(t));
      if (!found) return false;
    }
  }
  return true;
}

export function isListingMatchForUrl(
  listing: any,
  normalized: string,
  urlTown: string
): "strict" | "alternate" | "wrong-town" | "no-match" {
  if (!listing) return "no-match";
  const listingCanonical = normalizeListingSlug(buildListingCanonicalSlug(listing) || "");
  const listingClean = normalizeListingSlug(cleanListingSlug(listing?.slug, listing?.title) || "");
  if (listingCanonical === normalized || listingClean === normalized) return "strict";
  const allSlugs = buildAllCanonicalSlugsForListing(listing);
  if (Array.isArray(allSlugs) && allSlugs.some((s) => normalizeListingSlug(s) === normalized)) {
    return "alternate";
  }
  const productOk = productSegmentsMatchNormalizedUrl(listing, normalized);
  if (!productOk) return "no-match";
  if (!urlTown) return "alternate";
  const townOk = listingAvailableAtTown(listing, urlTown);
  if (townOk) return "alternate";
  return "wrong-town";
}

export async function fetchListingByCodePrefix(rawSlug: string, normalized: string, companySlug?: string) {
  if (!rawSlug || !normalized) return null;
  const tokens = normalized.split("-").filter(Boolean);
  const headToken = tokens[0] || "";
  if (!headToken) return null;
  const compact = headToken.replace(/[^a-z0-9]/g, "");
  const padded = headToken.replace(/([a-z]+)(\d+)/i, "$1 $2");
  const alnumOnly = normalized.replace(/[^a-z0-9]/g, "");
  const variants = [headToken, compact, padded].filter(Boolean);
  const uniqueVariants = Array.from(new Set(variants)).slice(0, 5);

  const orFilters: Record<string, any>[] = [
    { slug: { eq: normalized } },
    { slug: { startsWith: headToken } },
    { slug: { containsi: headToken } },
    { title: { startsWith: padded || headToken } },
    { title: { containsi: headToken } },
    { title: { containsi: compact } },
  ];
  // High-priority fallback: match extracted code-prefix against the
  // title and slug text fields (the CMS may embed product-code strings
  // like mfg44 or GCB8 inside title/slug even if no dedicated mfgCode
  // schema field exists).
  const orCodeFilters: Record<string, any>[] = [];
  for (const v of uniqueVariants) {
    orCodeFilters.push({ title: { containsi: v } });
  }
  orFilters.push(...orCodeFilters);
  for (const v of uniqueVariants) {
    orFilters.push({ slug: { eq: v } });
    orFilters.push({ slug: { containsi: v } });
    orFilters.push({ title: { containsi: v } });
  }
  if (alnumOnly && alnumOnly !== headToken) {
    orFilters.push({ slug: { containsi: alnumOnly } });
    orFilters.push({ title: { containsi: alnumOnly } });
  }
  // Try each head-segment as a potential documentId match (legacy URL format: /tombstones/{id}-...)
  orFilters.push({ documentId: { eq: headToken } });

  const companyFilterFragment = companySlug ? `, company: { slug: { eqi: $companySlug } }` : "";
  const companyVarFragment = companySlug ? `, $companySlug: String!` : "";
  const variables: any = { or: orFilters };
  if (companySlug) variables.companySlug = companySlug;
  const data = await fetchGraphQL<{ listings?: any[] }>(
    `
      query ListingByCodePrefix($or: [ListingFiltersInput]${companyVarFragment}) {
        listings(filters: { or: $or${companyFilterFragment} }, pagination: { page: 1, pageSize: 10 }, sort: "updatedAt:desc") {
          ${LISTING_RESULT_FRAGMENT}
        }
      }
    `,
    variables,
    300
  );
  const rows = Array.isArray(data?.listings) ? data.listings : [];
  if (!rows.length) return null;

  const urlTown = extractUrlTownSegment(normalized);
  // 1) Strict / alternate exact match
  for (const c of rows) {
    const check = isListingMatchForUrl(c, normalized, urlTown);
    if (check === "strict" || check === "alternate") return c;
    if (check === "wrong-town") {
      const canonical = buildListingCanonicalSlug(c) || cleanListingSlug(c.slug, c.title);
      return { __redirectSlug: canonical || null, listing: c };
    }
  }
  // 2) Fuzzy best-scored match inside these rows
  const allTokens = normalized.split("-").filter(Boolean);
  const headTokens = allTokens.slice(0, Math.min(5, allTokens.length));
  let best: any = null;
  let bestScore = 0;
  let bestWrongTown: any = null;
  let bestWrongTownScore = 0;
  const namePrefix = extractListingNamePrefix(normalized);
  for (const c of rows) {
    const cNorm = cleanListingSlug(c.slug, c.title);
    const canonical = buildListingCanonicalSlug(c);
    if (!cNorm && !canonical) continue;
    let score = 0;
    for (const t of allTokens) {
      if (cNorm && cNorm.includes(t)) score += 1;
      if (canonical && canonical.includes(t)) score += 1;
    }
    for (const t of headTokens) {
      const cTitle = normalizeLower(c?.title ?? c?.name ?? "");
      if (cTitle.includes(normalizeLower(t))) score += 2;
    }
    const cFirst = extractListingNamePrefix(cNorm || "");
    if (cFirst && cFirst === namePrefix) score += 5;
    const check = isListingMatchForUrl(c, normalized, urlTown);
    if (check === "wrong-town") {
      if (score > bestWrongTownScore) {
        bestWrongTownScore = score;
        bestWrongTown = c;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  const minScore = Math.max(2, Math.floor(Math.min(5, allTokens.length) * 0.5));
  if (bestScore >= minScore) {
    const bestCheck = isListingMatchForUrl(best, normalized, urlTown);
    if (bestCheck === "wrong-town" && bestWrongTown) {
      const c = bestWrongTown;
      const canonical = buildListingCanonicalSlug(c) || cleanListingSlug(c.slug, c.title);
      return { __redirectSlug: canonical || null, listing: c };
    }
    return best;
  }
  return null;
}

export async function fetchListingByNormalizedSlug(rawSlug: string, targetCompanySlug?: string) {
  const normalized = normalizeListingSlug(rawSlug);
  if (!normalized) return null;
  const urlTown = extractUrlTownSegment(normalized);
  console.log("[RESOLVER] rawSlug:", rawSlug, "normalized:", normalized, "urlTown:", JSON.stringify(urlTown), "targetCompanySlug:", targetCompanySlug || "(none)");

  const bySaved = await fetchListingBySavedSlug(normalized, targetCompanySlug);
  if (bySaved) {
    console.log("[RESOLVER] ✅ TIER 1 HIT (bySaved DB slug=normalized):", bySaved.documentId, bySaved.title || bySaved.name);
    return bySaved;
  }
  console.log("[RESOLVER] tier1 bySaved miss");

  const bySavedOriginal = await fetchListingBySavedSlug(rawSlug, targetCompanySlug);
  if (bySavedOriginal) {
    const target = cleanListingSlug(bySavedOriginal.slug, bySavedOriginal.title);
    console.log("[RESOLVER] ✅ TIER 2 HIT (bySaved rawSlug):", bySavedOriginal.documentId, bySavedOriginal.slug, bySavedOriginal.title || bySavedOriginal.name, "redirectTarget=", target);
    if (target && target !== normalized) {
      return { __redirectSlug: target, listing: bySavedOriginal };
    }
    return bySavedOriginal;
  }
  console.log("[RESOLVER] tier2 bySavedOriginal miss");

  // NEW TIER 2b — Code / Prefix lookup. Resolves mfg07-style prefixes when slug
  // column stores a different (non-prefixed) canonical slug.
  const byCodePrefix = await fetchListingByCodePrefix(rawSlug, normalized, targetCompanySlug);
  if (byCodePrefix) {
    if (typeof byCodePrefix === "object" && "__redirectSlug" in byCodePrefix) {
      console.log(
        "[RESOLVER] ✅ TIER 2b HIT (byCodePrefix redirect):",
        byCodePrefix.listing?.documentId,
        "-> canonical:",
        byCodePrefix.__redirectSlug
      );
      return byCodePrefix;
    }
    console.log("[RESOLVER] ✅ TIER 2b HIT (byCodePrefix direct):", byCodePrefix.documentId, byCodePrefix.title || byCodePrefix.name);
    return byCodePrefix;
  }
  console.log("[RESOLVER] tier2b byCodePrefix miss");

  const namePrefix = extractListingNamePrefix(normalized);
  const prefixVariants = extractListingNamePrefixes(normalized);
  console.log("[RESOLVER] namePrefix=", namePrefix, "prefixVariants=", JSON.stringify(prefixVariants));

  const prefixCandidates = namePrefix
    ? await fetchListingsByNamePrefix(namePrefix, normalized, targetCompanySlug)
    : [];
  console.log("[RESOLVER] tier3 prefixCandidates count=", prefixCandidates.length);
  for (const c of prefixCandidates) {
    const cNorm = cleanListingSlug(c.slug, c.title);
    const canonical = buildListingCanonicalSlug(c);
    const result = isListingMatchForUrl(c, normalized, urlTown);
    if (result === "strict" || result === "alternate") {
      console.log("[RESOLVER] ✅ TIER 3ab HIT (Option B " + result + "):", c.documentId, c.title || c.name, "canonical=", canonical);
      return c;
    }
    if (result === "wrong-town") {
      console.log("[RESOLVER] tier3 candidate prefix matches but town invalid:", c.documentId, "=> redirect to canonical:", canonical);
      return { __redirectSlug: canonical || cNorm || null, listing: c };
    }
  }
  for (const c of prefixCandidates) {
    if (candidateMatchesAnyPrefix(c, prefixVariants)) {
      const exact = isListingMatchForUrl(c, normalized, urlTown);
      if (exact === "wrong-town") {
        const canonical = buildListingCanonicalSlug(c) || cleanListingSlug(c.slug, c.title);
        console.log("[RESOLVER] tier3c candidateMatchesAnyPrefix but wrong town, redirect:", c.documentId, canonical);
        return { __redirectSlug: canonical || null, listing: c };
      }
      console.log("[RESOLVER] ✅ TIER 3c HIT (candidateMatchesAnyPrefix):", c.documentId, "title=", c.title, "slug=", c.slug, "matchQuality=", exact);
      return c;
    }
  }
  console.log("[RESOLVER] tier3 no exact/canonical/prefix match in candidates, pass thru to titleGql tier");

  const titleCandidates = await fetchListingsByTitleNormalized(normalized, targetCompanySlug);
  console.log("[RESOLVER] tier4 titleCandidates count=", titleCandidates.length);
  const titleSeen = new Set<string>();
  const combinedCandidates: any[] = [];
  for (const c of prefixCandidates) {
    const key = String(c?.documentId || c?.id || "");
    if (key) {
      titleSeen.add(key);
      combinedCandidates.push(c);
    }
  }
  for (const c of titleCandidates) {
    const key = String(c?.documentId || c?.id || "");
    if (!key || titleSeen.has(key)) continue;
    titleSeen.add(key);
    combinedCandidates.push(c);
  }
  console.log("[RESOLVER] combinedCandidates deduped count=", combinedCandidates.length);

  for (const c of combinedCandidates) {
    const cNorm = cleanListingSlug(c.slug, c.title);
    const canonical = buildListingCanonicalSlug(c);
    const result = isListingMatchForUrl(c, normalized, urlTown);
    if (result === "strict" || result === "alternate") {
      console.log("[RESOLVER] ✅ TIER 5ab HIT (Option B " + result + "):", c.documentId, c.title || c.name);
      return c;
    }
    if (result === "wrong-town") {
      console.log("[RESOLVER] tier5 product matches but town invalid; redirect to canonical:", c.documentId, canonical);
      return { __redirectSlug: canonical || cNorm || null, listing: c };
    }
  }
  console.log("[RESOLVER] tier5 combined exact/cleanSlug/canonical misses");

  let bestMatch: any = null;
  let bestScore = 0;
  let bestWrongTown: any = null;
  let bestWrongTownScore = 0;
  const allTokens = normalized.split("-").filter(Boolean);
  const headTokens = allTokens.slice(0, Math.min(5, allTokens.length));
  for (const c of combinedCandidates) {
    const cNorm = cleanListingSlug(c.slug, c.title);
    const canonical = buildListingCanonicalSlug(c);
    if (!cNorm && !canonical) continue;
    let score = 0;
    for (const t of allTokens) {
      if (cNorm && cNorm.includes(t)) score += 1;
      if (canonical && canonical.includes(t)) score += 1;
    }
    for (const t of headTokens) {
      const cTitle = normalizeLower(c?.title ?? c?.name ?? "");
      if (cTitle.includes(normalizeLower(t))) score += 2;
    }
    const cFirst = extractListingNamePrefix(cNorm || "");
    if (cFirst && cFirst === namePrefix) score += 5;
    const check = isListingMatchForUrl(c, normalized, urlTown);
    if (check === "wrong-town") {
      if (score > bestWrongTownScore) {
        bestWrongTownScore = score;
        bestWrongTown = c;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = c;
    }
  }
  const minTokens = Math.max(2, Math.floor(Math.min(5, allTokens.length) * 0.5));
  if (bestScore >= minTokens) {
    const bestCheck = isListingMatchForUrl(bestMatch, normalized, urlTown);
    if (bestCheck === "wrong-town" && bestWrongTown) {
      const c = bestWrongTown;
      const canonical = buildListingCanonicalSlug(c) || cleanListingSlug(c.slug, c.title);
      console.log("[RESOLVER] tier6 fuzzy matches product but invalid town; redirect to canonical:", c?.documentId, canonical);
      return { __redirectSlug: canonical || null, listing: c };
    }
    console.log("[RESOLVER] ✅ TIER 6 HIT (scored fuzzy bestMatch=", bestScore, ">= min=", minTokens, "):", bestMatch?.documentId, bestMatch?.title || bestMatch?.name || null);
    return bestMatch;
  }
  console.log("[RESOLVER] tier6 fuzzy FAILED: best=", bestScore, "min=", minTokens, "bestMatch docId=", bestMatch?.documentId || null);

  const fallbackPrefixes = prefixVariants.length ? prefixVariants : [namePrefix].filter(Boolean);
  if (fallbackPrefixes.length) {
    console.log("[RESOLVER] tier7 LAST RESORT: fetchListingsBySimplePrefixSearch(", JSON.stringify(fallbackPrefixes), ")");
    const lastResortCandidates = await fetchListingsBySimplePrefixSearch(fallbackPrefixes, targetCompanySlug);
    console.log("[RESOLVER] tier7 lastResortCandidates count=", lastResortCandidates.length);
    for (const c of lastResortCandidates) {
      const cNorm = cleanListingSlug(c.slug, c.title);
      const canonical = buildListingCanonicalSlug(c);
      const result = isListingMatchForUrl(c, normalized, urlTown);
      if (result === "strict" || result === "alternate") {
        console.log("[RESOLVER] ✅ TIER 7ab HIT (Option B " + result + "):", c.documentId, c.title || c.name);
        return c;
      }
      if (result === "wrong-town") {
        console.log("[RESOLVER] tier7 product matches but town invalid; redirect to canonical:", c.documentId, canonical);
        return { __redirectSlug: canonical || cNorm || null, listing: c };
      }
    }
    for (const c of lastResortCandidates) {
      if (candidateMatchesAnyPrefix(c, fallbackPrefixes)) {
        const exact = isListingMatchForUrl(c, normalized, urlTown);
        if (exact === "wrong-town") {
          const canonical = buildListingCanonicalSlug(c) || cleanListingSlug(c.slug, c.title);
          console.log("[RESOLVER] tier7c candidateMatchesAnyPrefix but wrong town; redirect:", c.documentId, canonical);
          return { __redirectSlug: canonical || null, listing: c };
        }
        console.log("[RESOLVER] ✅ TIER 7c HIT (last-resort candidateMatchesAnyPrefix):", c.documentId, c.title, c.slug);
        return c;
      }
    }
    console.log("[RESOLVER] tier7 last-resort had", lastResortCandidates.length, "candidates but none matched prefix/title/slug");
  }

  console.log("[RESOLVER] ❌ ALL 7 TIERS FAILED — returning null → 404 notFound()");
  return null;
}

export async function fetchListingsByIds(ids: string[]) {
  if (!ids.length) return [];
  const data = await fetchGraphQL<{
    listings?: any[];
  }>(
    `
      query ListingsByDocumentIds($ids: [ID], $pageSize: Int = 48) {
        listings(filters: { documentId: { in: $ids } }, pagination: { page: 1, pageSize: $pageSize }, sort: "documentId:asc") {
          documentId
          title
          price
          isFeatured
          listing_category { documentId name }
          mainImageUrl
          thumbnailUrls
          thumbnailPublicIds
          adFlasher
          adFlasherColor
          productDetails {
            id
            color { id value }
            style { id value }
            overallStyle { id value }
            stoneType { id value }
            slabStyle { id value }
            customization { id value }
          }
          additionalProductDetails {
            id
            transportAndInstallation { id value }
            foundationOptions { id value }
            warrantyOrGuarantee { id value }
            installationGuarantee { id value }
          }
          branches(pagination: { limit: -1 }) {
            documentId
            name
            location {
              town
              city
              province
              address
            }
          }
          company {
            documentId
            slug
            name
            location
            logoUrl
            hideStandardCompanyLogo
            latitude
            longitude
          }
        }
      }
    `,
    { ids, pageSize: Math.min(ids.length, 48) }
  );

  return Array.isArray(data?.listings) ? data.listings : [];
}

export async function fetchListingCategories() {
  const data = await fetchGraphQL<{
    listingCategories?: any[];
  }>(
    `
      query LocationListingCategories($pageSize: Int = 50) {
        listingCategories(pagination: { page: 1, pageSize: $pageSize }) {
          documentId
          name
          icon
          slug
          order
          imageUrl
          imagePublicId
        }
      }
    `,
    { pageSize: 50 }
  );
  return Array.isArray(data?.listingCategories) ? data.listingCategories : [];
}

export async function fetchLocationListingIdsBySeo(locationType: string, locationValue: string) {
  const type = normalizeLower(locationType);
  const value = typeof locationValue === "string" ? locationValue.trim() : "";
  const token = `|${value.toLowerCase()}|`;
  const field =
    type === "province" ? "provinces" : type === "city" ? "cities" : type === "town" ? "towns" : null;

  if (!field || !value) return { ids: [] as string[], total: 0 };

  const filters = {
    and: [
      { published: { eq: true } },
      { is_on_special: { eq: false } },
      { [field]: { contains: token } },
    ],
  };

  const data = await fetchGraphQL<{
    listingSearchIndices_connection?: {
      nodes?: { listing_document_id?: string }[];
      pageInfo?: { total?: number };
    };
  }>(
    `
      query LocationIndex($filters: ListingSearchIndexFiltersInput, $page: Int = 1, $pageSize: Int = 20) {
        listingSearchIndices_connection(filters: $filters, pagination: { page: $page, pageSize: $pageSize }) {
          nodes { listing_document_id }
          pageInfo { total page pageSize pageCount }
        }
      }
    `,
    { filters, page: 1, pageSize: 20 }
  );

  const nodes = data?.listingSearchIndices_connection?.nodes || [];
  const total = data?.listingSearchIndices_connection?.pageInfo?.total ?? 0;
  const ids = uniqStrings(nodes.map((n) => n?.listing_document_id).filter(Boolean));
  return { ids, total };
}
