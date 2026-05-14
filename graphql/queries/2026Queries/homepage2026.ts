import { gql } from "@apollo/client";

export const HOMEPAGE_2026_QUERY = gql`
  query Homepage2026(
    $page: Int = 1
    $pageSize: Int = 20
    $categoriesPageSize: Int = 50
    $bannerPageSize: Int = 20
  ) {
    homepageListings: listings_connection(
      filters: { isOnSpecial: { ne: true } }
      pagination: { page: $page, pageSize: $pageSize }
      sort: ["documentId:asc"]
    ) {
      nodes {
        documentId
        price
        adFlasher
        adFlasherColor
        title
        productDetails {
          id
          color {
            id
            value
          }
          style {
            id
            value
          }
          overallStyle {
            id
            value
          }
          stoneType {
            id
            value
          }
          slabStyle {
            id
            value
          }
          customization {
            id
            value
          }
        }
        thumbnailUrls
        additionalProductDetails {
          id
          transportAndInstallation {
            id
            value
          }
          foundationOptions {
            id
            value
          }
          warrantyOrGuarantee {
            id
            value
          }
          installationGuarantee {
            id
            value
          }
        }
        company {
          name
          location
          logoUrl
          latitude
          longitude
        }
        listing_category {
          documentId
          name
        }
        isFeatured
        isPremium
        isStandard
        mainImageUrl
      }
      pageInfo {
        page
        pageSize
        pageCount
        total
      }
    }

    listingCategories(pagination: { page: 1, pageSize: $categoriesPageSize }) {
      documentId
      updatedAt
      name
      icon
      slug
      order
      imageUrl
      imagePublicId
      backgroundImage {
        url
      }
    }

    companies(pagination: { page: 1, pageSize: $bannerPageSize }) {
      documentId
      name
      bannerAd {
        url
      }
      bannerAdUrl
    }
  }
`;
