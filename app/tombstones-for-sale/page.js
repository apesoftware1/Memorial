"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Search, ChevronRight, Menu, X } from "lucide-react"
import Header from "@/components/Header"
import Image from "next/image"

// Import the useFavorites hook and our new components
import { useFavorites } from "@/context/favorites-context"
import { ProductCard } from "@/components/product-card"
import { PremiumListingCard } from "@/components/premium-listing-card"
import TombstonesForSaleFilters from "@/components/TombstonesForSaleFilters"

// Import premium listings from lib/data.js
import { premiumListings } from '@/lib/data';

// Remove the local featuredListings array and import it from the homepage
import { featuredListings } from '../page';

export default function TombstonesForSale() {
  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false)

  // State for active filters
  const [activeFilters, setActiveFilters] = useState({
    minPrice: "Min Price",
    maxPrice: "Max Price",
    location: null,
    stoneType: null,
    color: null,
    culture: null,
    designTheme: null,
    custom: null,
  })

  // State for sort order
  const [sortOrder, setSortOrder] = useState("Default")

  // Add the useFavorites hook to the component
  // Add this near the top of the component, with the other useState declarations:
  const { totalFavorites } = useFavorites()

  // Filter options
  const filterOptions = {
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    stoneType: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
    color: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
    culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
    designTheme: ["Cross", "Angel", "Heart", "Book", "Traditional", "Modern", "Custom"],
    custom: ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"],
  }

  // State for mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // State for mobile sort dropdown
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // For closing modal on outside click
  const sortModalRef = useRef();
  useEffect(() => {
    if (!showSortDropdown) return;
    function handleClick(e) {
      if (sortModalRef.current && !sortModalRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSortDropdown]);

  // --- FILTERING LOGIC ---
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^\d]/g, ""));
  }

  // Store the initial total count for display
  const totalListingsCount = premiumListings.length;

  // Filtering
  const filteredPremiumListings = premiumListings.filter(listing => {
    // Location
    if (activeFilters.location && activeFilters.location !== "All" && activeFilters.location !== "") {
      if (!listing.location?.toLowerCase().includes(activeFilters.location.toLowerCase())) return false;
    }
    // Stone Type
    if (activeFilters.stoneType && activeFilters.stoneType !== "All" && activeFilters.stoneType !== "") {
      const stoneType = listing.stoneType || listing.details || "";
      if (!stoneType.toLowerCase().includes(activeFilters.stoneType.toLowerCase())) return false;
    }
    // Color
    if (activeFilters.color && activeFilters.color !== "All" && activeFilters.color !== "") {
      if (!listing.colour || !listing.colour[activeFilters.color.toLowerCase()]) return false;
    }
    // Culture
    if (activeFilters.culture && activeFilters.culture !== "All" && activeFilters.culture !== "") {
      if (!listing.culture || !listing.culture.toLowerCase().includes(activeFilters.culture.toLowerCase())) return false;
    }
    // Design Theme
    if (activeFilters.designTheme && activeFilters.designTheme !== "All" && activeFilters.designTheme !== "") {
      const theme = listing.details || listing.style || "";
      if (!theme.toLowerCase().includes(activeFilters.designTheme.toLowerCase())) return false;
    }
    // Custom
    if (activeFilters.custom && activeFilters.custom !== "All" && activeFilters.custom !== "") {
      const features = listing.features || "";
      if (!features.toLowerCase().includes(activeFilters.custom.toLowerCase())) return false;
    }
    // Min Price
    if (activeFilters.minPrice && activeFilters.minPrice !== "Min Price" && activeFilters.minPrice !== "") {
      const min = parsePrice(activeFilters.minPrice);
      if (parsePrice(listing.price) < min) return false;
    }
    // Max Price
    if (activeFilters.maxPrice && activeFilters.maxPrice !== "Max Price" && activeFilters.maxPrice !== "") {
      const max = parsePrice(activeFilters.maxPrice);
      if (parsePrice(listing.price) > max) return false;
    }
    return true;
  });

  // --- SORTING LOGIC ---
  let sortedPremiumListings = [...filteredPremiumListings];
  if (sortOrder === "Price: Low to High") {
    sortedPremiumListings.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortOrder === "Price: High to Low") {
    sortedPremiumListings.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sortOrder === "Newest First") {
    // If you have a date field, use it. Otherwise, sort by id descending as a fallback.
    sortedPremiumListings.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  // --- RESET FILTERS ---
  function handleResetFilters() {
    setActiveFilters({
      minPrice: "Min Price",
      maxPrice: "Max Price",
      location: null,
      stoneType: null,
      color: null,
      culture: null,
      designTheme: null,
      custom: null,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileFilterClick={() => setMobileFilterOpen(true)} />
      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <span className="font-bold text-lg">Filters</span>
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close Filters"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TombstonesForSaleFilters
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filterOptions={filterOptions}
            />
          </div>
        </div>
      )}
      {/* Search Bar */}
      <div className="bg-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search Location, Colour, Manufacturer..."
                className="w-full p-2 pr-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 text-white p-2 px-4 rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2">
            <button className="text-gray-300 hover:text-white text-sm transition-colors" onClick={handleResetFilters}>Reset</button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link href="/" className="hover:text-gray-700 transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-700">Tombstones For Sale</span>
              </li>
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tombstones For Sale</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Left Side */}
            <div className="w-full md:w-1/4 hidden sm:block">
              <TombstonesForSaleFilters
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterOptions={filterOptions}
              />
            </div>

            {/* Product Listings - Right Side */}
            <div className="w-full md:w-3/4">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  {filteredPremiumListings.length === totalListingsCount
                    ? `${totalListingsCount} Listings For Sale`
                    : `${filteredPremiumListings.length} Results (of ${totalListingsCount})`}
                </p>
                <div className="flex items-center">
                  {/* Mobile Sort Button */}
                  <div className="sm:hidden flex items-center text-blue-600 font-semibold cursor-pointer select-none" onClick={() => setShowSortDropdown(!showSortDropdown)}>
                    <span className="mr-1">Sort</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {/* Mobile Sort Modal */}
                  {showSortDropdown && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 sm:hidden">
                      <div ref={sortModalRef} className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up">
                        {['Default', 'Price: Low to High', 'Price: High to Low', 'Newest First'].map(option => (
                          <div
                            key={option}
                            className={`flex items-center justify-between px-2 py-4 text-lg border-b border-[#333] last:border-b-0 cursor-pointer ${sortOrder === option ? 'text-white font-bold' : 'text-gray-200'}`}
                            onClick={() => { setSortOrder(option); setShowSortDropdown(false); }}
                          >
                            <span>{option}</span>
                            <span className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${sortOrder === option ? 'border-blue-500' : 'border-gray-500'}`}
                                  style={{ background: sortOrder === option ? '#2196f3' : 'transparent' }}>
                              {sortOrder === option && <span className="block w-3 h-3 bg-white rounded-full"></span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Desktop Sort Dropdown */}
                  <div className="hidden sm:flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Sort by</span>
                    <select
                      className="p-1 border border-gray-300 rounded text-sm"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option>Default</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Featured Listings */}
              <div className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">FEATURED LISTINGS</h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredListings.map((product, index) => (
                    <ProductCard key={index} product={product} />
                  ))}
                </div>
              </div>

              {/* Premium Listings */}
              <section className="py-4">
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">PREMIUM LISTINGS</h3>
                    <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

                    <div className="space-y-6">
                      {sortedPremiumListings.map((listing) => (
                        <PremiumListingCard key={listing.id} listing={listing} href={`/memorial/${listing.id}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Regular Listings */}
              <div>
                <h2 className="text-gray-600 border-b border-gray-300 pb-2 mb-4">ALL TOMBSTONES</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...featuredListings, ...featuredListings].map((product, index) => (
                    <ProductCard
                      key={`regular-${index}`}
                      product={{ ...product, id: `regular-${product.id}-${index}` }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <nav className="inline-flex rounded-md shadow">
                    <a
                      href="#"
                      className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      2
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      3
                    </a>
                    <span className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <a
                      href="#"
                      className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      10
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
