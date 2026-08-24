import { notFound, permanentRedirect } from "next/navigation";
import TombstonesForSaleClient from "../../tombstones-for-sale/for-sale-client";
import ProductShowcase from "@/components/product-showcase";

const TombstonesForSaleClientAny = TombstonesForSaleClient as unknown as (props: any) => any;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function toAbsoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function normalizeListingSlug(raw: unknown) {
  const decoded = decodeURIComponent(typeof raw === "string" ? raw : "");
  return decoded
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanListingSlug(slug: unknown, title: unknown) {
  const rawSlug = typeof slug === "string" ? slug.trim() : "";
  if (!rawSlug) return normalizeListingSlug(title);
  const stripped = rawSlug.replace(/(-copy-[a-z0-9]+)+/gi, "").trim();
  if (!stripped || /^[-]*$/.test(stripped)) return normalizeListingSlug(title);
  return normalizeListingSlug(stripped);
}

function normalizeLower(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function uniqStrings(list: unknown[]) {
  return Array.from(
    new Set(list.map((v) => String(v ?? "").trim()).filter(Boolean))
  );
}

function coercePrice(value: unknown) {
  if (value == null) return null;
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]+/g, ""));
  return Number.isFinite(num) ? num : null;
}

async function fetchGraphQL<TData>(query: string, variables: Record<string, unknown>, revalidate = 3600) {
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

type LocationSeoPage = {
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

async function fetchLocationSeoPage(slug: string): Promise<LocationSeoPage> {
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

async function fetchListingBySavedSlug(slug: string) {
  const data = await fetchGraphQL<{ listings?: any[] }>(
    `
      query ListingBySavedSlug($slug: String!) {
        listings(filters: { slug: { eq: $slug } }, pagination: { limit: 1 }) {
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
          }
          company {
            enableWhatsAppButton
            documentId
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
    { slug },
    300
  );
  return Array.isArray(data?.listings) && data.listings.length > 0 ? data.listings[0] : null;
}

async function fetchListingsByTitleNormalized(normalizedTitle: string) {
  if (!normalizedTitle) return [];
  const dashToSpace = normalizedTitle.replace(/-+/g, " ");
  const data = await fetchGraphQL<{ listings?: any[] }>(
    `
      query ListingsByTitleFragment($q: String!) {
        listings(filters: { title: { containsi: $q } }, pagination: { limit: 20 }) {
          documentId
          title
          slug
          mainImageUrl
          thumbnailUrls
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
          }
          company {
            enableWhatsAppButton
            documentId
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
    { q: dashToSpace },
    300
  );
  return Array.isArray(data?.listings) ? data.listings : [];
}

async function fetchListingByNormalizedSlug(rawSlug: string) {
  const normalized = normalizeListingSlug(rawSlug);
  if (!normalized) return null;

  const bySaved = await fetchListingBySavedSlug(normalized);
  if (bySaved) return bySaved;

  const bySavedOriginal = await fetchListingBySavedSlug(rawSlug);
  if (bySavedOriginal) {
    const target = cleanListingSlug(bySavedOriginal.slug, bySavedOriginal.title);
    if (target && target !== normalized) {
      return { __redirectSlug: target, listing: bySavedOriginal };
    }
    return bySavedOriginal;
  }

  const candidates = await fetchListingsByTitleNormalized(normalized);
  let bestMatch: any = null;
  let bestScore = 0;
  for (const c of candidates) {
    const cNorm = cleanListingSlug(c.slug, c.title);
    if (!cNorm) continue;
    if (cNorm === normalized) {
      return c;
    }
    let score = 0;
    const tokens = normalized.split("-").filter(Boolean);
    for (const t of tokens) {
      if (cNorm.includes(t)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = c;
    }
  }
  const minTokens = Math.max(2, Math.floor(normalized.split("-").filter(Boolean).length * 0.6));
  return bestScore >= minTokens ? bestMatch : null;
}

async function fetchListingsByIds(ids: string[]) {
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
          company {
            documentId
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

async function fetchListingCategories() {
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

async function fetchLocationListingIdsBySeo(locationType: string, locationValue: string) {
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const rawSlug = (await params)?.slug;
  if (!rawSlug) {
    return {
      title: "Tombstones | TombstoneFinder",
      description: "Browse tombstones by province, city or town in South Africa.",
      robots: { index: true, follow: true },
    };
  }

  const canonical = toAbsoluteUrl(`/tombstones/${rawSlug}`);
  const normalized = normalizeListingSlug(rawSlug);
  if (normalized && rawSlug !== normalized) {
    const cleanCanonical = toAbsoluteUrl(`/tombstones/${normalized}`);
    permanentRedirect(`/tombstones/${normalized}`);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  const seoPage = await fetchLocationSeoPage(rawSlug);
  if (seoPage) {
    const titleRaw =
      (typeof seoPage?.metaTitle === "string" && seoPage.metaTitle.trim()) ||
      (typeof seoPage?.seoTitle === "string" && seoPage.seoTitle.trim()) ||
      "";
    const descriptionRaw =
      (typeof seoPage?.metaDescription === "string" && seoPage.metaDescription.trim()) ||
      (typeof seoPage?.seoDescription === "string" && seoPage.seoDescription.trim()) ||
      "";
    const heroUrl = typeof seoPage?.heroImage?.url === "string" ? seoPage.heroImage.url.trim() : "";

    return {
      title: titleRaw || undefined,
      description: descriptionRaw || undefined,
      robots: { index: true, follow: true },
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title: titleRaw || undefined,
        description: descriptionRaw || undefined,
        images: heroUrl ? [heroUrl] : undefined,
      },
    };
  }

  const listingResolved = await fetchListingByNormalizedSlug(rawSlug);
  const listing: any =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).listing
      : listingResolved;
  const redirectSlug =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).__redirectSlug
      : null;

  if (!listing) {
    return {
      title: "Not Found | TombstoneFinder",
      description: "This page could not be found, or is no longer available.",
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  if (redirectSlug) {
    const cleanCanonical = toAbsoluteUrl(`/tombstones/${redirectSlug}`);
    permanentRedirect(`/tombstones/${redirectSlug}`);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  const canonicalListingSlug = cleanListingSlug(listing.slug, listing.title);
  const listingCanonical = canonicalListingSlug
    ? toAbsoluteUrl(`/tombstones/${canonicalListingSlug}`)
    : canonical;

  if (canonicalListingSlug && normalized !== canonicalListingSlug) {
    permanentRedirect(`/tombstones/${canonicalListingSlug}`);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: listingCanonical },
      robots: { index: true, follow: true },
    };
  }

  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 6)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);

  const title = listing?.title ? `${listing.title} | Tombstones For Sale` : "Tombstone Listing";
  const description =
    listing?.description || "View this tombstone listing, pricing and branch availability.";
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  return {
    title,
    description,
    alternates: { canonical: listingCanonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: listingCanonical,
      title,
      description,
      images: images.length ? images : undefined,
      siteName: "TombstoneFinder",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    },
    other: {
      "product:price:amount": coercePrice(listing?.price) ?? undefined,
      "product:price:currency": "ZAR",
      "product:brand": sellerName || undefined,
      "product:category": categoryName || undefined,
      "product:material": stoneType || undefined,
      "og:image:alt": title,
    },
  };
}

export default async function LocationTombstonesPage({ params }: { params: Promise<{ slug: string }> }) {
  const rawSlug = (await params)?.slug;
  if (!rawSlug) notFound();

  const normalized = normalizeListingSlug(rawSlug);
  if (normalized && rawSlug !== normalized) {
    permanentRedirect(`/tombstones/${normalized}`);
  }

  const seoPage = await fetchLocationSeoPage(normalized || rawSlug);
  if (seoPage) {
    const locationType = typeof seoPage?.locationType === "string" ? seoPage.locationType : "";
    const locationValue = typeof seoPage?.locationValue === "string" ? seoPage.locationValue : "";

    const [categories, locationIndex] = await Promise.all([
      fetchListingCategories(),
      fetchLocationListingIdsBySeo(locationType, locationValue),
    ]);

    const { ids, total } = locationIndex;
    const listings = await fetchListingsByIds(ids);
    const canonical = toAbsoluteUrl(`/tombstones/${normalized || rawSlug}`);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name:
        (typeof seoPage?.seoTitle === "string" && seoPage.seoTitle.trim()) ||
        (typeof seoPage?.name === "string" && seoPage.name.trim()) ||
        `Tombstones in ${normalized || rawSlug}`,
      url: canonical,
      numberOfItems: typeof total === "number" ? total : listings.length,
      itemListElement: listings.slice(0, 10).map((l: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: toAbsoluteUrl(`/tombstones-for-sale/${l.documentId}`),
        name: String(l?.title ?? "").trim() || undefined,
      })),
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <TombstonesForSaleClientAny
          initialListings={listings}
          initialCategories={categories}
          initialFilters={{ location: locationValue || null }}
          initialTotalCount={typeof total === "number" ? total : null}
          disableLocationUrlSync={true}
          forcedLocationSeo={{ locationType, locationValue }}
          seoTitle={seoPage?.seoTitle || null}
          seoDescription={seoPage?.seoDescription || null}
          seoHeroImageUrl={seoPage?.heroImage?.url || null}
        />
      </>
    );
  }

  const listingResolved = await fetchListingByNormalizedSlug(normalized || rawSlug);
  const listing: any =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).listing
      : listingResolved;
  const redirectSlug =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).__redirectSlug
      : null;

  if (!listing) notFound();

  if (redirectSlug) {
    permanentRedirect(`/tombstones/${redirectSlug}`);
  }

  const canonicalListingSlug = cleanListingSlug(listing.slug, listing.title);
  if (canonicalListingSlug && normalized !== canonicalListingSlug) {
    permanentRedirect(`/tombstones/${canonicalListingSlug}`);
  }

  const canonical = canonicalListingSlug
    ? toAbsoluteUrl(`/tombstones/${canonicalListingSlug}`)
    : toAbsoluteUrl(`/tombstones-for-sale/${listing.documentId || rawSlug}`);
  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 8)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);
  const price = coercePrice(listing?.price);
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: String(listing?.title ?? "").trim() || `Tombstone ${listing.documentId || rawSlug}`,
    description: String(listing?.description ?? "").trim() || undefined,
    image: images.length ? images : undefined,
    sku: String(listing.documentId || rawSlug),
    category: categoryName,
    material: stoneType,
    brand: sellerName ? { "@type": "Organization", name: sellerName } : undefined,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "ZAR",
      price: price ?? undefined,
      availability: "https://schema.org/InStock",
      seller: sellerName ? { "@type": "Organization", name: sellerName } : undefined,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductShowcase listing={listing} id={listing.documentId} onNavigate={undefined as any} />
    </>
  );
}
