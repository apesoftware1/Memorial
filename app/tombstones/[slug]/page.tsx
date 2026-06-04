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

function toSlug(value: unknown) {
  const base = normalizeLower(value);
  if (!base) return "";
  return base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function packedTokenVariants(raw: string) {
  const base = normalizeLower(raw);
  if (!base) return [] as string[];
  const kebab = base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const variants = new Set([base, kebab]);
  return Array.from(variants)
    .filter(Boolean)
    .map((v) => `|${v}|`);
}

function uniqStrings(list: unknown[]) {
  return Array.from(
    new Set(list.map((v) => String(v ?? "").trim()).filter(Boolean))
  );
}

function titleCaseFromSlug(slug: string) {
  const words = slug
    .split("-")
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" ");
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

async function fetchLocationListingIds(slug: string) {
  const fromSlug = packedTokenVariants(slug);
  const fromSpaced = packedTokenVariants(slug.replace(/-/g, " "));
  const tokens = uniqStrings([...fromSlug, ...fromSpaced]);

  const or = tokens.flatMap((tok) => [
    { provinces: { contains: tok } },
    { cities: { contains: tok } },
    { towns: { contains: tok } },
  ]);
  const filters = {
    and: [{ published: { eq: true } }, { is_on_special: { eq: false } }, { or }],
  };

  const data = await fetchGraphQL<{
    listingSearchIndices_connection?: {
      nodes?: { listing_document_id?: string }[];
      pageInfo?: { total?: number };
    };
  }>(
    `
      query LocationIndex($filters: ListingSearchIndexFiltersInput, $page: Int = 1, $pageSize: Int = 24) {
        listingSearchIndices_connection(filters: $filters, pagination: { page: $page, pageSize: $pageSize }) {
          nodes { listing_document_id }
          pageInfo { total page pageSize pageCount }
        }
      }
    `,
    { filters, page: 1, pageSize: 48 }
  );

  const nodes = data?.listingSearchIndices_connection?.nodes || [];
  const total = data?.listingSearchIndices_connection?.pageInfo?.total ?? null;
  const ids = uniqStrings(nodes.map((n) => n?.listing_document_id).filter(Boolean));
  return { ids, total };
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

async function fetchEncodedLocationSelection(slug: string) {
  const data = await fetchGraphQL<{
    listingSearchLocationOptions?: Array<{
      province?: string;
      cities?: Array<{ city?: string; towns?: Array<{ town?: string }> }>;
    }>;
  }>(
    `
      query LocationOptions {
        listingSearchLocationOptions {
          province
          cities {
            city
            towns {
              town
            }
          }
        }
      }
    `,
    {}
  );

  const options = Array.isArray(data?.listingSearchLocationOptions) ? data.listingSearchLocationOptions : [];
  for (const prov of options) {
    const provinceName = typeof prov?.province === "string" ? prov.province : "";
    if (provinceName && toSlug(provinceName) === slug) {
      return { encoded: `p|${provinceName}`, label: provinceName };
    }
    const cities = Array.isArray(prov?.cities) ? prov.cities : [];
    for (const c of cities) {
      const cityName = typeof c?.city === "string" ? c.city : "";
      if (cityName && toSlug(cityName) === slug) {
        return { encoded: `c|${provinceName}|${cityName}`, label: cityName };
      }
      const towns = Array.isArray(c?.towns) ? c.towns : [];
      for (const t of towns) {
        const townName = typeof t?.town === "string" ? t.town : "";
        if (townName && toSlug(townName) === slug) {
          return { encoded: `t|${provinceName}|${cityName}|${townName}`, label: townName };
        }
      }
    }
  }

  return { encoded: null as string | null, label: titleCaseFromSlug(slug) };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params?.slug;
  if (!slug) return {};

  const locationName = titleCaseFromSlug(slug);
  const canonical = toAbsoluteUrl(`/tombstones/${slug}`);

  return {
    title: `Premium Tombstones for Sale in ${locationName} | Compare Local Prices`,
    description: `Browse tombstones for sale in ${locationName}. Compare styles, stone types, and pricing from local manufacturers across South Africa.`,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `Tombstones in ${locationName} | TombstoneFinder`,
      description: `Browse tombstones for sale in ${locationName}. Compare prices and local manufacturers.`,
    },
  };
}

export default async function LocationTombstonesPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug;
  if (!slug) notFound();

  const locationName = titleCaseFromSlug(slug);
  const canonical = toAbsoluteUrl(`/tombstones/${slug}`);

  const [selection, categories, locationIndex] = await Promise.all([
    fetchEncodedLocationSelection(slug),
    fetchListingCategories(),
    fetchLocationListingIds(slug),
  ]);

  const { ids, total } = locationIndex;
  if (!ids.length) notFound();

  const listings = await fetchListingsByIds(ids);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Tombstones for Sale in ${locationName}`,
    url: canonical,
    numberOfItems: typeof total === "number" ? total : listings.length,
    itemListElement: listings.slice(0, 10).map((l: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: toAbsoluteUrl(`/tombstones-for-sale/${l.documentId}`),
      name: String(l?.title ?? "").trim() || undefined,
    })),
  };

  const initialFilters = selection?.encoded ? { location: [selection.encoded] } : { location: null };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TombstonesForSaleClientAny
        initialListings={listings}
        initialCategories={categories}
        initialFilters={initialFilters}
        disableLocationUrlSync={true}
      />
    </>
  );
}
