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
      branch_listings(pagination: { limit: -1 }) {
        branch { documentId name location { address latitude longitude mapUrl province city town} }
        price
      }
      branches(pagination: { limit: -1 }) {
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
        overallStyle { id value }
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
      branch_listings(pagination: { limit: -1 }) {
        branch { documentId name location { address latitude longitude mapUrl province city town} }
        price
      }
      branches(pagination: { limit: -1 }) {
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
        overallStyle { id value }
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

export const LISTINGS_SEARCH_CONNECTION_QUERY = gql`
  query ListingsSearchConnection(
    $page: Int = 1
    $pageSize: Int = 20
    $filters: ListingFiltersInput
    $sort: [String]
    $branchesPageSize: Int = 10
    $branchListingsPageSize: Int = 10
  ) {
    listings_connection(
      filters: $filters
      sort: $sort
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      nodes {
        documentId
        updatedAt
        title
        price
        slug
        isFeatured
        isOnSpecial
        isPremium
        isStandard
        listing_category { documentId name }
        mainImageUrl
        mainImagePublicId
        thumbnailUrls
        thumbnailPublicIds
        adFlasher
        adFlasherColor
        manufacturingTimeframe
        specials { active sale_price start_date end_date }
        productDetails {
          id
          color { id value }
          style { id value }
          overallStyle { id value }
          stoneType { id value }
          slabStyle { id value }
          customization { id value }
        }
        additionalProductDetails {
          id
          transportAndInstallation { id value }
          foundationOptions { id value }
          warrantyOrGuarantee { id value }
          installationGuarantee { id value }
        }
        company {
          documentId
          name
          location
          logoUrl
          logoUrlPublicId
          hideStandardCompanyLogo
          latitude
          longitude
          isFeatured
        }
        branches(pagination: { page: 1, pageSize: $branchesPageSize }) {
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
        branch_listings(pagination: { page: 1, pageSize: $branchListingsPageSize }) {
          branch {
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
          price
        }
      }
      pageInfo {
        page
        pageSize
        total
      }
    }
  }
`;

export const LISTINGS_FEATURED_CARDS_QUERY = gql`
  query FeaturedListingsCards(
    $page: Int = 1
    $pageSize: Int = 3
  ) {
    listings(
      filters: { isFeatured: { eq: true }, isOnSpecial: { ne: true } }
      sort: "updatedAt:desc"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      documentId
      title
      price
      slug
      isFeatured
      listing_category { documentId name }
      mainImageUrl
      mainImagePublicId
      adFlasher
      adFlasherColor
      productDetails {
        id
        stoneType { id value }
        style { id value }
      }
      company { documentId name }
    }
  }
`;

export const LISTING_SEARCH_INDEX_CONNECTION_QUERY = gql`
  query ListingSearchIndexConnection(
    $filters: ListingSearchIndexFiltersInput
    $page: Int = 1
    $pageSize: Int = 20
  ) {
    listingSearchIndices_connection(
      filters: $filters
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      nodes {
        listing_document_id
        category
        provinces
        cities
        towns
        style
        price
        stone_type
        color
        head_style
        customization
        is_on_special
        published
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

export const LISTING_SEARCH_LOCATION_OPTIONS_QUERY = gql`
  query ListingSearchLocationOptions {
    listingSearchLocationOptions {
      province
      cities {
        city
        towns {
          town
        }
      }
    }
  }
`;

export const LISTINGS_BY_DOCUMENT_IDS_QUERY = gql`
  query ListingsByDocumentIds(
    $ids: [ID]
    $pageSize: Int = 20
    $branchesPageSize: Int = 10
    $branchListingsPageSize: Int = 10
  ) {
    listings(
      filters: { documentId: { in: $ids } }
      pagination: { page: 1, pageSize: $pageSize }
      sort: "documentId:asc"
    ) {
      documentId
      
      title
      price
    
      isFeatured
      
      listing_category { documentId name }
      mainImageUrl
      
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      
     
      productDetails {
        id
        color { id value }
        style { id value }
        overallStyle { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      additionalProductDetails {
        id
        transportAndInstallation { id value }
        foundationOptions { id value }
        warrantyOrGuarantee { id value }
        installationGuarantee { id value }
      }
      company {
        documentId
        name
        location
        logoUrl
        
        hideStandardCompanyLogo
        latitude
        longitude
        
      }
      branches(pagination: { page: 1, pageSize: $branchesPageSize }) {
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
      branch_listings(pagination: { page: 1, pageSize: $branchListingsPageSize }) {
        branch {
          documentId
          name
          location {
            address
            latitude
            longitude
            
          }
        }
        price
      }
    }
  }
`;

export const LISTINGS_CARDS_BY_DOCUMENT_IDS_QUERY = gql`
  query ListingsCardsByDocumentIds($ids: [ID], $pageSize: Int = 20) {
    listings(
      filters: { documentId: { in: $ids } }
      pagination: { page: 1, pageSize: $pageSize }
      sort: "documentId:asc"
    ) {
      documentId
      updatedAt
      title
      price
      slug
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      listing_category { documentId name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      manufacturingTimeframe
      specials { active sale_price start_date end_date }
      productDetails {
        id
        color { id value }
        style { id value }
        overallStyle { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      additionalProductDetails {
        id
        transportAndInstallation { id value }
        foundationOptions { id value }
        warrantyOrGuarantee { id value }
        installationGuarantee { id value }
      }
      company {
        documentId
        name
        location
        logoUrl
        logoUrlPublicId
        hideStandardCompanyLogo
        latitude
        longitude
        isFeatured
      }
    }
  }
`;

export const LISTINGS_BRANCH_COUNTS_BY_DOCUMENT_IDS_QUERY = gql`
  query ListingsBranchCountsByDocumentIds($ids: [ID], $pageSize: Int = 20) {
    listings(
      filters: { documentId: { in: $ids } }
      pagination: { page: 1, pageSize: $pageSize }
      sort: "documentId:asc"
    ) {
      documentId
      branches(pagination: { limit: -1 }) {
        documentId
      }
      branch_listings(pagination: { limit: -1 }) {
        documentId
        branch {
          documentId
        }
      }
    }
  }
`;
