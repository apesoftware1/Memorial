import { gql } from '@apollo/client';

export const GET_LISTING_BY_ID = gql`
  query Listing($documentID: ID!) {
    listing(documentId: $documentID) {
      documentId
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
      inquiries_c { documentId }
      company {
        documentId
        phone
        name
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