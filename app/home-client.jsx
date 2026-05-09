"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LocationPermissionModal from "@/components/LocationPermissionModal"
import LocationTrigger from "@/components/LocationTrigger"
import ResponsiveFaqSection from "@/components/ResponsiveFaqSection"
import SearchContainer from "@/components/SearchContainer.jsx"
import BannerAd from "@/components/BannerAd"
import { PageLoader } from "@/components/ui/loader"
import { useGuestLocation } from "@/hooks/useGuestLocation"
import { useListingCategories } from "@/hooks/use-ListingCategories"
import IndexRender from "./indexRender"
import {
  HOMEPAGE_LISTINGS_CONNECTION_QUERY,
} from "@/graphql/queries"
import { useQuery } from "@apollo/client"
import { GET_BANNER } from "@/graphql/queries/getBanner"

const PREMIUM_PER_PAGE = 10
const STANDARD_PER_PAGE = 5
const OVERFETCH_MULTIPLIER = 5

const getDiverseInterleavedListings = (listings) => {
  if (!Array.isArray(listings) || listings.length === 0) return []

  const companyMap = new Map()
  for (const listing of listings) {
    const companyId = listing.company?.documentId || listing.company?.id || "unknown"
    const existing = companyMap.get(companyId) || []
    existing.push(listing)
    companyMap.set(companyId, existing)
  }

  const companyIds = Array.from(companyMap.keys()).sort((a, b) =>
    String(a).localeCompare(String(b))
  )

  companyMap.forEach((list, key) => {
    const sorted = [...list].sort((a, b) =>
      String(a?.documentId || a?.id || "").localeCompare(String(b?.documentId || b?.id || ""))
    )
    companyMap.set(key, sorted)
  })

  let maxListings = 0
  companyMap.forEach((list) => {
    if (list.length > maxListings) maxListings = list.length
  })

  const result = []
  for (let i = 0; i < maxListings; i++) {
    for (const companyId of companyIds) {
      const list = companyMap.get(companyId)
      if (list && i < list.length) result.push(list[i])
    }
  }

  return result
}

const stableHash = (input) => {
  const s = String(input ?? "")
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffleWithSeed = (arr, seedKey) => {
  const out = Array.isArray(arr) ? [...arr] : []
  const rand = mulberry32(stableHash(seedKey))
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

const getDiverseInterleavedListingsSeeded = (listings, seedKey) => {
  if (!Array.isArray(listings) || listings.length === 0) return []

  const companyMap = new Map()
  for (const listing of listings) {
    const companyId = listing.company?.documentId || listing.company?.id || listing.company?.name || "unknown"
    const existing = companyMap.get(companyId) || []
    existing.push(listing)
    companyMap.set(companyId, existing)
  }

  let companyIds = Array.from(companyMap.keys())
  companyIds = shuffleWithSeed(companyIds, seedKey)

  companyMap.forEach((list, key) => {
    const sorted = [...list].sort((a, b) =>
      String(a?.documentId || a?.id || "").localeCompare(String(b?.documentId || b?.id || ""))
    )
    companyMap.set(key, sorted)
  })

  let maxListings = 0
  companyMap.forEach((list) => {
    if (list.length > maxListings) maxListings = list.length
  })

  const result = []
  for (let i = 0; i < maxListings; i++) {
    for (const companyId of companyIds) {
      const list = companyMap.get(companyId)
      if (list && i < list.length) result.push(list[i])
    }
  }

  return result
}

const mixCompanyListings = (listings, seedKey) => {
  const interleaved = getDiverseInterleavedListingsSeeded(listings, seedKey)
  const seen = new Set()
  const uniqueFirst = []
  const remaining = []

  for (const listing of interleaved) {
    const companyKey =
      listing?.company?.documentId ||
      listing?.company?.id ||
      listing?.company?.name ||
      "unknown"
    const key = String(companyKey)
    if (key !== "unknown" && !seen.has(key)) {
      seen.add(key)
      uniqueFirst.push(listing)
    } else {
      remaining.push(listing)
    }
  }

  return [...uniqueFirst, ...remaining]
}

const pickUniqueCompanies = (listings, maxItems) => {
  const out = []
  const used = new Set()
  const rest = []

  for (const item of Array.isArray(listings) ? listings : []) {
    const key =
      item?.company?.documentId ||
      item?.company?.id ||
      item?.company?.name ||
      "unknown"
    const k = String(key)
    if (k !== "unknown" && !used.has(k) && out.length < maxItems) {
      used.add(k)
      out.push(item)
    } else {
      rest.push(item)
    }
  }

  for (const item of rest) {
    if (out.length >= maxItems) break
    out.push(item)
  }

  return out
}

export default function HomeClient({ initialListings = [], initialCategories = [] }) {
  const router = useRouter()
  const [enableQueries, setEnableQueries] = useState(false)

  useEffect(() => {
    setEnableQueries(true)
  }, [])

  const { categories: fetchedCategories, loading: categoriesLoading } =
    useListingCategories({ skip: !enableQueries })

  const categories = fetchedCategories?.length ? fetchedCategories : initialCategories

  const [activeTab, setActiveTab] = useState(0)

  const { location, loading: locationLoading } = useGuestLocation()
  const [showLocationModal, setShowLocationModal] = useState(false)

  useEffect(() => {
    const hasShownModal = localStorage.getItem("locationModalShown")
    if (!location && !locationLoading && !hasShownModal) {
      setShowLocationModal(true)
      localStorage.setItem("locationModalShown", "true")
    }
  }, [location, locationLoading])

  const handleCloseLocationModal = () => {
    setShowLocationModal(false)
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState(null)

  const handleMobileMenuToggle = () => setMobileMenuOpen((open) => !open)
  const handleMobileDropdownToggle = (section) =>
    setMobileDropdown((prev) => (prev === section ? null : section))

  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return []
    const desiredOrder = ["SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"]
    return desiredOrder
      .map((name) =>
        categories.find((cat) => cat?.name && cat.name.toUpperCase() === name)
      )
      .filter(Boolean)
  }, [categories])

  const activeCategory = sortedCategories[activeTab] || categories?.[activeTab]

  const [filters, setFilters] = useState({
    minPrice: "Min Price",
    maxPrice: "Max Price",
    colour: "Any",
    style: "Any",
    overallStyle: "Any",
    slabStyle: "Any",
    location: "Any",
    stoneType: "Any",
    custom: "Any",
    search: "",
  })

  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const handleNavigateToResults = useCallback(
    (queryString) => {
      if (queryString) {
        const path = queryString.startsWith("&")
          ? `/tombstones-for-sale?${queryString.substring(1)}`
          : `/tombstones-for-sale?${queryString}`

        router.push(path)
      } else {
        router.push("/tombstones-for-sale")
      }
    },
    [router]
  )

  const homepageListingsVars = useMemo(
    () => ({
      featuredPage: 1,
      featuredPageSize: 3,
      premiumPage: currentPage,
      premiumPageSize: PREMIUM_PER_PAGE * OVERFETCH_MULTIPLIER,
      standardPage: currentPage,
      standardPageSize: STANDARD_PER_PAGE * OVERFETCH_MULTIPLIER,
      featuredSort: ["updatedAt:desc"],
      premiumSort: ["documentId:asc"],
      standardSort: ["documentId:asc"],
    }),
    [currentPage]
  )

  const {
    data: homepageListingsData,
    loading: listingsLoading,
    error: listingsError,
  } = useQuery(HOMEPAGE_LISTINGS_CONNECTION_QUERY, {
    variables: homepageListingsVars,
    skip: !enableQueries,
    fetchPolicy: "cache-first",
  })

  const featuredListings = useMemo(() => {
    const items = homepageListingsData?.featured?.nodes
    if (Array.isArray(items)) return items
    return Array.isArray(initialListings) ? initialListings.filter((l) => l?.isFeatured).slice(0, 3) : []
  }, [homepageListingsData, initialListings])

  const rawPremium = useMemo(() => {
    const items = homepageListingsData?.premium?.nodes
    if (Array.isArray(items)) return items
    return Array.isArray(initialListings) ? initialListings.filter((l) => l?.isPremium) : []
  }, [homepageListingsData, initialListings])

  const rawStandard = useMemo(() => {
    const items = homepageListingsData?.standard?.nodes
    if (Array.isArray(items)) return items
    return Array.isArray(initialListings) ? initialListings.filter((l) => l?.isStandard) : []
  }, [homepageListingsData, initialListings])

  const premListings = useMemo(() => {
    const dayKey = new Date().toISOString().slice(0, 10)
    const seedKey = `home|premium|${dayKey}|page:${currentPage}`
    return pickUniqueCompanies(mixCompanyListings(rawPremium, seedKey), PREMIUM_PER_PAGE)
  }, [rawPremium, currentPage])

  const stdListings = useMemo(() => {
    const dayKey = new Date().toISOString().slice(0, 10)
    const seedKey = `home|standard|${dayKey}|page:${currentPage}`
    return pickUniqueCompanies(mixCompanyListings(rawStandard, seedKey), STANDARD_PER_PAGE)
  }, [rawStandard, currentPage])

  const featuredManufacturer = useMemo(() => {
    return premListings[0]?.company || null
  }, [premListings])

  const manufacturerListings = useMemo(() => {
    const name = featuredManufacturer?.name
    if (!name) return []
    return rawPremium.filter((l) => l?.company?.name === name).slice(0, 3)
  }, [featuredManufacturer, rawPremium])

  const totalPages = useMemo(() => {
    const premiumTotal = homepageListingsData?.premium?.pageInfo?.total
    const standardTotal = homepageListingsData?.standard?.pageInfo?.total
    const premiumPages =
      typeof premiumTotal === "number" && premiumTotal > 0 ? Math.ceil(premiumTotal / PREMIUM_PER_PAGE) : 1
    const standardPages =
      typeof standardTotal === "number" && standardTotal > 0 ? Math.ceil(standardTotal / STANDARD_PER_PAGE) : 1
    return Math.max(1, premiumPages, standardPages)
  }, [homepageListingsData])

  const { data: manufacturersData } = useQuery(GET_BANNER, {
    variables: { page: 1, pageSize: 20 },
    skip: !enableQueries,
    fetchPolicy: "cache-first",
  })

  const bannerPool = useMemo(() => {
    return (manufacturersData?.companies || [])
      .map((c) => {
        const url =
          c?.bannerAdUrl ||
          (typeof c?.bannerAd?.url === "string" ? c.bannerAd.url.trim() : null)
        const documentId = c?.documentId
        if (url && documentId) {
          return {
            url,
            documentId,
            alt: c?.name ? `${c.name} Banner` : "Banner Ad",
          }
        }
        return null
      })
      .filter(Boolean)
  }, [manufacturersData])

  const [faqBanner, setFaqBanner] = useState(null)
  useEffect(() => {
    if (bannerPool.length > 0) {
      const idx = Math.floor(Math.random() * bannerPool.length)
      setFaqBanner(bannerPool[idx])
    } else {
      setFaqBanner(null)
    }
  }, [bannerPool])

  const showPageLoader = categoriesLoading && (!Array.isArray(categories) || categories.length === 0)
  if (showPageLoader) return <PageLoader text="Loading" />

  return (
    <div>
      <LocationPermissionModal isOpen={showLocationModal} onClose={handleCloseLocationModal} />

      <Header
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />

      <div className="hidden">
        <LocationTrigger listing={{}} />
      </div>

      <section className="relative flex items-center bg-[#333]">
        <div className="absolute top-0 left-0 w-full h-28 md:h-full md:inset-0 z-0 block">
          <Image
            src={activeCategory?.imageUrl || "/placeholder.svg"}
            alt={activeCategory?.name || "Category background"}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
            unoptimized
          />
        </div>

        <SearchContainer
          categories={categories}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNavigateToResults={handleNavigateToResults}
          filters={filters}
          setFilters={setFilters}
          isFullLoaded={false}
        />
      </section>

      <div className="md:container md:mx-auto md:px-4 w-full mb-4">
        <div className="md:max-w-4xl md:mx-auto">
          <ResponsiveFaqSection />
        </div>
      </div>

      <div className="bg-gray-50 py-4 ">
        <div className="container mx-auto px-4 mb-4">
          <div className="max-w-4xl mx-auto">
            {faqBanner && (
              <BannerAd
                bannerAd={faqBanner}
                mobileContainerClasses="w-full h-24"
                desktopContainerClasses="max-w-4xl h-24"
              />
            )}
          </div>
        </div>
      </div>

      <IndexRender
        loading={enableQueries ? listingsLoading && (premListings.length === 0 && stdListings.length === 0 && featuredListings.length === 0) : false}
        error={listingsError}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        premListings={premListings}
        featuredListings={featuredListings}
        stdListings={stdListings}
        featuredManufacturer={featuredManufacturer}
        manufacturerListings={manufacturerListings}
        totalPages={totalPages}
      />

      <Footer />
    </div>
  )
}
