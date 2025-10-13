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
import { useQuery } from '@apollo/client';
import { GET_LISTINGS } from '@/graphql/queries/getListings';
import { GET_MANUFACTURERS } from "@/graphql/queries/getManufacturers"
import FeaturedListings from "@/components/FeaturedListings";
import FeaturedManufacturer from "@/components/FeaturedManufacturer";
import BannerAd from "@/components/BannerAd"

import IndexRender from "./indexRender";
import { useListingCategories } from "@/hooks/use-ListingCategories"

export default function Home() {
  // Add CSS to hide all "2 Branches" and "Available at 2 Branches" elements
  useEffect(() => {
    // Function to hide all instances of "2 Branches" and "Available at 2 Branches"
    const hideBranchesElements = () => {
      // Add CSS to hide blue buttons
      const style = document.createElement('style');
      style.textContent = `
        /* Hide blue buttons with "2 Branches" text */
        .bg-blue-500, .bg-blue-600, [class*="bg-blue-"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Find all elements that might contain the text
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(el => {
        // Check if element contains the target text
        const text = el.textContent?.trim() || '';
        
        // If element contains exactly "2 Branches" text or "Available at 2 Branches", hide it
        if (text === '2 Branches' || text === 'Available at 2 Branches') {
          el.style.display = 'none';
        }
        
        // Also check for elements containing the text as part of their content
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
          const nodeText = el.childNodes[0].textContent.trim();
          if (nodeText === '2 Branches' || nodeText === 'Available at 2 Branches') {
            el.style.display = 'none';
            
            // Also hide parent if it's likely just a wrapper
            if (el.parentElement && el.parentElement.childElementCount <= 2) {
              el.parentElement.style.display = 'none';
            }
          }
        }
      });
    };

    // Run the function on load
    hideBranchesElements();

    // Set up a mutation observer to handle dynamically added content
    const observer = new MutationObserver(() => {
      hideBranchesElements();
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up function
    return () => {
      observer.disconnect();
    };
  }, []);
  
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

  const { data, loading, error } = useQuery(GET_LISTINGS);
  // const strapiListings = data?.listings || [];

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
  const { data: manufacturersData } = useQuery(GET_MANUFACTURERS);

  const bannerPool = useMemo(
    () =>
      (manufacturersData?.companies || [])
        .map((c) => {
          const u = c?.bannerAd?.url;
          return typeof u === "string" ? u.trim() : null;
        })
        .filter((u) => typeof u === "string" && u.length > 0),
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

      {/* 11. Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">About TombstonesFinder.co.za</h4>
              <p className="text-yellow-500 text-sm">
                TombstonesFinder.co.za helps you honour your loved one by finding the perfect tombstone. Search trusted local manufacturers, compare designs, materials, budgets, and custom options — all in one place.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: "Home", href: "/" },
                  { name: "Find a Tombstone", href: "/tombstones-for-sale" },
                  { name: "Find a Manufacturer", href: "/manufacturers" },
                  { name: "Services", href: "/services/tombstone-finance" },
                  { name: "Contact Us", href: "/contact" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link.name}
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
            <p>&copy; {new Date().getFullYear()} TombstonesFinder.co.za. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
