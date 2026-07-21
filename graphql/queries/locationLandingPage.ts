export const LOCATION_LANDING_PAGE_QUERY = `
  query LocationLandingPage(
    $province: String!
    $city: String
    $town: String!
    $page: Int
    $pageSize: Int
  ) {
    locationLandingPage(
      province: $province
      city: $city
      town: $town
      page: $page
      pageSize: $pageSize
    ) {
      location {
        province
        city
        town
        slug
        breadcrumb {
          label
          slug
        }
      }
      statistics {
        totalBranches
        totalManufacturers
        totalListings
        minimumListingPrice
      }
      seo {
        title
        metaTitle
        metaDescription
        intro
        heroImageUrl
        heroImagePublicId
      }
      branches {
        branch {
          documentId
          name
        }
        company {
          documentId
          name
          slug
        }
        address
        phone
        openingHours {
          monToFri
          saturday
          sunday
          publicHoliday
        }
        logo {
          url
        }
      }
      listings {
        items {
          listing {
            documentId
            title
            slug
            price
            thumbnail {
              url
            }
          }
          branch {
            documentId
            name
            address
          }
          company {
            documentId
            name
            slug
            logo {
              url
            }
          }
        }
        pagination {
          page
          pageSize
          total
          pageCount
        }
      }
      localBusinessSections {
        businessType
        label
        title
        items {
          documentId
          name
          slug
          businessType
          description
          phone
          mobile
          email
          website
          whatsapp
          streetAddress
          postalCode
          latitude
          longitude
          featured
          verified
          active
          metaTitle
          metaDescription
          logo {
            url
            publicId
          }
          gallery {
            url
            publicId
          }
          openingHours {
            monToFri
            saturday
            sunday
            publicHoliday
          }
          branch {
            documentId
            name
          }
          company {
            documentId
            name
            slug
          }
        }
      }
      faq {
        question
        answer
      }
      nearbyLocations {
        town
        city
        province
        slug
        listingCount
      }
    }
  }
`;
