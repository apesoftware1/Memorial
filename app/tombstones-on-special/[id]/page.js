import { notFound } from "next/navigation";
import ProductShowcase from "@/components/product-showcase";
import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";

async function fetchListing(documentID) {
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

export async function generateMetadata({ params }) {
  const id = (await params)?.id;
  if (!id) return {};
  const listing = await fetchListing(id);
  if (!listing) return {};

  return {
    title: listing?.title ? `${listing.title} | Tombstones On Special` : "Tombstone Special Offer",
    description:
      listing?.description || "View this tombstone special offer and compare branch availability.",
    alternates: {
      canonical: toAbsoluteUrl(`/tombstones-on-special/${id}`),
    },
  };
}

export default async function SpecialTombstoneDetailPage({ params }) {
  const id = (await params)?.id;
  if (!id) notFound();

  const listing = await fetchListing(id);
  if (!listing) notFound();

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
