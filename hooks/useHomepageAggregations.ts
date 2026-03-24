
import { useQuery } from "@apollo/client"
import { GET_HOMEPAGE_AGGREGATIONS } from "@/graphql/queries/getHomepageAggregations"
import { useMemo } from "react"

export const useHomepageAggregations = (
  options: { skip?: boolean; filters?: any } = {}
) => {
  const cleanedFilters = useMemo(() => {
    const input = options.filters
    if (!input || typeof input !== "object") return undefined

    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined || value === null) continue
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (!trimmed) continue
        const lowered = trimmed.toLowerCase()
        if (lowered === "any" || lowered === "all") continue
        cleaned[key] = trimmed
        continue
      }
      if (Array.isArray(value)) {
        const next = value
          .map((v) => (typeof v === "string" ? v.trim() : v))
          .filter((v) => v !== undefined && v !== null)
          .filter((v) => {
            if (typeof v !== "string") return true
            if (!v) return false
            const lowered = v.toLowerCase()
            return lowered !== "any" && lowered !== "all"
          })
        if (next.length === 0) continue
        cleaned[key] = next
        continue
      }
      cleaned[key] = value
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }, [options.filters])

  const { data, loading, error } = useQuery(GET_HOMEPAGE_AGGREGATIONS, {
    skip: !!options.skip,
    variables: cleanedFilters ? { filters: cleanedFilters } : undefined,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })

  return {
    data,
    loading,
    error,
  }
}
