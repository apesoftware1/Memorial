import { gql } from '@apollo/client';

/**
 * Progressive manufacturers queries, mirroring listingsProgressive:
 * - Initial: minimal fields for instant render
 * - Full: heavy fields hydrated in background
 * - Delta: only records updated since a timestamp
 */

export const MANUFACTURERS_INITIAL_QUERY = gql`
  query ManufacturersInitial {
    companies(
      filters: { isFeatured: { eq: true } }
      pagination: { limit: 10 }
      sort: "updatedAt:desc"
    ) {
      documentId
      updatedAt
      slug
      name
      location
      latitude
      longitude
      logoUrl
      isFeatured
      bannerAdUrl
      bannerAdPublicId
      bannerAd { url }
      googleRating
      branches { documentId }
    }
  }
`;

export const MANUFACTURERS_FULL_QUERY = gql`
  query ManufacturersFull {
    companies(
      pagination: { limit: -1 }
    ) {
      documentId
      updatedAt
      slug
      name
      phone
      googleRating
      location
      latitude
      longitude
      description
      logoUrl
      logoUrlPublicId
      bannerAdUrl
      bannerAdPublicId
      bannerAd { url }
      branches { documentId }
      operatingHours { id monToFri saturday sunday publicHoliday }
      socialLinks { id facebook website instagram tiktok youtube x whatsapp messenger }
      packageType
      isFeatured
      listings(pagination: { page: 1, pageSize: 1000 }) { 
        documentId
      }
    }
  }
`;

export const MANUFACTURERS_DELTA_QUERY = gql`
  query ManufacturersDelta($since: DateTime!) {
    companies(
      filters: { 
        updatedAt: { gt: $since } 
      },
      pagination: { limit: -1 }
    ){
      documentId
      updatedAt
      slug
      name
      phone
      googleRating
      location
      latitude
      longitude
      description
      logoUrl
      logoUrlPublicId
      bannerAdUrl
      bannerAdPublicId
      bannerAd { url }
      branches { documentId }
      operatingHours { id monToFri saturday sunday publicHoliday }
      socialLinks { id facebook website instagram tiktok youtube x whatsapp messenger }
      packageType
      isFeatured
      listings(pagination: { page: 1, pageSize: 1000 }) { 
        documentId
      }
    }
  }
`;

export const COMPANIES_LISTING_COUNTS_QUERY = gql`
  query CompaniesListingCounts($pageSize: Int! = 100, $page: Int! = 1) {
    listings_connection(
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      nodes {
        documentId
        company {
          documentId
        }
      }
      pageInfo {
        page
        pageSize
        pageCount
        total
      }
    }
  }
`;

export const LISTING_COUNT_SCOPED_QUERY = gql`
  query ListingCountScoped($companyDocId: ID!, $pageSize: Int! = 1, $page: Int! = 1) {
    listings_connection(
      pagination: { page: $page, pageSize: $pageSize }
      filters: { company: { documentId: { eq: $companyDocId } } }
    ) {
      pageInfo {
        page
        pageSize
        pageCount
        total
      }
    }
  }
`;
