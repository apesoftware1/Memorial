import { notFound, permanentRedirect } from "next/navigation";
import ProductShowcase from "@/components/product-showcase";
import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";
import { normalizeListingSlug, cleanListingSlug, buildListingCanonicalHref } from "@/lib/slugs";

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

export async function generateMetadata({ params, searchParams }) {
  const id = (await params)?.id;
  if (!id) {
    return {
      title: "Special Offer Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }
  const queryString = buildQueryStringPreserve(searchParams);
  const listing = await fetchListingById(id);
  if (!listing) {
    return {
      title: "Tombstone Not Found | TombstoneFinder",
      description: "This tombstone special offer could not be found, or is no longer available.",
      alternates: { canonical: toAbsoluteUrl(appendQueryToPath(`/tombstones-on-special/${id}`, queryString)) },
      robots: { index: true, follow: true },
    };
  }

  const scopedHref = buildListingCanonicalHref(listing);
  if (scopedHref) {
    const target = appendQueryToPath(scopedHref, queryString);
    const scopedCanonical = toAbsoluteUrl(target);
    permanentRedirect(target);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: scopedCanonical },
      robots: { index: true, follow: true },
    };
  }

  const notFoundCanonical = toAbsoluteUrl(appendQueryToPath(`/tombstones-on-special/${id}`, queryString));
  return {
    title: listing?.title ? `${listing.title} | Tombstones On Special` : "Tombstone Special Offer",
    description:
      listing?.description || "View this tombstone special offer and compare branch availability.",
    alternates: {
      canonical: notFoundCanonical,
    },
    robots: { index: true, follow: true },
  };
}

export default async function SpecialTombstoneDetailPage({ params, searchParams }) {
  const id = (await params)?.id;
  if (!id) notFound();

  const queryString = buildQueryStringPreserve(searchParams);

  const listing = await fetchListingById(id);
  if (!listing) notFound();

  const scopedHref = buildListingCanonicalHref(listing);
  if (scopedHref) {
    permanentRedirect(appendQueryToPath(scopedHref, queryString));
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
