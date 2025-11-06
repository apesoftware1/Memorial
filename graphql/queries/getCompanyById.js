import { gql } from '@apollo/client';

/**
 * Progressive company queries:
 * - Initial: minimal fields for instant render
 * - Full: all fields hydrated in background
 * - Delta: only records updated since a timestamp
 */

export const COMPANY_INITIAL_QUERY = gql`
  query CompanyInitial($documentId: ID!) {
    companies(filters: { documentId: { eq: $documentId } }) {
       documentId
      videoUrl
      videoPublicId
      profilePicUrl
      profilePicPublicId
      name
      phone
      googleRating
      location
      latitude
      longitude
      description
      logoUrl
      logoUrlPublicId
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
      listings(pagination: { limit: 5 }) {
        createdAt
        listing_category {
          name
        }
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
export const COMPANY_FULL_QUERY = gql`
  query CompanyFull($documentId: ID!) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      videoUrl
      videoPublicId
      profilePicUrl
      profilePicPublicId
      name
      phone
      googleRating
      location
      latitude
      longitude
      description
      logoUrl
      logoUrlPublicId
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
        listing_category {
          name
        }
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

export const COMPANY_DELTA_QUERY = gql`
  query CompanyDelta($documentId: ID!, $since: DateTime!) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      listings(
        filters: { updatedAt: { gt: $since } }
        pagination: { limit: -1 }
      ) {
        documentId
        title
        slug
        price
        updatedAt
        mainImageUrl
        mainImagePublicId
        isFeatured
        isOnSpecial
        isPremium
        isStandard
      }
    }
  }
`;

export default {
  COMPANY_INITIAL_QUERY,
  COMPANY_FULL_QUERY,
  COMPANY_DELTA_QUERY,
};