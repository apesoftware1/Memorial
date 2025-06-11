"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
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
import FilterDropdown from "@/components/FilterDropdown"
import SearchForm from "@/components/SearchForm"
import SearchContainer from "@/components/SearchContainer.jsx"
import Pagination from "@/components/Pagination"
import { PremiumListingCard } from "@/components/premium-listing-card"
import dynamic from "next/dynamic"
import Header from "@/components/Header"
import BannerAd from "@/components/BannerAd"

// Import necessary data from lib/data.js
import { premiumListings, manufacturerProducts, standardListings } from '@/lib/data'

// Static data moved outside component
  const filterOptions = {
  minPrice: [
    "R 5,001",
    "R 10,001",
    "R 15,001",
    "R 20,001",
    "R 25,001",
    "R 30,001",
    "R 40,001",
    "R 50,001",
    "R 75,001",
    "R 100,001",
    "R 150,001",
    "R 200,001"
  ],
  maxPrice: [
    "R 10,000",
    "R 15,000",
    "R 20,000",
    "R 25,000",
    "R 30,000",
    "R 40,000",
    "R 50,000",
    "R 75,000",
    "R 100,000",
    "R 150,000",
    "R 200,000",
    "R 200,000+"
  ],
    colour: ["BLACK", "DARK GREY", "LIGHT GREY", "WHITE", "LIGHT PINK", "RED", "MAROON", "GOLD", "BLUE", "GREEN", "MIXED"],
    style: ["CHRISTIAN CROSS", "HEART", "BIBLE", "PILLARS", "TRADITIONAL AFRICAN", "ABSTRACT", "PRAYING HANDS", "SCROLL", "ANGEL", "MAUSOLEAM", "OBELISK", "PLAIN", "TEDDY BEAR", "BUTTERFLY", "CAR", "BIKE", "SPORTS"],
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    stoneType: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
    culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
    custom: ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"],
    bodyType: ["Full Tombstone", "Headstone", "Double Headstone", "Cremation Memorial", "Family Monument", "Child Memorial", "Custom Design"],
};

  const locationsData = [
  { id: 'all', name: 'All locations', count: 11 },
  { id: 'gauteng', name: 'Gauteng', count: 2 },
  { id: 'western-cape', name: 'Western Cape', count: 1 },
  { id: 'kwazulu-natal', name: 'KwaZulu Natal', count: 1 },
  { id: 'north-west', name: 'North West', count: 0 },
  { id: 'mpumalanga', name: 'Mpumalanga', count: 0 },
  { id: 'eastern-cape', name: 'Eastern Cape', count: 0 },
  { id: 'free-state', name: 'Free State', count: 1 },
  { id: 'limpopo', name: 'Limpopo', count: 0 },
  { id: 'northern-cape', name: 'Northern Cape', count: 0 },
];

  const faqData = [
    {
      question: "How much does a Tombstone cost?",
    answer: "The cost of a tombstone in South Africa can range from R4,000 to R40,000 or more, depending on the size, material, and complexity of the design. Basic tombstones might fall within the R8,000 - R15,000 range, while premium or custom designs can cost significantly more. The final price will depend on various factors, with material and design being the most important factors that will impact the overall budget.",
    },
    {
      question: "How do I find a Tombstone Manufacturer?",
    answer: "You can find a tombstone manufacturer by using our search tool. Simply enter your location and preferences to see a list of manufacturers in your area.",
    },
    {
      question: "What materials are used to make a Tombstone?",
    answer: "Common materials used for tombstones include granite, marble, sandstone, limestone, and bronze. Granite is the most popular due to its durability and resistance to weathering.",
    },
    {
      question: "What Design elements do I look for?",
    answer: "Consider design elements such as shape, size, color, engravings, religious symbols, and personalized features that reflect the personality of your loved one.",
    },
    {
      question: "How long does a Tombstone take to be made?",
    answer: "The production time for a tombstone typically ranges from 4-12 weeks, depending on the complexity of the design, material availability, and customization requirements.",
    },
    {
      question: "Can I add personal photos, engravings or special designs?",
    answer: "Yes, most manufacturers offer personalization options including photo engravings, custom text, special designs, and even QR codes linking to memorial websites.",
    },
    {
      question: "Are there ways whereby I can finance a Tombstone?",
    answer: "Many manufacturers offer payment plans, and there are also funeral policies and insurance options that can cover tombstone costs. Some manufacturers may offer layaway plans or installment options.",
    },
];

  const categoryBackgrounds = {
    "TOMBSTONES": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "PREMIUM": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "FAMILY": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "CHILD": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "HEAD": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "CREMATION": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
};

  const featuredListings = [
    {
      id: "white-Cross",
      image: "/X20Tombstone_Pic Sets/cross1/Cross_Main.jpg",
      price: "R 10 200",
      title: "WHITE CROSS...",
      details: "Full Tombstone | Granite | Cross Theme",
      tag: "Great Price",
    },
    {
      id: "white-angel",
      image: "/X20Tombstone_Pic Sets/bible/Bible_Main.jpg",
      price: "R 28 500",
      title: "WHITE ANGEL...",
      details: "Full Tombstone | Granite | Bible Theme",
      tag: "Great Price",
    },
    {
      id: "gold-cross",
      image: "/X20Tombstone_Pic Sets/cross2/Cross2_Main.jpg",
      price: "R 19 900",
      title: "GOLD CROSS...",
      details: "Full Tombstone | Marble | Cross Theme",
      tag: "Great Price",
    },
];

// Dynamic imports for large sections
const DynamicFeaturedListings = dynamic(() => import('@/components/FeaturedListings'), {
  loading: () => <div className="animate-pulse">Loading featured listings...</div>,
  ssr: false
})

const DynamicPremiumListings = dynamic(() => import('@/components/PremiumListings'), {
  loading: () => <div className="animate-pulse">Loading premium listings...</div>,
  ssr: false
})

const DynamicStandardListings = dynamic(() => import('@/components/StandardListings'), {
  loading: () => <div className="animate-pulse">Loading standard listings...</div>,
  ssr: false
})

export default function Home() {
  // Combined state for UI controls
  const [uiState, setUiState] = useState({
    showAllOptions: false,
    openDropdown: null,
    searchDropdownOpen: false,
    locationModalOpen: false,
    activeTooltip: null,
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

  // State for filter selections
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

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState("TOMBSTONES");
  const [selectedTown, setSelectedTown] = useState(null);

  // Add the useFavorites hook to the component
  const { totalFavorites } = useFavorites();

  // Close dropdowns when clicking outside
  const dropdownRefs = useRef({})

  // Memoized event handlers
  const handleClickOutside = useCallback((event) => {
    if (uiState.openDropdown && dropdownRefs.current[uiState.openDropdown] && !dropdownRefs.current[uiState.openDropdown].contains(event.target)) {
      setUiState(prev => ({ ...prev, openDropdown: null }))
    }
    if (uiState.searchDropdownOpen && dropdownRefs.current['search'] && !dropdownRefs.current['search'].contains(event.target)) {
      setUiState(prev => ({ ...prev, searchDropdownOpen: false }));
    }
    if (uiState.openDropdown === 'location' && dropdownRefs.current['location'] && !dropdownRefs.current['location'].contains(event.target)) {
      setUiState(prev => ({ ...prev, openDropdown: null }))
    }
  }, [uiState.openDropdown, uiState.searchDropdownOpen]);

  const handleTownSelect = useCallback((town) => {
    setSelectedTown(town)
    setUiState(prev => ({ ...prev, searchDropdownOpen: false }))
  }, []);

  const toggleDropdown = useCallback((name) => {
    if (name === 'location' && window.innerWidth < 640) {
      setUiState(prev => ({ ...prev, locationModalOpen: true, openDropdown: null }))
    } else {
      setUiState(prev => ({ ...prev, openDropdown: prev.openDropdown === name ? null : name }))
    }
  }, []);

  const selectOption = useCallback((name, option) => {
    setFilters(prev => ({
      ...prev,
      [name]: option,
    }))
    setUiState(prev => ({ ...prev, openDropdown: null }))
    if (name === 'location') {
      setUiState(prev => ({ ...prev, locationModalOpen: false }))
    }
  }, []);

  const handleLocationModalClose = useCallback(() => {
    setUiState(prev => ({ ...prev, locationModalOpen: false }));
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  // Add these functions before the return statement
  const handleLocationSelect = (province) => {
    // This function is no longer needed as location selection is handled by the integrated component logic
  }

  const getDisplayValue = () => {
    if (selectedTown) {
      return `${selectedTown}, ${filters.location}`
    } else if (filters.location) {
      return filters.location
    }
    return ""
  }

  // Memoized components
  const MemoizedFaqTooltip = memo(({ faq, index }) => {
    return (
      <div className="relative">
        <button
          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 group w-full justify-between text-left"
          onClick={() => handleTooltipToggle(index)}
          aria-expanded={uiState.activeTooltip === index}
          style={{
            clipPath: 'polygon(0% 0%, 97% 0%, 100% 50%, 97% 100%, 0% 100%)',
          }}
        >
          <span className="flex items-center">
            {index === 0 && <span className="mr-1">→</span>}
            {faq.question}
          </span>
          <Info className="h-3 w-3 opacity-70 flex-shrink-0" />
        </button>

        {uiState.activeTooltip === index && (
          <div className="absolute z-50 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 p-3 text-sm text-gray-700 animate-slide-in">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-gray-900">{faq.question}</h4>
              <button onClick={() => handleTooltipToggle(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p>{faq.answer}</p>
          </div>
        )}
      </div>
    )
  });

  const MemoizedBannerAd = memo(({ mobileImageSrc, desktopImageSrc, mobileContainerClasses, desktopContainerClasses }) => (
    <BannerAd
      mobileImageSrc={mobileImageSrc}
      desktopImageSrc={desktopImageSrc}
      mobileContainerClasses={mobileContainerClasses}
      desktopContainerClasses={desktopContainerClasses}
    />
  ));

  const MemoizedFeaturedListingCard = memo(({ product }) => (
    <div className="border border-gray-300 rounded bg-white p-4 hover:shadow-md transition-shadow">
      <Image
        src={product.image || "/placeholder.svg"}
        alt={product.title}
        width={300}
        height={200}
        className="mb-2 rounded"
      />
      <h4 className="font-semibold text-gray-800">{product.title}</h4>
      <p className="text-gray-600 text-sm">{product.details}</p>
      <p className="text-gray-900 font-bold">{product.price}</p>
      {product.tag && (
        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full inline-block mt-2">
          {product.tag}
        </div>
      )}
    </div>
  ));

  // Function to filter listings based on selected filters
  const getFilteredListings = useCallback(() => {
    let filteredListings = [...premiumListings, ...featuredListings, ...manufacturerProducts];

    // Filter by category tab
    if (selectedCategory !== "TOMBSTONES") {
      filteredListings = filteredListings.filter(listing => {
        const details = listing.details?.toLowerCase() || '';
        switch (selectedCategory) {
          case "PREMIUM":
            return listing.tag?.toLowerCase().includes('premium') || 
                   listing.tagColor?.includes('blue') || 
                   listing.tagColor?.includes('purple');
          case "FAMILY":
            return details.includes('family') || 
                   listing.tag?.toLowerCase().includes('family') ||
                   details.includes('double');
          case "CHILD":
            return details.includes('child') || 
                   listing.tag?.toLowerCase().includes('child');
          case "HEAD":
            return details.includes('headstone') || 
                   details.includes('head stone');
          case "CREMATION":
            return details.includes('cremation') || 
                   details.includes('urn');
          default:
            return true;
        }
      });
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      filteredListings = filteredListings.filter(listing => {
        if (!listing.price) return false;
        const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
        const minPrice = filters.minPrice ? parseInt(filters.minPrice.replace(/[^0-9]/g, '')) : 0;
        const maxPrice = filters.maxPrice ? parseInt(filters.maxPrice.replace(/[^0-9]/g, '')) : Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filter by location
    if (filters.location && filters.location !== 'All locations') {
      filteredListings = filteredListings.filter(listing => 
        listing.location && listing.location.includes(filters.location)
      );
    }

    // Filter by body type
    if (filters.bodyType) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.bodyType.toLowerCase())
      );
    }

    // Filter by design theme
    if (filters.style) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.style.toLowerCase())
      );
    }

    // Filter by colour
    if (filters.colour) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.colour.toLowerCase())
      );
    }

    // Filter by stone type
    if (filters.stoneType) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.stoneType.toLowerCase())
      );
    }

    // Filter by culture
    if (filters.culture) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.culture.toLowerCase())
      );
    }

    // Filter by custom features
    if (filters.custom) {
      filteredListings = filteredListings.filter(listing => 
        listing.features && listing.features.toLowerCase().includes(filters.custom.toLowerCase())
      );
    }

    return filteredListings;
  }, [filters, selectedCategory]);

  // Get filtered listings count
  const filteredCount = getFilteredListings().length;

  // Add loading state
  const [isSearching, setIsSearching] = useState(false);

  // Function to handle search
  const handleSearch = useCallback(() => {
    setIsSearching(true);
    const results = getFilteredListings();
    // Simulate a small delay to show loading state
    setTimeout(() => {
      setIsSearching(false);
      // Here you can add additional search functionality
      console.log('Search results:', results);
    }, 800); // 800ms delay to show loading animation
  }, [getFilteredListings]);

  // Update search button text based on category
  const getSearchButtonText = () => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Searching...
        </div>
      );
    }
    if (selectedCategory === "CREMATION") {
      return `Search ${filteredCount} Cremation Memorials`;
    }
    if (selectedCategory && selectedCategory !== "TOMBSTONES") {
      // Capitalize first letter, lowercase the rest for category
      const category = selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase();
      return `Search ${filteredCount} ${category} Tombstones`;
    }
    return `Search ${filteredCount} Tombstones`;
  };

  // Add search suggestions data
  const searchSuggestions = [
    "tombstone", "headstone", "gravestone", "grave marker", "memorial stone",
    "grave headstone", "granite tombstone", "marble headstone", "custom tombstone",
    "engraved headstone", "cemetery stone", "funeral stone", "affordable tombstone",
    "cheap headstone", "baby tombstone", "pet tombstone", "family headstone",
    "double headstone", "upright tombstone", "flat marker", "cross headstone",
    "black granite", "white marble", "angel tombstone", "Christian headstone",
    "Muslim tombstone", "personalized tombstone", "traditional tombstone",
    "modern headstone", "classic tombstone", "photo headstone", "cemetery monument",
    "memorial plaque", "burial stone", "tombstone engraving", "engraved plaque",
    "cremation memorial", "grave design", "headstone shop", "tombstone supplier",
    "buy tombstone", "headstone prices", "tombstone catalogue", "gravestone near me",
    "headstone for child", "veteran headstone", "memorial design", "online tombstone",
    "tombstone for sale", "cemetery headstone"
  ];

  // Add state for search input and suggestions
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Function to handle search input changes
  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value);
    if (value.trim()) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show top 5 matches
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Function to handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    // You can add additional logic here to trigger search with the selected suggestion
  }, []);

  // Split premium listings into two sections
  const premiumListingsSection1 = premiumListings.slice(0, 5);
  const premiumListingsSection2 = premiumListings.slice(5, 10);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 items per page (5 premium + 5 standard)

  // Calculate total pages based on all listings
  const totalListings = premiumListings.length + standardListings.length;
  const totalPages = Math.ceil(totalListings / itemsPerPage);

  // Header state handlers
  const handleMobileMenuToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState(prev => ({ ...prev, mobileDropdown: prev.mobileDropdown === section ? null : section }))
  }, []);

  return (
    <div>
      <Header
        mobileMenuOpen={uiState.mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={uiState.mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />
      <main className="min-h-screen bg-white">
        {/* Hero Section with Search */}
        <section className="relative flex items-center justify-center bg-[#333]">
          {/* Background Image - Hidden on mobile */}
          <div className="absolute inset-0 z-0 hidden sm:block">
            <Image
              src={categoryBackgrounds[selectedCategory] || "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg"}
              alt={`${selectedCategory} background`}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content Container */}
            <div className="relative z-10 w-full md:max-w-lg md:ml-32 md:mr-auto flex flex-col items-center h-full pt-0 md:pt-20">
            {/* Category Tabs Container */}
              <div className="w-full md:max-w-lg bg-[#1a2238] overflow-hidden">
            <CategoryTabs
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
              </div>

            {/* Main Search Box */}
            <SearchContainer
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filters={filters}
              setFilters={setFilters}
              setSelectedTown={setSelectedTown}
              handleSearch={handleSearch}
              locationsData={locationsData}
              filterOptions={filterOptions}
              isSearching={isSearching}
              getSearchButtonText={getSearchButtonText}
              locationModalOpen={uiState.locationModalOpen}
              handleLocationModalClose={handleLocationModalClose}
              parentToggleDropdown={toggleDropdown}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <FaqSection />
          </div>
        </section>

        {/* Location Selection Modal (Mobile Only) */}
        <LocationModal
          isOpen={uiState.locationModalOpen}
          onClose={handleLocationModalClose}
          locationsData={locationsData}
          onSelectLocation={(locationName) => selectOption('location', locationName)}
        />

        {/* Following the order from the image */}

        {/* 1. Banner Ad (Animated Gif - Linked to Google Ads) */}
        <div className="max-w-4xl mx-auto px-0">
          <MemoizedBannerAd
            mobileImageSrc="/banner/Generic Banner AD.jpg"
            desktopImageSrc="/banner/Generic Banner AD.jpg"
            mobileContainerClasses="w-full h-24"
            desktopContainerClasses="h-24"
          />
        </div>

        {/* 2. X3 Featured Listings */}
        <section className="pt-4 pb-0 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-0">
                <div className="flex-grow border-t border-gray-300"></div>
                <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-sm uppercase">FEATURED LISTINGS</h3>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <DynamicFeaturedListings listings={featuredListings} />
            </div>
          </div>
        </section>

        {/* 3. X5 Premium Listings */}
        <section className="pt-4 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-0">
                <div className="flex-grow border-t border-gray-300"></div>
                <h3 className="flex-shrink-0 mx-4 text-center text-gray-600  text-sm uppercase">PREMIUM LISTINGS</h3>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>
              <DynamicPremiumListings listings={premiumListingsSection1} />
            </div>
          </div>
        </section>

        {/* 4. Banner Ad (Animated Gif - Linked to Google Ads)other banner ads mobile only*/}
        <div className="max-w-4xl mx-auto px-0">
          <MemoizedBannerAd mobileImageSrc={null} desktopImageSrc={null} mobileContainerClasses="w-full h-24" desktopContainerClasses="h-24" />
        </div>

        {/* 5. X5 Premium Listings */}
        <section className="pt-4 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-0">
                <div className="flex-grow border-t border-gray-300"></div>
                <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-sm uppercase">PREMIUM LISTINGS</h3>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>
              <DynamicPremiumListings listings={premiumListingsSection2} />
            </div>
          </div>
        </section>

        {/* 6. Featured Manufacturer */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-center text-gray-600 mb-2">Featured Manufacturer</h3>
              <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

              <div className="border border-gray-300 rounded bg-white p-4 mb-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                  <div>
                    <h4 className="font-bold text-gray-800 text-xl mb-1">ABC Tombstones PTY Ltd</h4>
                  </div>
                  <div>
                    <Image
                        src="/new files/company logos/Tombstone Manufacturer Logo-SwissStone.svg"
                      alt="ABC Tombstones Logo"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <Link
                  href="#"
                  className="text-blue-600 text-sm hover:text-blue-700 hover:underline transition-colors inline-block mt-2"
                >
                  View more matching tombstones
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {manufacturerProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Standard Listings */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-sm uppercase">STANDARD LISTINGS</h3>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <p className="text-center text-xs text-gray-500 mb-4">*Non-Sponsored</p>
              <DynamicStandardListings listings={standardListings} />
            </div>
          </div>
        </section>

        {/* 8. Banner Ad (Animated Gif - Linked to Google Ads) desktop only*/}
        <div className="max-w-4xl mx-auto px-0">
          <MemoizedBannerAd mobileImageSrc={null} desktopImageSrc={null} mobileContainerClasses="w-full h-24" desktopContainerClasses="h-24" />
        </div>

        {/* 9. Standard Listings */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <h3 className="flex-shrink-0 mx-4 text-center text-gray-600  text-sm uppercase">STANDARD LISTINGS</h3>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <p className="text-center text-xs text-gray-500 mb-4">*Non-Sponsored</p>
              <DynamicStandardListings listings={standardListings} />
            </div>
          </div>
        </section>

        {/* Add pagination just before footer */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Footer */}
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

        <style jsx>{`
          .more-options-slide {
            transform: translateX(100%);
            transition: transform 0.7s ease-in-out;
          }
          .more-options-slide.open {
            transform: translateX(0);
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-in {
            animation: slide-in 0.2s ease-out;
          }
        `}</style>
      </main>
    </div>
  )
}