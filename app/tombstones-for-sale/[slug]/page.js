import { notFound, permanentRedirect } from "next/navigation";
import ProductShowcase from "@/components/product-showcase";
import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";

function normalizeListingSlug(raw) {
  const decoded = decodeURIComponent(typeof raw === "string" ? raw : "");
  return decoded
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanListingSlug(slug, title) {
  const rawSlug = typeof slug === "string" ? slug.trim() : "";
  if (!rawSlug) return normalizeListingSlug(title);
  const stripped = rawSlug.replace(/(-copy-[a-z0-9]+)+/gi, "").trim();
  if (!stripped || /^[-]*$/.test(stripped)) return normalizeListingSlug(title);
  return normalizeListingSlug(stripped);
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

async function resolveListingCanonicalSlug(rawParam) {
  const raw = typeof rawParam === "string" ? rawParam.trim() : "";
  if (!raw) return { listing: null, cleanSlug: null };

  const paramLooksLikeDocId = /^[a-z0-9]{20,30}$/i.test(raw);

  let listing = null;
  if (paramLooksLikeDocId) {
    listing = await fetchListingById(raw);
  }
  if (!listing) {
    listing = await fetchListingBySavedSlug(raw);
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

export async function generateMetadata({ params }) {
  const rawParam = (await params)?.slug;
  if (!rawParam) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }

  const { listing, cleanSlug } = await resolveListingCanonicalSlug(rawParam);
  if (!listing) {
    return {
      title: "Tombstone Not Found | TombstoneFinder",
      description: "This tombstone listing could not be found, or is no longer available.",
      alternates: { canonical: toAbsoluteUrl(`/tombstones-for-sale/${rawParam}`) },
      robots: { index: true, follow: true },
    };
  }

  const normalizedRaw = normalizeListingSlug(rawParam);
  if (cleanSlug && normalizedRaw !== cleanSlug) {
    const cleanCanonical = toAbsoluteUrl(`/tombstones/${cleanSlug}`);
    permanentRedirect(`/tombstones/${cleanSlug}`);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 6)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);

  const title = listing?.title ? `${listing.title} | Tombstones For Sale` : "Tombstone Listing";
  const description =
    listing?.description || "View this tombstone listing, pricing and branch availability.";
  const canonical = cleanSlug ? toAbsoluteUrl(`/tombstones/${cleanSlug}`) : toAbsoluteUrl(`/tombstones-for-sale/${listing.documentId || rawParam}`);
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

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
      images: images.length ? images : undefined,
      siteName: "TombstoneFinder",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    },
    other: {
      "product:price:amount": coercePrice(listing?.price) ?? undefined,
      "product:price:currency": "ZAR",
      "product:brand": sellerName || undefined,
      "product:category": categoryName || undefined,
      "product:material": stoneType || undefined,
      "og:image:alt": title,
    },
  };
}

export default async function TombstoneDetailPage({ params }) {
  const rawParam = (await params)?.slug;
  if (!rawParam) notFound();

  const { listing, cleanSlug } = await resolveListingCanonicalSlug(rawParam);
  if (!listing) notFound();

  const normalizedRaw = normalizeListingSlug(rawParam);
  if (cleanSlug && normalizedRaw !== cleanSlug) {
    permanentRedirect(`/tombstones/${cleanSlug}`);
  }

  const canonical = cleanSlug ? toAbsoluteUrl(`/tombstones/${cleanSlug}`) : toAbsoluteUrl(`/tombstones-for-sale/${listing.documentId || rawParam}`);
  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 8)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);
  const price = coercePrice(listing?.price);
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: String(listing?.title ?? "").trim() || `Tombstone ${listing.documentId || rawParam}`,
    description: String(listing?.description ?? "").trim() || undefined,
    image: images.length ? images : undefined,
    sku: String(listing.documentId || rawParam),
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
      <ProductShowcase listing={listing} id={listing.documentId || rawParam} />
    </>
  );
}
