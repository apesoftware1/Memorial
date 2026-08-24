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
      query ListingSpecialDetail($documentID: ID!) {
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

function deriveCleanSlug(listing) {
  return cleanListingSlug(listing?.slug, listing?.title);
}

export async function generateMetadata({ params }) {
  const id = (await params)?.id;
  if (!id) {
    return {
      title: "Special Offer Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }
  const listing = await fetchListingById(id);
  if (!listing) {
    return {
      title: "Tombstone Not Found | TombstoneFinder",
      description: "This tombstone special offer could not be found, or is no longer available.",
      alternates: { canonical: toAbsoluteUrl(`/tombstones-on-special/${id}`) },
      robots: { index: true, follow: true },
    };
  }

  const cleanSlug = deriveCleanSlug(listing);
  if (cleanSlug) {
    const cleanCanonical = toAbsoluteUrl(`/tombstones/${cleanSlug}`);
    permanentRedirect(`/tombstones/${cleanSlug}`);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  return {
    title: listing?.title ? `${listing.title} | Tombstones On Special` : "Tombstone Special Offer",
    description:
      listing?.description || "View this tombstone special offer and compare branch availability.",
    alternates: {
      canonical: toAbsoluteUrl(`/tombstones-on-special/${id}`),
    },
    robots: { index: true, follow: true },
  };
}

export default async function SpecialTombstoneDetailPage({ params }) {
  const id = (await params)?.id;
  if (!id) notFound();

  const listing = await fetchListingById(id);
  if (!listing) notFound();

  const cleanSlug = deriveCleanSlug(listing);
  if (cleanSlug) {
    permanentRedirect(`/tombstones/${cleanSlug}`);
  }

  const transformedListing = {
    ...listing,
    originalPrice: listing.specials?.[0]?.active ? `R ${listing.price}` : null,
    price:
      listing.specials?.[0]?.active && listing.specials[0].sale_price
        ? listing.specials[0].sale_price
        : listing.price,
    badge: listing.specials?.[0]?.active ? "SPECIAL OFFER" : null,
    image: listing.mainImageUrl || "/placeholder.svg",
    mainImageUrl: listing.mainImageUrl || "/placeholder.svg",
    thumbnailUrls: listing.thumbnailUrls || [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductShowcase listing={transformedListing} id={id} />
    </div>
  );
}
