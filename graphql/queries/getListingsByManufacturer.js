import { gql } from '@apollo/client';
const GET_LISTINGS_BY_COMPANY_NAME = gql`
  query GetListingsByCompanyName($name: String!) {
    listings(filters: { company: { name: { eq: $name } } }) {
      documentId
      title
      price
      isFeatured
      mainImage {
        url
      }
      productDetails {
        id
        color { id value }
        style { id value }
        stoneType { id value }
       
        customization { id value }
      }
    }
  }
`;
export { GET_LISTINGS_BY_COMPANY_NAME };