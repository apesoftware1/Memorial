import { gql } from "@apollo/client";

export const GET_LISTING_CATEGORY = gql`
  query GetListingCategory {
    listingCategories {
      documentId
      name
      icon
      slug
      order
      imageUrl
      imagePublicId
    }
    listings {
      title
    }
  }
`;
