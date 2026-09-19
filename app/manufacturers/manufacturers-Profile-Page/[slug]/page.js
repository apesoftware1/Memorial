import { notFound, permanentRedirect } from "next/navigation";
import ManufacturerProfileClient from "./manufacturer-profile-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function withSearchParams(pathname, searchParams) {
  if (!searchParams) return pathname;
  const entries = Object.entries(searchParams).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (!entries.length) return pathname;
  const params = new URLSearchParams();
  for (const [k, v] of entries) {
    if (Array.isArray(v)) {
      for (const item of v) params.append(k, item);
    } else {
      params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function normalizeManufacturerSlug(raw) {
  const decoded = decodeURIComponent(raw);
  return decoded
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

async function fetchGraphQL(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return json?.data ?? null;
}

async function fetchCompanyAndListings(documentId) {
  const PAGE_SIZE = 100;
  const initial = await fetchGraphQL(
    `
      query CompanySeoPaginated1($documentId: ID!, $pageSize: Int!, $page: Int!) {
        companies(filters: { documentId: { eq: $documentId } }) {
          documentId
          updatedAt
          profilePicUrl
          profilePicPublicId
          name
          phone
          googleRating
          location
          latitude
          longitude
          description
          logoUrl
          bannerAdUrl
          videoUrl
          branches(pagination: { page: 1, pageSize: 200 }) {
            documentId
            name
            location {
              address
              latitude
              longitude
              mapUrl
            }
          }
          operatingHours {
            id
            monToFri
            saturday
            sunday
            publicHoliday
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
          packageType
          isFeatured
        }
        listings_connection(
          filters: { company: { documentId: { eq: $documentId } } }
          pagination: { page: $page, pageSize: $pageSize }
        ) {
          nodes {
            documentId
            updatedAt
            title
            slug
            price
            adFlasher
            adFlasherColor
            isFeatured
            isOnSpecial
            isPremium
            isStandard
            manufacturingTimeframe
            mainImageUrl
            thumbnailUrls
            listing_category { documentId name }
            productDetails {
              id
              stoneType { id value }
              style { id value }
              overallStyle { id value }
              color { id value }
            }
            branches(pagination: { page: 1, pageSize: 200 }) {
              documentId
              name
              location { province city town }
            }
            branch_listings(pagination: { page: 1, pageSize: 500 }) {
              branch { documentId location { province city town } }
              price
            }
          }
          pageInfo {
            page
            pageSize
            pageCount
            total
          }
        }
      }
    `,
    { documentId, page: 1, pageSize: PAGE_SIZE }
  );

  const company = Array.isArray(initial?.companies) ? initial.companies[0] : null;
  const nodes = Array.isArray(initial?.listings_connection?.nodes) ? initial.listings_connection.nodes : [];
  const pageInfo = initial?.listings_connection?.pageInfo || null;
  const pageCount = Number.isFinite(Number(pageInfo?.pageCount)) ? Number(pageInfo.pageCount) : 1;
  const total = Number.isFinite(Number(pageInfo?.total)) ? Number(pageInfo.total) : nodes.length;

  const seenIds = new Set();
  const listings = [];
  for (const node of nodes) {
    const id = String(node?.documentId ?? "");
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      listings.push(node);
    }
  }

  if (pageCount > 1) {
    const pages = [];
    for (let p = 2; p <= pageCount; p++) pages.push(p);
    const remainder = await Promise.all(
      pages.map((page) =>
        fetchGraphQL(
          `
            query CompanySeoPaginatedRest($documentId: ID!, $pageSize: Int!, $page: Int!) {
              listings_connection(
                filters: { company: { documentId: { eq: $documentId } } }
                pagination: { page: $page, pageSize: $pageSize }
              ) {
                nodes {
                  documentId
                  updatedAt
                  title
                  slug
                  price
                  adFlasher
                  adFlasherColor
                  isFeatured
                  isOnSpecial
                  isPremium
                  isStandard
                  manufacturingTimeframe
                  mainImageUrl
                  thumbnailUrls
                  listing_category { documentId name }
                  productDetails {
                    id
                    stoneType { id value }
                    style { id value }
                    overallStyle { id value }
                    color { id value }
                  }
                  branches(pagination: { page: 1, pageSize: 200 }) {
                    documentId
                    name
                    location { province city town }
                  }
                  branch_listings(pagination: { page: 1, pageSize: 500 }) {
                    branch { documentId location { province city town } }
                    price
                  }
                }
              }
            }
          `,
          { documentId, page, pageSize: PAGE_SIZE }
        ).then((res) => (Array.isArray(res?.listings_connection?.nodes) ? res.listings_connection.nodes : []))
      )
    );
    for (const batch of remainder) {
      for (const node of batch) {
        const id = String(node?.documentId ?? "");
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          listings.push(node);
        }
      }
    }
  }

  if (company) {
    company.totalListingCount = Number.isFinite(total) ? total : listings.length;
  }
  return { company, listings, totalListingCount: Number.isFinite(total) ? total : listings.length };
}

const PHONE_SLUG_RE = /^\d{7,15}$/;

async function resolveCompanyDocIdToSeoSlug(companyDocumentId) {
  const seoData = await fetchGraphQL(
    `query SeoByCompany($companyId: ID!) {
      manufacturerSeoPages(filters: { company: { documentId: { eq: $companyId } } }, pagination: { limit: 1 }) {
        slug
      }
    }`,
    { companyId: companyDocumentId }
  );
  const row = Array.isArray(seoData?.manufacturerSeoPages) && seoData.manufacturerSeoPages.length > 0
    ? seoData.manufacturerSeoPages[0]
    : null;
  if (!row?.slug || typeof row.slug !== "string" || row.slug.trim() === "") return null;
  const normalized = normalizeManufacturerSlug(row.slug);
  return normalized || null;
}

async function resolvePhoneToSeoSlug(rawSlug) {
  if (!PHONE_SLUG_RE.test(rawSlug)) return null;
  const companyData = await fetchGraphQL(
    `query CompanyByPhone($phone: String!) {
      companies(filters: { phone: { eq: $phone } }, pagination: { limit: 1 }) {
        documentId
        phone
      }
    }`,
    { phone: rawSlug }
  );
  const company = Array.isArray(companyData?.companies) && companyData.companies.length > 0
    ? companyData.companies[0]
    : null;
  if (!company?.documentId) return null;
  return resolveCompanyDocIdToSeoSlug(company.documentId);
}

async function resolveDocIdOrPhoneToSeoSlug(rawSlug) {
  const phoneRedirect = await resolvePhoneToSeoSlug(rawSlug);
  if (phoneRedirect) return phoneRedirect;

  const directSeoSlug = await resolveCompanyDocIdToSeoSlug(rawSlug);
  if (directSeoSlug) return directSeoSlug;

  const { company } = await fetchCompanyAndListings(rawSlug);
  if (company?.name) {
    return normalizeManufacturerSlug(company.name);
  }

  return null;
}

export async function generateMetadata({ params, searchParams }) {
  const rawSlug = (await params)?.slug;
  if (!rawSlug) {
    return {
      title: "Manufacturer Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }

  const seoRedirectSlug = await resolveDocIdOrPhoneToSeoSlug(rawSlug);
  if (seoRedirectSlug) {
    const cleanCanonical = toAbsoluteUrl(`/manufacturers/${seoRedirectSlug}`);
    permanentRedirect(withSearchParams(`/manufacturers/${seoRedirectSlug}`, searchParams));
    return {
      title: "Manufacturer Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  const { company } = await fetchCompanyAndListings(rawSlug);
  if (!company) {
    return {
      title: "Manufacturer Not Found | TombstoneFinder",
      description: "This manufacturer page could not be found, or is no longer available.",
      alternates: { canonical: toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${rawSlug}`) },
      robots: { index: true, follow: true },
    };
  }

  const name = String(company?.name ?? "").trim();
  const location = String(company?.location ?? "").trim();
  const title = name ? `${name}${location ? ` | ${location}` : ""} | TombstoneFinder` : "Manufacturer | TombstoneFinder";
  const description =
    String(company?.description ?? "").trim() ||
    (location ? `View tombstones and prices from ${name} in ${location}.` : `View tombstones and prices from ${name}.`);
  const canonical = toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${rawSlug}`);
  const image = typeof company?.logoUrl === "string" && company.logoUrl.trim() ? company.logoUrl.trim() : null;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ManufacturerProfilePage({ params, searchParams }) {
  const rawSlug = (await params)?.slug;
  if (!rawSlug) notFound();

  const seoRedirectSlug = await resolveDocIdOrPhoneToSeoSlug(rawSlug);
  if (seoRedirectSlug) {
    permanentRedirect(withSearchParams(`/manufacturers/${seoRedirectSlug}`, searchParams));
  }

  const { company, listings, totalListingCount: paginatedTotal } = await fetchCompanyAndListings(rawSlug);
  if (!company) notFound();

  const canonical = toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${rawSlug}`);
  const name = String(company?.name ?? "").trim() || `Manufacturer ${rawSlug}`;
  const telephone = String(company?.phone ?? "").trim() || undefined;
  const logoUrl = typeof company?.logoUrl === "string" && company.logoUrl.trim() ? company.logoUrl.trim() : undefined;
  const nestedListingsLen = Array.isArray(listings) ? listings.length : 0;
  const totalListingCount = Math.max(
    Number.isFinite(Number(paginatedTotal)) ? Number(paginatedTotal) : 0,
    Number.isFinite(Number(company?.totalListingCount)) ? Number(company.totalListingCount) : 0,
    nestedListingsLen
  );

  const lat = Number(company?.latitude);
  const lng = Number(company?.longitude);
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url: canonical,
    image: logoUrl,
    telephone,
    address: company?.location
      ? { "@type": "PostalAddress", streetAddress: String(company.location).trim(), addressCountry: "ZA" }
      : undefined,
    geo: hasGeo ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ManufacturerProfileClient
        company={company}
        listings={listings}
        isFullLoaded={true}
        totalListingCount={totalListingCount}
      />
    </>
  );
}
