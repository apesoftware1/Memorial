import { gql } from '@apollo/client';

export const GET_LISTING_BY_SLUG = gql`
  query Listings($slug: String!) {
    listings(filters: { slug: { eq: $slug } }) {
      documentId
      title
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
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
        phone
        name
        location
        googleRating
        address
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