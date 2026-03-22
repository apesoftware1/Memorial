import { gql } from "@apollo/client"

export const GET_HOMEPAGE_AGGREGATIONS = gql`
  query GetHomepageAggregations($filters: AggregationFilters) {
    homepageAggregations(filters: $filters) {
      categories {
        name
        count
        locations {
          province
          count
          cities {
            city
            count
            towns {
              town
              count
            }
          }
        }
      }
    }
  }
`
