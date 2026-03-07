import { gql } from '@apollo/client';

export const GET_LISTINGS = gql`
query Listings($pageSize: Int = 100, $page: Int = 1) {
  listings(pagination: { pageSize: $pageSize, page: $page }, sort: "documentId:asc") {
    documentId
    title
    listing_category { name }
    company {
      location
    }
    branches {
      location {
        province
        city
        town
      }
    }
    productDetails {
      color { value }
      style { value }
      stoneType { value }
      customization { value }
      slabStyle { value }
    }
  }
}
`;

export const GET_BRANCH_LISTINGS = gql`
query BranchListings($pageSize: Int = 100, $page: Int = 1) {
  branchListings(pagination: { pageSize: $pageSize, page: $page }, sort: "documentId:asc") {
    price
    listing { documentId }
    branch {
      location {
        province
        city
        town
      }
    }
  }
}
`;

export const GET_LOCATION_LISTINGS = gql`
query LocationListings($pageSize: Int = 100, $page: Int = 1) {
  locationListings(pagination: { pageSize: $pageSize, page: $page }, sort: "documentId:asc") {
    province
    city
    town
    listing { documentId }
  }
}
`;
