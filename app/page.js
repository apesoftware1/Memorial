"use client"

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Check, Info, X, LandmarkIcon as Monument, Landmark, Layers, Square } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { useFavorites } from "@/context/favorites-context"
import { ProductCard } from "@/components/product-card"
import { StandardListingCard } from "@/components/standard-listing-card"
import SearchBox from "@/components/SearchBox"
import CategoryTabs from "@/components/CategoryTabs.jsx"
import FaqSection from "@/components/FaqSection"
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
import BannerAd from "@/components/BannerAd"
import { useQuery } from '@apollo/client';
import { GET_LISTINGS } from '@/graphql/queries/getListings';
import FeaturedListings from "@/components/FeaturedListings";
import FeaturedManufacturer from "@/components/FeaturedManufacturer";

import IndexRender from "./indexRender";
import { useListingCategories } from "@/hooks/use-ListingCategories"





export default function Home() {
  const { categories, loading: _loading } = useListingCategories()
  const [activeTab, setActiveTab] = useState(0)
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

  const activeCategory = categories[activeTab]
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
  const handleNavigateToResults = useCallback(() => {
    // Build query parameters from current filters and category
    const params = new URLSearchParams();
    
    // Add category if selected
    if (activeTab !== 0) {
      const category = categories[activeTab]?.name;
      if (category) {
        params.append('category', category);
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

  const { data, loading, error } = useQuery(GET_LISTINGS);
  // const strapiListings = data?.listings || [];

  // Filter and populate the arrays after fetching listings

// Memoize listings to avoid re-processing on each render
const strapiListings = useMemo(() => data?.listings || [], [data]);

useEffect(() => {
  if (!Array.isArray(strapiListings) || loading || error) return;

  console.log('All listings from Strapi:', strapiListings);
  console.log('Total listings count:', strapiListings.length);

  const premium = strapiListings.filter(l => l.isPremium);
  const featured = strapiListings.filter(l => l.isFeatured);
  const standard = strapiListings.filter(l =>
    typeof l.isStandard === 'boolean'
      ? l.isStandard
      : !l.isPremium && !l.isFeatured
  );

  console.log('Premium listings:', premium.length);
  console.log('Featured listings:', featured.length);
  console.log('Standard listings:', standard.length);
  console.log('Standard listings details:', standard.map(l => ({ id: l.documentId, title: l.title, isStandard: l.isStandard, isPremium: l.isPremium, isFeatured: l.isFeatured })));

  setPremListings(premium);
  setFeaturedListings(featured);
  setStdListings(standard);
}, [strapiListings, loading, error]);

if (_loading) return <PageLoader text="Loading categories..." />
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
        {/* Background Image - Hidden on mobile */}
        <div className="absolute inset-0 z-0 hidden sm:block">
          <Image
            src={activeCategory?.backgroundImage?.url || "/placeholder.svg"}
            alt= {activeCategory?.name || "Category background"}
            fill
            className="object-cover"
            priority
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
        />
      </section>
      
      {/* 3. FAQ Section */}
      <div className="container mx-auto px-4 mb-4">
        <div className="max-w-4xl mx-auto">
          <FaqSection />
        </div>
      </div>
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <BannerAd />
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

      {/* 11. Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">About TombstoneFinder.CO.ZA</h4>
              <p className="text-gray-600">
                TombstoneFinder.CO.ZA connects you with trusted tombstone manufacturers and suppliers across South Africa.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "Find a Tombstone", "Find a Manufacturer", "Services", "Contact Us"].map((link, index) => (
                  <li key={index}>
                    <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <address className="text-gray-300 text-sm not-italic">
                <p>Email: info@tombstonefinder.co.za</p>
                <p>Phone: +27 12 345 6789</p>
                <p>Address: 123 Memorial Street, Pretoria, South Africa</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} TombstoneFinder.CO.ZA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}