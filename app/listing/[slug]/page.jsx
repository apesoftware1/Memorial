import ProductShowcase from '@/components/product-showcase';
import { notFound, permanentRedirect } from "next/navigation";
import { normalizeListingSlug, cleanListingSlug, buildListingCanonicalHref } from "@/lib/slugs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function fetchGraphQL(query, variables, revalidate = 30) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return json?.data ?? null;
}

async function fetchListingById(documentID) {
  const data = await fetchGraphQL(
    `
      query ListingFast($documentID: ID!) {
        listing(documentId: $documentID) {
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
            slug
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
    { documentID },
    300
  );

  return data?.listing || null;
}

async function fetchListingBySavedSlug(slug) {
  const data = await fetchGraphQL(
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
            slug
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

function deriveCleanSlug(listing) {
  return cleanListingSlug(listing?.slug, listing?.title);
}

function buildQueryStringPreserve(searchParams) {
  const params = new URLSearchParams();
  if (typeof searchParams?.company === "string" && searchParams.company.trim()) {
    params.set("company", searchParams.company.trim());
  }
  if (typeof searchParams?.branch === "string" && searchParams.branch.trim()) {
    params.set("branch", searchParams.branch.trim());
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

function appendQueryToPath(path, queryString) {
  if (!queryString) return path;
  const [existingPath, existingQuery = ""] = path.split("#")[0].split("?");
  const outParams = new URLSearchParams(existingQuery || "");
  new URLSearchParams(queryString.replace(/^\?/, "")).forEach((v, k) => {
    outParams.set(k, v);
  });
  const q = outParams.toString();
  return `${existingPath}${q ? `?${q}` : ""}`;
}

async function resolveListingCanonicalSlug(rawParam) {
  const raw = typeof rawParam === "string" ? rawParam.trim() : "";
  if (!raw) return { listing: null, cleanSlug: null };

  const paramLooksLikeDocId = /^[a-z0-9]{20,30}$/i.test(raw);

  let listing = null;
  if (!paramLooksLikeDocId) {
    listing = await fetchListingBySavedSlug(raw);
  }
  if (!listing && paramLooksLikeDocId) {
    listing = await fetchListingById(raw);
  }
  if (!listing && !paramLooksLikeDocId) {
    listing = await fetchListingById(raw);
  }

  if (!listing) return { listing: null, cleanSlug: null };

  const cleanSlug = deriveCleanSlug(listing);
  return { listing, cleanSlug: cleanSlug || null };
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

export async function generateMetadata({ params, searchParams }) {
  const slug = (await params)?.slug;
  if (!slug) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }

  const queryString = buildQueryStringPreserve(searchParams);

  const { listing, cleanSlug } = await resolveListingCanonicalSlug(slug);
  if (!listing) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      alternates: { canonical: toAbsoluteUrl(appendQueryToPath(`/listing/${slug}`, queryString)) },
      robots: { index: true, follow: true },
    };
  }

  const normalizedRaw = normalizeListingSlug(slug);
  const scopedHref = buildListingCanonicalHref(listing);
  if (scopedHref && normalizedRaw !== cleanSlug) {
    const target = appendQueryToPath(scopedHref, queryString);
    const scopedCanonical = toAbsoluteUrl(target);
    permanentRedirect(target);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: scopedCanonical },
      robots: { index: true, follow: true },
    };
  }
  if (scopedHref && cleanSlug) {
    const target = appendQueryToPath(scopedHref, queryString);
    const scopedCanonical = toAbsoluteUrl(target);
    permanentRedirect(target);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: scopedCanonical },
      robots: { index: true, follow: true },
    };
  }

  const documentId = listing?.documentId;
  const canonical = scopedHref
    ? toAbsoluteUrl(appendQueryToPath(scopedHref, queryString))
    : (documentId ? toAbsoluteUrl(appendQueryToPath(`/tombstones-for-sale/${documentId}`, queryString)) : toAbsoluteUrl(appendQueryToPath(`/listing/${slug}`, queryString)));
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
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images,
    },
  };
}

export default async function ListingPage({ params, searchParams }) {
  const slug = (await params)?.slug;
  if (!slug) notFound();

  const queryString = buildQueryStringPreserve(searchParams);

  const { listing, cleanSlug } = await resolveListingCanonicalSlug(slug);
  if (!listing) notFound();

  const normalizedRaw = normalizeListingSlug(slug);
  const scopedHref = buildListingCanonicalHref(listing);
  if (scopedHref && normalizedRaw !== cleanSlug) {
    permanentRedirect(appendQueryToPath(scopedHref, queryString));
  }
  if (scopedHref && cleanSlug) {
    permanentRedirect(appendQueryToPath(scopedHref, queryString));
  }

  const documentId = listing?.documentId;
  const canonical = scopedHref
    ? toAbsoluteUrl(appendQueryToPath(scopedHref, queryString))
    : (documentId ? toAbsoluteUrl(appendQueryToPath(`/tombstones-for-sale/${documentId}`, queryString)) : toAbsoluteUrl(appendQueryToPath(`/listing/${slug}`, queryString)));
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
