import { gql } from '@apollo/client';

export const GET_COMPANY_BY_USER = gql`
  query GetCompanyByUser($documentId: ID!) {
    companies(filters: { user: { documentId: { eq: $documentId } } }) {
      documentId
      videoSlot
      videoUrl
      videoPublicId
      profilePicUrl
      profilePicPublicId
      branches {
         documentId
          name
        location {
          address
          latitude
          longitude
          mapUrl
        }
      }
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
         documentId
          name
        location {
          address
          latitude
          longitude
          mapUrl
        }
      }
        branch_listings {
          branch {
            documentId
          }
          price
        }
        documentId
          listing_category {
      name
    }
        title
        slug
        price
        adFlasher
        adFlasherColor
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
          slabStyle { id value }
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
        }
      }
      isFeatured
    }
  }
`;