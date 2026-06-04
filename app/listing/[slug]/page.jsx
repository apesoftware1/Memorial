import ProductShowcase from '@/components/product-showcase';
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
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

async function fetchListingBySlug(slug) {
  const data = await fetchGraphQL(
    `
      query ListingBySlugSeo($slug: String!) {
        listings(filters: { slug: { eq: $slug } }, pagination: { limit: 1 }) {
          documentId
          title
          description
          price
          slug
          mainImageUrl
          thumbnailUrls
          isOnSpecial
          specials { active sale_price start_date end_date }
          listing_category { documentId name }
          productDetails {
            id
            stoneType { id value }
            style { id value }
            overallStyle { id value }
            color { id value }
          }
          company { documentId name location }
        }
      }
    `,
    { slug }
  );
  return Array.isArray(data?.listings) ? data.listings[0] : null;
}

function uniqStrings(list) {
  return Array.from(
    new Set(
      (Array.isArray(list) ? list : [])
        .map((v) => String(v ?? "").trim())
        .filter(Boolean)
    )
  );
}

function coercePrice(value) {
  if (value == null) return null;
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]+/g, ""));
  return Number.isFinite(num) ? num : null;
}

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  if (!slug) return {};

  const listing = await fetchListingBySlug(slug);
  if (!listing) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      alternates: { canonical: toAbsoluteUrl(`/listing/${slug}`) },
    };
  }

  const documentId = listing?.documentId;
  const canonical = documentId ? toAbsoluteUrl(`/tombstones-for-sale/${documentId}`) : toAbsoluteUrl(`/listing/${slug}`);
  const titleRaw = String(listing?.title ?? "").trim();
  const title = titleRaw ? `${titleRaw} | TombstoneFinder` : "Tombstone Listing | TombstoneFinder";
  const description = String(listing?.description ?? "").trim() || "View pricing and details for this tombstone.";
  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 6)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "product",
      url: canonical,
      title,
      description,
      images,
    },
  };
}

export default async function ListingPage({ params }) {
  const slug = params?.slug;
  if (!slug) notFound();

  const listing = await fetchListingBySlug(slug);
  if (!listing) notFound();

  const documentId = listing?.documentId;
  const canonical = documentId ? toAbsoluteUrl(`/tombstones-for-sale/${documentId}`) : toAbsoluteUrl(`/listing/${slug}`);
  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 8)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);
  const price = coercePrice(listing?.price);
  const sellerName = String(listing?.company?.name ?? "").trim();
  const categoryName =
    String(listing?.listing_category?.name ?? listing?.listing_category?.[0]?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: String(listing?.title ?? "").trim() || `Tombstone ${documentId || slug}`,
    description: String(listing?.description ?? "").trim() || undefined,
    image: images.length ? images : undefined,
    sku: String(documentId || slug),
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
      <ProductShowcase listing={listing} id={documentId} />
    </>
  );
}
