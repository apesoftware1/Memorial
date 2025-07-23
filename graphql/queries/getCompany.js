import { gql } from '@apollo/client';

export const GET_COMPANY_BY_USER = gql`
  query GetCompanyByUser($documentId: ID!) {
    companies(filters: { user: { documentId: { eq: $documentId } } }) {
      documentId
      name
      googleRating
      location
      address
      description
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
      packageType
      user {
        documentId
        email
      }
      listings {
        createdAt
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
        mainImage {
          url
        }
        thumbnails {
          url
        }
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
        inquiries {
          documentId
          name
          email
          message
          createdAt
        }
      }
      isFeatured
    }
  }
`;