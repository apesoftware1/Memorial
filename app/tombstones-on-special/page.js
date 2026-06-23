import TombstonesOnSpecialClient from "./tombstones-on-special-client";
import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";

export const metadata = {
  title: "Tombstones On Special | Compare Current Deals",
  description:
    "Browse current tombstone specials across South Africa. Compare discounted memorials, prices, branches and available offers.",
  alternates: {
    canonical: toAbsoluteUrl("/tombstones-on-special"),
  },
};

async function fetchSpecialListings() {
  const data = await fetchGraphQL(
    `
      query SpecialsSeoList {
        listings {
          documentId
          branches {
            name
            location {
              address
              latitude
              longitude
              mapUrl
              province
              city
              town
            }
          }
          title
          listing_category {
            name
          }
          mainImageUrl
          mainImagePublicId
          thumbnailUrls
          thumbnailPublicIds
          description
          price
          adFlasher
          adFlasherColor
          isFeatured
          isOnSpecial
          specials {
            active
            sale_price
            start_date
            end_date
          }
          isPremium
          isStandard
          productDetails {
            id
            color { id value }
            style { id value }
            stoneType { id value }
            slabStyle { id value }
            customization { id value }
          }
          slug
          additionalProductDetails {
            id
            transportAndInstallation { id value }
            foundationOptions { id value }
            warrantyOrGuarantee { id value }
          }
          manufacturingTimeframe
          inquiries_c { documentId }
          inquiries { documentId }
          company {
            phone
            name
            isFeatured
            location
            logoUrl
            logoUrlPublicId
            hideStandardCompanyLogo
            latitude
            longitude
          }
        }
      }
    `,
    {},
    300
  );

  return Array.isArray(data?.listings) ? data.listings : [];
}

export default async function TombstonesOnSpecialPage() {
  const initialListings = await fetchSpecialListings();
  return <TombstonesOnSpecialClient initialListings={initialListings} />;
}
