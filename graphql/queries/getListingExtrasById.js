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

