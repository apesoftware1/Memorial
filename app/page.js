"use client"

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Check, Info, X, LandmarkIcon as Monument, Landmark, Layers, Square } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { useFavorites } from "@/context/favorites-context.jsx"
import { ProductCard } from "@/components/product-card"
import { StandardListingCard } from "@/components/standard-listing-card"
import SearchBox from "@/components/SearchBox"
import CategoryTabs from "@/components/CategoryTabs.jsx"
import ResponsiveFaqSection from "@/components/ResponsiveFaqSection"
import LocationModal from "@/components/LocationModal"
import LocationPermissionModal from "@/components/LocationPermissionModal"
import LocationTrigger from "@/components/LocationTrigger"
import FilterDropdown from "@/components/FilterDropdown"
import SearchForm from "@/components/SearchForm"
import SearchContainer from "@/components/SearchContainer.jsx";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/loader"
import { useGuestLocation } from "@/hooks/useGuestLocation"

import Pagination from "@/components/Pagination"
import { PremiumListingCard } from "@/components/premium-listing-card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useQuery } from '@apollo/client';
import { useLoggedQuery } from '@/hooks/useLoggedQuery';
import { GET_LISTINGS } from '@/graphql/queries/getListings';
import { GET_MANUFACTURERS } from "@/graphql/queries/getManufacturers"
import FeaturedListings from "@/components/FeaturedListings";
import FeaturedManufacturer from "@/components/FeaturedManufacturer";
import BannerAd from "@/components/BannerAd"

import IndexRender from "./indexRender";
import { useListingCategories } from "@/hooks/use-ListingCategories"
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery"
import {
  LISTINGS_INITIAL_QUERY,
  LISTINGS_FULL_QUERY,
  LISTINGS_DELTA_QUERY,
} from '@/graphql/queries';
import {
  MANUFACTURERS_INITIAL_QUERY,
  MANUFACTURERS_FULL_QUERY,
  MANUFACTURERS_DELTA_QUERY,
} from '@/graphql/queries/getManufacturers';



export default function Home() {
  
  const { categories, loading: _loading } = useListingCategories()
  const [activeTab, setActiveTab] = useState(0) // Default to SINGLE tab (first tab)
  const router = useRouter();

  // Location modal state
  const { location, loading: locationLoading } = useGuestLocation()
  const [showLocationModal, setShowLocationModal] = useState(false)

  // Auto-show location modal if user location is not set
  useEffect(() => {
    const hasShownModal = localStorage.getItem('locationModalShown')
    if (!location && !locationLoading && !hasShownModal) {
      setShowLocationModal(true)
      localStorage.setItem('locationModalShown', 'true')
    }
  }, [location, locationLoading])

  const handleCloseLocationModal = () => {
    setShowLocationModal(false)
  }

  // Add state for mobile menu and dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const handleMobileMenuToggle = () => setMobileMenuOpen((open) => !open);
  const handleMobileDropdownToggle = (section) => setMobileDropdown((prev) => prev === section ? null : section);

  // Sort categories to match CategoryTabs logic
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    const desiredOrder = ["SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"];
    return desiredOrder
      .map(name => categories.find(cat => cat.name && cat.name.toUpperCase() === name))
      .filter(Boolean);
  }, [categories]);

  const activeCategory = sortedCategories[activeTab] || categories[activeTab];

  // All hooks at the top
  const [uiState, setUiState] = useState({
    showAllOptions: false,
    openDropdown: null,
    searchDropdownOpen: false,
    locationModalOpen: false,
    activeTooltip: null,
    mobileMenuOpen: false,
    mobileDropdown: null,
  });
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    colour: null,
    style: null,
    location: null,
    stoneType: null,
    culture: null,
    custom: null,
  });
  const [selectedCategory, setSelectedCategory] = useState("FULL");
  const [selectedTown, setSelectedTown] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Navigation function for search results
  const handleNavigateToResults = useCallback((categoryParam = "") => {
    // Build query parameters from current filters and category
    const params = new URLSearchParams();
    
    // Check if a category parameter was passed from the search modal
    if (categoryParam && categoryParam.includes('category=')) {
      const categoryValue = categoryParam.split('category=')[1].split('&')[0];
      params.append('category', decodeURIComponent(categoryValue));
    } 
    // Otherwise use the active tab category
    else if (categories && categories.length > 0) {
      // Use the same sorting logic as CategoryTabs
      const desiredOrder = ["SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"];
      const sortedCategories = desiredOrder
        .map(name => categories.find(cat => cat.name && cat.name.toUpperCase() === name))
        .filter(Boolean);
      
      const selectedCategory = sortedCategories[activeTab];
      if (selectedCategory) {
        params.append('category', selectedCategory.name);
      }
    }
    
    // Add filters if any are set
    if (filters) {
   
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'Min Price' && value !== 'Max Price') {
     
          params.append(key, value);
        }
      });

    }
    
    // Navigate to tombstones-for-sale with parameters
    const queryString = params.toString();
    const url = queryString ? `/tombstones-for-sale?${queryString}` : '/tombstones-for-sale';
    router.push(url);
  }, [router, activeTab, categories, filters]);

  // New state hooks for filtered listings
  const [premListings, setPremListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [stdListings, setStdListings] = useState([]);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  }, []);

  const getSearchButtonText = useCallback(() => {
    return isSearching ? 'Searching...' : 'Search';
  }, [isSearching]);

  const handleLocationModalClose = useCallback(() => {
    setUiState(prev => ({ ...prev, locationModalOpen: false }));
  }, []);

  const toggleDropdown = useCallback((name) => {
    setUiState(prev => ({ ...prev, openDropdown: prev.openDropdown === name ? null : name }));
  }, []);
 {console.log()}
  // const { data, loading, error } = useLoggedQuery(GET_LISTINGS, {}, 'GET_LISTINGS');
  // const strapiListings = data?.listings || [];
 const { data,loading, error } = useProgressiveQuery({
    initialQuery: LISTINGS_INITIAL_QUERY,
    fullQuery: LISTINGS_FULL_QUERY,
    deltaQuery: LISTINGS_DELTA_QUERY,
    variables: { limit: 5 },
    storageKey: 'listings:lastUpdated',
    refreshInterval: 60000, // Reduced from 3000ms to 60s to save bandwidth
    staleTime: 1000 * 60 * 5, // 5 minutes staleness
  });
  // Filter and populate the arrays after fetching listings

// Memoize listings to avoid re-processing on each render
const strapiListings = useMemo(() => data?.listings || [], [data]);

useEffect(() => {
  if (!Array.isArray(strapiListings) || loading || error) return;

  // Filter out listings with active specials
  const nonSpecialListings = strapiListings.filter(listing => {
    // Check if listing has specials array and if any special is active
    return !(listing.specials && 
             Array.isArray(listing.specials) && 
             listing.specials.length > 0 && 
             listing.specials.some(special => special?.active));
  });

  const premium = nonSpecialListings.filter(l => l.isPremium);
  const featured = nonSpecialListings.filter(l => l.isFeatured);
  const standard = nonSpecialListings.filter(l =>
    typeof l.isStandard === 'boolean'
      ? l.isStandard
      : !l.isPremium && !l.isFeatured
  );

  setPremListings(premium);
  setFeaturedListings(featured);
  setStdListings(standard);
}, [strapiListings, loading, error]);

  // Fetch companies for FAQ banner (must be above return)
  
  const { data: manufacturersData,loading: manufacturersLoading, error: manufacturersError } = useProgressiveQuery({
    initialQuery: MANUFACTURERS_INITIAL_QUERY,
    fullQuery: MANUFACTURERS_FULL_QUERY,
    deltaQuery: MANUFACTURERS_DELTA_QUERY,
    variables: { limit: 1 },
    storageKey: 'manufacturers:lastUpdated',
    refreshInterval: 3000,
  });
  const bannerPool = useMemo(
    () =>
      (manufacturersData?.companies || [])
        .map((c) => {
          const url = typeof c?.bannerAd?.url === "string" ? c.bannerAd.url.trim() : null;
          const documentId = c?.documentId;
          if (url && documentId) {
            return {
              url,
              documentId,
              alt: c?.name ? `${c.name} Banner` : "Banner Ad",
            };
          }
          return null;
        })
        .filter(Boolean),
    [manufacturersData]
  );
  const [faqBanner, setFaqBanner] = useState(null);

  useEffect(() => {
    if (bannerPool.length > 0) {
      const idx = Math.floor(Math.random() * bannerPool.length);
      setFaqBanner(bannerPool[idx]);
    } else {
      setFaqBanner(null);
    }
  }, [bannerPool]);

  if (_loading) return <PageLoader text="Loading" />
  return (
    <div>
      {/* Location Permission Modal */}
      <LocationPermissionModal 
        isOpen={showLocationModal} 
        onClose={handleCloseLocationModal} 
      />

      {/* 1. Header */}
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />

      {/* Hidden LocationTrigger to auto-show modal on first visit */}
      <div className="hidden">
        <LocationTrigger listing={{}} />
      </div>

      {/* 2. Hero Section with Search */}
      <section className="relative flex items-center bg-[#333]">
        {/* Background Image - Shown on mobile too */}
        <div className="absolute top-0 left-0 w-full h-28 md:h-full md:inset-0 z-0 block">
          <Image
            src={activeCategory?.backgroundImage?.url || "/placeholder.svg"}
            alt= {activeCategory?.name || "Category background"}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        
        {/* CategoryTabs */}
  
        
        {/* SearchContainer */}
        
        <SearchContainer  
          categories={categories}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalListings={strapiListings.length}
          onNavigateToResults={handleNavigateToResults}
          allListings={strapiListings}
          filters={filters}
          setFilters={setFilters}
        />
      </section>
      
      {/* 3. FAQ Section */}
      <div className="md:container md:mx-auto md:px-4 w-full mb-4">
        <div className="md:max-w-4xl md:mx-auto">
          <ResponsiveFaqSection />
        </div>
      </div>

      {/* Banner under FAQ (right before Featured Listings) */}
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

      {/* Paginated Layout Section (now handled by IndexRender) */}
      <IndexRender
        strapiListings={strapiListings}
        loading={loading}
        error={error}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        premListings={premListings}
        featuredListings={featuredListings}
        stdListings={stdListings}
      />

      <Footer />
    </div>
  );
}