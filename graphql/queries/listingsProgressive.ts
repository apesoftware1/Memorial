import { gql } from '@apollo/client';

/**
 * Minimal payload for instant render:
 * - First 10 listings, small preview fields
 * - Listing categories (minimal fields)
 */
export const LISTINGS_INITIAL_QUERY = gql`
  query ListingsInitial($limit: Int = 10, $start: Int = 0) {
    listings(pagination: { limit: $limit, start: $start }) {
      documentId
      updatedAt
      title
      price
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      slug
      listing_category { name }
      mainImageUrl
      company { name location logoUrl }
      branch_listings {
        branch { location { province city town } }
      }
      branches {
        location { province city town }
      }
      specials { active sale_price end_date }
    }
    listingCategories {
      documentId
      updatedAt
      name
      icon
      slug
      order
      backgroundImage { url }
    }
  }
`;

/**
 * Full payload for background hydration:
 * - All listings (use Strapi's `limit: -1` for all)
 * - Include heavy fields needed across UI components
 */
export const LISTINGS_FULL_QUERY = gql`
  query ListingsFull {
    listings(pagination: { limit: -1 }) {
      documentId
      updatedAt
      branch_listings {
        branch { documentId name location { address latitude longitude mapUrl province city town} }
        price
      }
      branches {
        documentId
        name
        location {
          address
          latitude
          longitude
          mapUrl
          province
          city
          town
        }
      }
      title
      listing_category { name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      description
      price
      adFlasher
      adFlasherColor
      isFeatured
      isOnSpecial
      specials { active sale_price start_date end_date }
      isPremium
      isStandard
      productDetails {
        id
        color { id value }
        style { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      slug
      additionalProductDetails {
        id
        transportAndInstallation { id value }
        foundationOptions { id value }
        warrantyOrGuarantee { id value }
      }
      manufacturingTimeframe
      inquiries_c { documentId }
      inquiries { documentId }
      company {
        phone
        name
        isFeatured
        location
        logoUrl
        logoUrlPublicId
        hideStandardCompanyLogo
        latitude
        longitude
      }
    }
  }
`;

// Delta query: fetch only records updated since a timestamp
export const LISTINGS_DELTA_QUERY = gql`
  query ListingsDelta($since: DateTime!) {
    listings(
      filters: { updatedAt: { gt: $since } },
      pagination: { limit: -1 }
    ) {
      documentId
      updatedAt
      branch_listings {
        branch { documentId name location { address latitude longitude mapUrl province city town} }
        price
      }
      branches {
        documentId
        name
        location {
          address
          latitude
          longitude
          mapUrl
          province
          city
          town
        }
      }
      title
      listing_category { name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      description
      price
      adFlasher
      adFlasherColor
      isFeatured
      isOnSpecial
      specials { active sale_price start_date end_date }
      isPremium
      isStandard
      productDetails {
        id
        color { id value }
        style { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      slug
      additionalProductDetails { id transportAndInstallation { id value } foundationOptions { id value } warrantyOrGuarantee { id value } }
      manufacturingTimeframe
      inquiries_c { documentId }
      inquiries { documentId }
      company { phone name isFeatured location logoUrl logoUrlPublicId hideStandardCompanyLogo latitude longitude }
    }
    listingCategories(filters: { updatedAt: { gt: $since } }) {
      documentId
      updatedAt
      name
      icon
      slug
      order
      backgroundImage { url }
    }
  }
`;
