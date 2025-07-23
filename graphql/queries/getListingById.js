import { gql } from '@apollo/client';

export const GET_LISTING_BY_ID = gql`
  query Listing($documentID: ID!) {
    listing(documentId: $documentID) {
      documentId
      title
      mainImage {
        url
      }
      thumbnails {
        url
      }
      description
      price
      isOnSpecial
      productDetails {
        id
        color {
          id
          value
        }
        style {
          id
          value
        }
        stoneType {
          id
          value
        }
        
        customization {
          id
          value
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
      company {
        documentId
        name
        location
        googleRating
        address
        logo {
          url
        }
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
        listings {
          mainImage {
      url
    }
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