
import { useQuery } from "@apollo/client"
import { LISTING_SEARCH_INDEX_CONNECTION_QUERY } from "@/graphql/queries"
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

  const normalizeLower = (v: any) => (typeof v === "string" ? v.trim().toLowerCase() : "")
  const packedTokenVariants = (raw: any) => {
    const base = normalizeLower(raw)
    if (!base) return []
    const kebab = base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    const variants = new Set([base, kebab])
    return Array.from(variants)
      .filter(Boolean)
      .map((v) => `|${v}|`)
  }
  const listTokens = (v: any) => {
    const arr = Array.isArray(v) ? v : v ? [v] : []
    return arr
      .map((x) => (typeof x === "string" ? x.trim() : String(x ?? "").trim()))
      .filter(Boolean)
      .filter((x) => {
        const lowered = x.toLowerCase()
        return lowered !== "any" && lowered !== "all" && lowered !== "near me"
      })
  }

  const searchIndexFilters = useMemo(() => {
    if (!cleanedFilters) return undefined
    const and: any[] = []
    and.push({ published: { eq: true } })
    and.push({ is_on_special: { eq: false } })

    const addPackedOr = (field: string, values: any) => {
      const tokens = listTokens(values).flatMap((v) => packedTokenVariants(v))
      const unique = Array.from(new Set(tokens))
      if (!unique.length) return
      and.push({ or: unique.map((tok) => ({ [field]: { contains: tok } })) })
    }

    const province = (cleanedFilters as any).province
    const city = (cleanedFilters as any).city
    const town = (cleanedFilters as any).town
    if (town) addPackedOr("towns", town)
    if (city) addPackedOr("cities", city)
    if (province) addPackedOr("provinces", province)

    const minPrice = (cleanedFilters as any).minPrice
    const maxPrice = (cleanedFilters as any).maxPrice
    if (Number.isFinite(minPrice) && minPrice > 0) and.push({ price: { gte: minPrice } })
    if (Number.isFinite(maxPrice) && maxPrice > 0) and.push({ price: { lte: maxPrice } })

    addPackedOr("color", (cleanedFilters as any).color || (cleanedFilters as any).colour)
    addPackedOr("head_style", (cleanedFilters as any).head_style || (cleanedFilters as any).style)
    addPackedOr("style", (cleanedFilters as any).overallStyle)
    addPackedOr("slab_style", (cleanedFilters as any).slabStyle)
    addPackedOr("stone_type", (cleanedFilters as any).stoneType)
    addPackedOr("customization", (cleanedFilters as any).customization)

    return and.length ? { and } : undefined
  }, [cleanedFilters])

  const { data, loading, error } = useQuery(LISTING_SEARCH_INDEX_CONNECTION_QUERY, {
    skip: !!options.skip,
    variables: { filters: searchIndexFilters, page: 1, pageSize: 1 },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })

  return {
    data,
    loading,
    error,
  }
}
