import ManufacturersClient from "./manufacturers-client";
import { fetchGraphQL } from "@/lib/serverGraphql";

async function fetchManufacturers() {
  const PAGE_SIZE_COMPANIES = 100;

  const companyQuery = `
    query ManufacturersSeoIndexPaginated($pageSize: Int!, $page: Int!) {
      companies_connection(
        pagination: { page: $page, pageSize: $pageSize }
      ) {
        nodes {
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
          branches(pagination: { page: 1, pageSize: 200 }) { documentId }
          operatingHours { id monToFri saturday sunday publicHoliday }
          socialLinks { id facebook website instagram tiktok youtube x whatsapp messenger }
          packageType
          isFeatured
          listings(pagination: { page: 1, pageSize: 1000 }) {
            documentId
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
  `;

  const listingsCountQuery = `
    query ListingCountByCompanyScoped($pageSize: Int!, $page: Int!, $companyDocId: ID!) {
      listings_connection(
        pagination: { page: $page, pageSize: $pageSize }
        filters: { company: { documentId: { eq: $companyDocId } } }
      ) {
        pageInfo {
          page
          pageSize
          pageCount
          total
        }
      }
    }
  `;

  const firstCompanies = await fetchGraphQL(companyQuery, { page: 1, pageSize: PAGE_SIZE_COMPANIES }, 300);

  const mergeDedupe = (acc, nodes) => {
    const arr = Array.isArray(nodes) ? nodes : [];
    const seen = acc._seen || new Set();
    const list = acc._nodes || [];
    for (const n of arr) {
      const id = String(n?.documentId ?? "");
      if (id && !seen.has(id)) {
        seen.add(id);
        list.push(n);
      }
    }
    return { _seen: seen, _nodes: list };
  };

  const companiesConn = firstCompanies?.companies_connection || {};
  const companiesPageInfo = companiesConn.pageInfo || null;
  const companiesPageCount = Number.isFinite(Number(companiesPageInfo?.pageCount))
    ? Number(companiesPageInfo.pageCount)
    : 1;
  let cAcc = mergeDedupe({}, companiesConn.nodes);
  if (companiesPageCount > 1) {
    const pages = [];
    for (let p = 2; p <= companiesPageCount; p++) pages.push(p);
    const rest = await Promise.all(
      pages.map((page) =>
        fetchGraphQL(companyQuery, { page, pageSize: PAGE_SIZE_COMPANIES }, 300).then(
          (res) => res?.companies_connection?.nodes || []
        )
      )
    );
    for (const batch of rest) cAcc = mergeDedupe(cAcc, batch);
  }

  const allCompanies = Array.isArray(cAcc._nodes) ? cAcc._nodes : [];

  const scopedCounts = {};
  if (allCompanies.length > 0) {
    const countPromises = allCompanies
      .filter(c => c && typeof c === "object" && c.documentId)
      .map(company =>
        fetchGraphQL(
          listingsCountQuery,
          { page: 1, pageSize: 1, companyDocId: company.documentId },
          300
        )
          .then(res => {
            const total = Number(res?.listings_connection?.pageInfo?.total);
            if (Number.isFinite(total)) {
              scopedCounts[company.documentId] = total;
            }
          })
          .catch(() => {})
      );
    await Promise.all(countPromises);
  }

  return allCompanies
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const nestedLen = Array.isArray(c.listings) ? c.listings.length : 0;
      const scopedCount = Number.isFinite(Number(scopedCounts[c.documentId]))
        ? Number(scopedCounts[c.documentId])
        : 0;
      const listingCount = Math.max(scopedCount, nestedLen);
      return { ...c, listingCount };
    });
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

    const res = await fetch(url.toString(), { next: { revalidate: 15 } });
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
