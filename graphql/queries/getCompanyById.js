import { gql } from '@apollo/client';

export const GET_COMPANY_BY_ID = gql`
  query Company($documentId: ID!) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      phone
      name
      googleRating
      location
      latitude
      longitude
      description
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
      packageType
      user {
        documentId
        email
        name
        whatsappNumber
        phoneNumber
      }
        listings(pagination: { limit: -1 }) {
        createdAt
        branches {
        name
        location {
          address
          latitude
          longitude
          mapUrl
        }
      }
        documentId
        title
        slug
        price
        adFlasher
        isFeatured
        isOnSpecial
        isPremium
        isStandard
        manufacturingTimeframe
        mainImageUrl
        mainImagePublicId
        thumbnailUrls
        thumbnailPublicIds
        productDetails {
          id
          color { id value }
          style { id value }
          stoneType { id value }
          
          customization { id value }
        }
        additionalProductDetails {
          id
          transportAndInstallation { id value }
          foundationOptions { id value }
          warrantyOrGuarantee { id value }
        }
      
        inquiries_c {
          documentId
          name
          email
          message
          createdAt
          isRead
          isNew
        }
        inquiries {
          documentId
          name
          email
          message
          createdAt
          isRead
          isNew
        }
      }
      isFeatured
    }
  }
`;