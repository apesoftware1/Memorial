import { notFound, permanentRedirect } from "next/navigation";
import ManufacturerProfileClient from "./manufacturer-profile-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
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
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return json?.data ?? null;
}

async function fetchCompanyAndListings(documentId) {
  const data = await fetchGraphQL(
    `
      query CompanySeo($documentId: ID!) {
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
          branches(pagination: { limit: -1 }) {
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
        listings(
          filters: { company: { documentId: { eq: $documentId } } }
          pagination: { limit: -1 }
        ) {
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
          branches(pagination: { limit: -1 }) {
            documentId
            name
            location { province city town }
          }
          branch_listings(pagination: { limit: -1 }) {
            branch { documentId location { province city town } }
            price
          }
        }
      }
    `,
    { documentId }
  );

  const company = Array.isArray(data?.companies) ? data.companies[0] : null;
  const listings = Array.isArray(data?.listings) ? data.listings : [];
  return { company, listings };
}

const PHONE_SLUG_RE = /^\d{7,15}$/;

async function resolveCompanyDocIdToSeoSlug(companyDocumentId) {
  const seoData = await fetchGraphQL(
    `query SeoByCompany($companyId: ID!) {
      manufacturerSeoPages(filters: { documentId: { eq: $companyId } }, pagination: { limit: 1 }) {
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
  return directSeoSlug;
}

export async function generateMetadata({ params }) {
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
    permanentRedirect(`/manufacturers/${seoRedirectSlug}`);
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

export default async function ManufacturerProfilePage({ params }) {
  const rawSlug = (await params)?.slug;
  if (!rawSlug) notFound();

  const seoRedirectSlug = await resolveDocIdOrPhoneToSeoSlug(rawSlug);
  if (seoRedirectSlug) {
    permanentRedirect(`/manufacturers/${seoRedirectSlug}`);
  }

  const { company, listings } = await fetchCompanyAndListings(rawSlug);
  if (!company) notFound();

  const canonical = toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${rawSlug}`);
  const name = String(company?.name ?? "").trim() || `Manufacturer ${rawSlug}`;
  const telephone = String(company?.phone ?? "").trim() || undefined;
  const logoUrl = typeof company?.logoUrl === "string" && company.logoUrl.trim() ? company.logoUrl.trim() : undefined;

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
      <ManufacturerProfileClient company={company} listings={listings} isFullLoaded={true} />
    </>
  );
}
