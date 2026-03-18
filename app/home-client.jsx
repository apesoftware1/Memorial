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
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery"
import IndexRender from "./indexRender"
import {
  LISTINGS_INITIAL_QUERY,
  LISTINGS_FULL_QUERY,
  LISTINGS_DELTA_QUERY,
} from "@/graphql/queries"
import {
  MANUFACTURERS_INITIAL_QUERY,
  MANUFACTURERS_FULL_QUERY,
  MANUFACTURERS_DELTA_QUERY,
} from "@/graphql/queries/getManufacturers"

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

  const { data, loading, error, isFullLoaded } = useProgressiveQuery({
    initialQuery: LISTINGS_INITIAL_QUERY,
    fullQuery: LISTINGS_FULL_QUERY,
    deltaQuery: LISTINGS_DELTA_QUERY,
    variables: {},
    storageKey: "listings:lastUpdated",
    refreshInterval: 60000,
    staleTime: 1000 * 60 * 5,
    skip: !enableQueries,
  })

  const effectiveListings = useMemo(() => {
    const fromQuery = data?.listings
    if (Array.isArray(fromQuery) && fromQuery.length > 0) return fromQuery
    return Array.isArray(initialListings) ? initialListings : []
  }, [data, initialListings])

  const nonSpecialListings = useMemo(() => {
    if (!Array.isArray(effectiveListings)) return []
    return effectiveListings.filter((listing) => {
      return !(
        listing.specials &&
        Array.isArray(listing.specials) &&
        listing.specials.length > 0 &&
        listing.specials.some((special) => special?.active)
      )
    })
  }, [effectiveListings])

  const validListings = useMemo(() => {
    return nonSpecialListings.filter((l) => l?.isFeatured || l?.isPremium || l?.isStandard)
  }, [nonSpecialListings])

  const featuredListings = useMemo(() => {
    return validListings.filter((l) => l?.isFeatured)
  }, [validListings])

  const premListings = useMemo(() => {
    const premiumRaw = validListings.filter((l) => l?.isPremium)
    return getDiverseInterleavedListings(premiumRaw)
  }, [validListings])

  const stdListings = useMemo(() => {
    return validListings.filter((l) => l?.isStandard)
  }, [validListings])

  const { data: manufacturersData } = useProgressiveQuery({
    initialQuery: MANUFACTURERS_INITIAL_QUERY,
    fullQuery: MANUFACTURERS_FULL_QUERY,
    deltaQuery: MANUFACTURERS_DELTA_QUERY,
    variables: {},
    storageKey: "manufacturers:lastUpdated",
    refreshInterval: 60000,
    skip: !enableQueries,
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
          totalListings={nonSpecialListings.length}
          onNavigateToResults={handleNavigateToResults}
          allListings={nonSpecialListings}
          filters={filters}
          setFilters={setFilters}
          isFullLoaded={enableQueries ? isFullLoaded : false}
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
        loading={enableQueries ? loading && effectiveListings.length === 0 : false}
        error={error}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        premListings={premListings}
        featuredListings={featuredListings}
        stdListings={stdListings}
      />

      <Footer />
    </div>
  )
}

