import { gql } from "@apollo/client";

export const GET_LISTING_EXTRAS_BY_ID = gql`
  query ListingExtras($documentID: ID!) {
    listing(documentId: $documentID) {
      documentId
      branches(pagination: { limit: -1 }) {
        documentId
        name
        sales_reps {
          call
          whatsapp
          name
          avatar {
            url
          }
        }
        location {
          address
          latitude
          longitude
          mapUrl
        }
      }
      company {
        documentId
        listings(pagination: { limit: 3 }) {
          mainImageUrl
          thumbnailUrls
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

export const GET_LISTING_BRANCHES_FOR_MODAL = gql`
  query ListingBranchesForModal($documentID: ID!, $page: Int = 1, $pageSize: Int = 15) {
    listing(documentId: $documentID) {
      documentId
      branches(pagination: { page: $page, pageSize: $pageSize }) {
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
      branch_listings(pagination: { page: $page, pageSize: $pageSize }) {
        documentId
        price
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
      }
    }
  }
`;
