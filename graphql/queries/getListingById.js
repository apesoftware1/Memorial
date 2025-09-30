import { gql } from "@apollo/client";

export const GET_LISTING_BY_ID = gql`
  query Listing($documentID: ID!) {
    listing(documentId: $documentID) {
      documentId
      branches {
        name
        sales_reps {
          call
          whatsapp
          name

          avatar {
            url
          }
        }
        location {
          address
          latitude
          longitude
          mapUrl
        }
      }
      title
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      description
      price
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
      inquiries_c {
        documentId
      }
      company {
        documentId
        phone
        name
        mapUrl
        sales_reps {
          call
          whatsapp
          name

          avatar {
            url
          }
        }
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
        listings(pagination: { limit: -1 }) {
          mainImageUrl
          thumbnailUrls
          title
          price
          documentId
          listing_category {
            name
          }
          productDetails {
            stoneType {
              id
              value
            }
          }
        }
      }
    }
  }
`;
