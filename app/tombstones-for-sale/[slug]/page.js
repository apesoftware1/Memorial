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

export async function generateMetadata({ params }) {
  const documentId = (await params)?.slug;
  if (!documentId) return {};
  const listing = await fetchListing(documentId);
  if (!listing) return {};

  return {
    title: listing?.title ? `${listing.title} | Tombstones For Sale` : "Tombstone Listing",
    description:
      listing?.description || "View this tombstone listing, pricing and branch availability.",
    alternates: {
      canonical: toAbsoluteUrl(`/tombstones-for-sale/${documentId}`),
    },
  };
}

export default async function TombstoneDetailPage({ params }) {
  const documentId = (await params)?.slug;
  if (!documentId) notFound();

  const listing = await fetchListing(documentId);
  if (!listing) notFound();

  return <ProductShowcase listing={listing} id={documentId} />;
}
