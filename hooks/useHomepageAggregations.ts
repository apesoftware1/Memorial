
import { useQuery } from "@apollo/client"
import { GET_HOMEPAGE_AGGREGATIONS } from "@/graphql/queries/getHomepageAggregations"

export const useHomepageAggregations = (options: { skip?: boolean } = {}) => {
  const { data, loading, error } = useQuery(GET_HOMEPAGE_AGGREGATIONS, {
    skip: !!options.skip,
    fetchPolicy: "cache-first",
  })

  return {
    data,
    loading,
    error,
  }
}

