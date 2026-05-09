import { gql } from "@apollo/client";

export const GET_LISTING_CATEGORY = gql`
  query GetListingCategory($page: Int = 1, $pageSize: Int = 50) {
    listingCategories(pagination: { page: $page, pageSize: $pageSize }) {
      documentId
      name
      icon
      slug
      order
      imageUrl
      imagePublicId
    }
  }
`;
