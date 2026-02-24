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
      listings(pagination: { limit: -1 }) { 
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
      listings(pagination: { limit: -1 }) { 
        documentId
      }
    }
  }
`;
