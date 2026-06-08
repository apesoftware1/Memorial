import { notFound } from "next/navigation";
import TombstonesForSaleClient from "../../tombstones-for-sale/for-sale-client";

const TombstonesForSaleClientAny = TombstonesForSaleClient as unknown as (props: any) => any;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function toAbsoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function normalizeLower(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function uniqStrings(list: unknown[]) {
  return Array.from(
    new Set(list.map((v) => String(v ?? "").trim()).filter(Boolean))
  );
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
  const slug = (await params)?.slug;
  if (!slug) return {};

  const canonical = toAbsoluteUrl(`/tombstones/${slug}`);
  const seoPage = await fetchLocationSeoPage(slug);
  if (!seoPage) return {};

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

export default async function LocationTombstonesPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params)?.slug;
  if (!slug) notFound();

  const canonical = toAbsoluteUrl(`/tombstones/${slug}`);

  const seoPage = await fetchLocationSeoPage(slug);
  if (!seoPage) notFound();

  const locationType = typeof seoPage?.locationType === "string" ? seoPage.locationType : "";
  const locationValue = typeof seoPage?.locationValue === "string" ? seoPage.locationValue : "";

  const [categories, locationIndex] = await Promise.all([
    fetchListingCategories(),
    fetchLocationListingIdsBySeo(locationType, locationValue),
  ]);

  const { ids, total } = locationIndex;
  const listings = await fetchListingsByIds(ids);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      (typeof seoPage?.seoTitle === "string" && seoPage.seoTitle.trim()) ||
      (typeof seoPage?.name === "string" && seoPage.name.trim()) ||
      `Tombstones in ${slug}`,
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
