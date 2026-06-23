import ManufacturersClient from "./manufacturers-client";
import { fetchGraphQL } from "@/lib/serverGraphql";

async function fetchManufacturers() {
  const data = await fetchGraphQL(
    `
      query ManufacturersSeoIndex {
        companies(pagination: { limit: 100 }) {
          documentId
          updatedAt
          name
          phone
          googleRating
          location
          latitude
          longitude
          description
          logoUrl
          logoUrlPublicId
          bannerAdUrl
          bannerAdPublicId
          bannerAd { url }
          branches { documentId }
          operatingHours { id monToFri saturday sunday publicHoliday }
          socialLinks { id facebook website instagram tiktok youtube x whatsapp messenger }
          packageType
          isFeatured
          listings(pagination: { limit: 100 }) {
            documentId
          }
        }
      }
    `,
    {},
    300
  );

  return Array.isArray(data?.companies) ? data.companies : [];
}

async function fetchManufacturerSeoSlugMap() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
    const url = new URL(`${baseUrl}/manufacturer-seo-pages`);
    url.searchParams.set("pagination[page]", "1");
    url.searchParams.set("pagination[pageSize]", "500");
    ["documentId", "companyName", "slug"].forEach((field, index) => {
      url.searchParams.set(`fields[${index}]`, field);
    });

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return {};
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const nextMap = {};

    for (const row of rows) {
      const attrs = row?.attributes || row || {};
      const documentId =
        typeof attrs?.documentId === "string"
          ? attrs.documentId.trim()
          : typeof row?.documentId === "string"
            ? row.documentId.trim()
            : "";
      const slug =
        typeof attrs?.slug === "string"
          ? attrs.slug.trim()
          : typeof row?.slug === "string"
            ? row.slug.trim()
            : "";
      if (documentId && slug) nextMap[documentId] = slug;
    }

    return nextMap;
  } catch {
    return {};
  }
}

export default async function ManufacturersPage() {
  const [initialCompanies, initialManufacturerSeoSlugMap] = await Promise.all([
    fetchManufacturers(),
    fetchManufacturerSeoSlugMap(),
  ]);

  return (
    <>
      <h1 className="sr-only">Tombstone Manufacturers in South Africa</h1>
      <ManufacturersClient
        initialCompanies={initialCompanies}
        initialManufacturerSeoSlugMap={initialManufacturerSeoSlugMap}
      />
    </>
  );
}
