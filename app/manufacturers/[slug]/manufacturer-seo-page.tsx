import { notFound, redirect } from "next/navigation";
import ManufacturerProfileClient from "../manufacturers-Profile-Page/[slug]/manufacturer-profile-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

type ManufacturerSeoPage = {
  documentId?: string;
  companyName?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  rating?: string | number;
  companyLogo?: { url?: string } | null;
  branches?: Array<{
    city?: string;
    province?: string;
    town?: string;
  }>;
} | null;

function toAbsoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function fetchGraphQL<TData>(query: string, variables: Record<string, unknown>) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return (json?.data as TData) ?? null;
}

async function fetchManufacturerSeoPage(slug: string): Promise<ManufacturerSeoPage> {
  const data = await fetchGraphQL<{
    manufacturerSeoPageBySlug?: ManufacturerSeoPage;
  }>(
    `
      query ManufacturerSeoPageBySlug($slug: String!) {
        manufacturerSeoPageBySlug(slug: $slug) {
          documentId
          companyName
          slug
          seoTitle
          seoDescription
          metaTitle
          metaDescription
          rating
          companyLogo {
            url
          }
          branches {
            city
            province
            town
          }
        }
      }
    `,
    { slug }
  );

  return data?.manufacturerSeoPageBySlug ?? null;
}

async function fetchCompanyAndListings(documentId: string) {
  const data = await fetchGraphQL<{
    companies?: any[];
    listings?: any[];
  }>(
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
          pagination: { limit: 100 }
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

  const company = Array.isArray(data?.companies) ? data?.companies?.[0] : null;
  const listings = Array.isArray(data?.listings) ? data?.listings : [];
  return { company, listings };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const rawSlug = (await params)?.slug;
  if (rawSlug && (rawSlug.includes(" ") || rawSlug.includes("%20"))) {
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/\s+/g, "-");
    redirect(`/manufacturers/${cleanSlug}`);
  }
  const slug = rawSlug;
  if (!slug) return {};

  const seoPage = await fetchManufacturerSeoPage(slug);
  if (!seoPage) return {};

  const canonical = toAbsoluteUrl(`/manufacturers/${slug}`);
  const title =
    (typeof seoPage?.metaTitle === "string" && seoPage.metaTitle.trim()) ||
    (typeof seoPage?.seoTitle === "string" && seoPage.seoTitle.trim()) ||
    (typeof seoPage?.companyName === "string" && seoPage.companyName.trim()) ||
    "Manufacturer | TombstoneFinder";
  const description =
    (typeof seoPage?.metaDescription === "string" && seoPage.metaDescription.trim()) ||
    (typeof seoPage?.seoDescription === "string" && seoPage.seoDescription.trim()) ||
    undefined;
  const image = typeof seoPage?.companyLogo?.url === "string" ? seoPage.companyLogo.url.trim() : "";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ManufacturerSeoProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const rawSlug = (await params)?.slug;
  if (rawSlug && (rawSlug.includes(" ") || rawSlug.includes("%20"))) {
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/\s+/g, "-");
    redirect(`/manufacturers/${cleanSlug}`);
  }
  const slug = rawSlug;
  if (!slug) notFound();

  const seoPage = await fetchManufacturerSeoPage(slug);
  if (!seoPage?.documentId) notFound();

  const { company, listings } = await fetchCompanyAndListings(seoPage.documentId);
  if (!company) notFound();

  const canonical = toAbsoluteUrl(`/manufacturers/${slug}`);
  const logoUrl =
    (typeof seoPage?.companyLogo?.url === "string" && seoPage.companyLogo.url.trim()) ||
    (typeof company?.logoUrl === "string" && company.logoUrl.trim()) ||
    undefined;
  const ratingValue = Number(seoPage?.rating ?? company?.googleRating);
  const branches = Array.isArray(seoPage?.branches) ? seoPage.branches : [];
  const website =
    (typeof company?.socialLinks?.website === "string" && company.socialLinks.website.trim()) || canonical;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name:
      (typeof seoPage?.companyName === "string" && seoPage.companyName.trim()) ||
      (typeof company?.name === "string" && company.name.trim()) ||
      undefined,
    url: canonical,
    image: logoUrl,
    sameAs: website && website !== canonical ? [website] : undefined,
    aggregateRating: Number.isFinite(ratingValue)
      ? {
          "@type": "AggregateRating",
          ratingValue,
          bestRating: 5,
        }
      : undefined,
    areaServed: branches
      .map((branch) => {
        const city = typeof branch?.city === "string" ? branch.city.trim() : "";
        const province = typeof branch?.province === "string" ? branch.province.trim() : "";
        const town = typeof branch?.town === "string" ? branch.town.trim() : "";
        if (!city && !province && !town) return null;
        return {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: town || city || undefined,
            addressRegion: province || undefined,
            addressCountry: "ZA",
          },
        };
      })
      .filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ManufacturerProfileClient company={company} listings={listings} isFullLoaded={true} />
    </>
  );
}
