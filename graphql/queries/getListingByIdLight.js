import { gql } from "@apollo/client";

export const GET_LISTING_BY_ID_LIGHT = gql`
  query ListingLight($documentID: ID!) {
    listing(documentId: $documentID) {
      documentId
      branches {
        documentId
        name
      }
      title
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      description
      price
      listing_category {
        documentId
        name
      }
      isOnSpecial
      specials {
        active
        sale_price
        start_date
        end_date
      }
      productDetails {
        id
        color {
          id
          value
          icon
        }
        style {
          id
          value
          icon
        }
        stoneType {
          id
          value
          icon
        }
        slabStyle {
          id
          value
          icon
        }
        customization {
          id
          value
          icon
        }
      }
      slug
      additionalProductDetails {
        id
        transportAndInstallation {
          id
          value
        }
        foundationOptions {
          id
          value
        }
        warrantyOrGuarantee {
          id
          value
        }
      }
      manufacturingTimeframe
      adFlasher
      isPremium
      isFeatured
      isStandard
      company {
        documentId
        name
        # ✅ REMOVED listings array - don't need it for duplication
        branches {
            documentId
            name
        }
      }
      branch_listings {
        documentId
        price
        branch {
          documentId
          name
        }
      }
    }
  }
`;
