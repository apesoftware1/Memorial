import { gql } from '@apollo/client';
export const GET_LISTINGS = gql`
query GetListings {
  listings {
    documentId
    title
    listing_category {
      name
    }
    mainImage {
      url
    }
    thumbnails {
      url
    }
    description
    price
    adFlasher
    isFeatured
    isOnSpecial
    isPremium
    isStandard
    productDetails {
      id
      color { id value }
      style { id value }
      stoneType { id value }   
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
      logo { url }
      latitude
      longitude
    }
  }
}
`; 