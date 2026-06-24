import { notFound } from "next/navigation";
import ManufacturerProfileClient from "./manufacturer-profile-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

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

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export async function generateMetadata({ params }) {
  const documentId = (await params)?.slug;
  if (!documentId) return {};

  const { company } = await fetchCompanyAndListings(documentId);
  if (!company) {
    return {
      title: "Manufacturer Not Found | TombstoneFinder",
      alternates: { canonical: toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${documentId}`) },
    };
  }

  const name = String(company?.name ?? "").trim();
  const location = String(company?.location ?? "").trim();
  const title = name ? `${name}${location ? ` | ${location}` : ""} | TombstoneFinder` : "Manufacturer | TombstoneFinder";
  const description =
    String(company?.description ?? "").trim() ||
    (location ? `View tombstones and prices from ${name} in ${location}.` : `View tombstones and prices from ${name}.`);
  const canonical = toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${documentId}`);
  const image = typeof company?.logoUrl === "string" && company.logoUrl.trim() ? company.logoUrl.trim() : null;

  return {
    title,
    description,
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
  const documentId = (await params)?.slug;
  if (!documentId) notFound();

  const { company, listings } = await fetchCompanyAndListings(documentId);
  if (!company) notFound();

  const canonical = toAbsoluteUrl(`/manufacturers/manufacturers-Profile-Page/${documentId}`);
  const name = String(company?.name ?? "").trim() || `Manufacturer ${documentId}`;
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
