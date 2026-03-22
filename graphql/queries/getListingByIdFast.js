import { gql } from "@apollo/client";

export const GET_LISTING_BY_ID_FAST = gql`
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
      inquiries_c {
        documentId
      }
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
          avatar {
            url
          }
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
`;

