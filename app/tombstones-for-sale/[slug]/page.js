import { notFound } from "next/navigation";
import ProductShowcase from "@/components/product-showcase";
import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";

async function fetchListing(documentID) {
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
  const documentId = (await params)?.slug;
  if (!documentId) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }
  const listing = await fetchListing(documentId);
  if (!listing) {
    return {
      title: "Tombstone Not Found | TombstoneFinder",
      description: "This tombstone listing could not be found, or is no longer available.",
      alternates: { canonical: toAbsoluteUrl(`/tombstones-for-sale/${documentId}`) },
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
  const canonical = toAbsoluteUrl(`/tombstones-for-sale/${documentId}`);
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  return {
    title,
    description,
    alternates: { canonical },
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
  const documentId = (await params)?.slug;
  if (!documentId) notFound();

  const listing = await fetchListing(documentId);
  if (!listing) notFound();

  const canonical = toAbsoluteUrl(`/tombstones-for-sale/${documentId}`);
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
    name: String(listing?.title ?? "").trim() || `Tombstone ${documentId}`,
    description: String(listing?.description ?? "").trim() || undefined,
    image: images.length ? images : undefined,
    sku: String(documentId),
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
