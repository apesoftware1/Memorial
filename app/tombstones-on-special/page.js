"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Search, ChevronRight, Camera } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"
import Header from "@/components/Header"

// Import the useFavorites hook and our new components
import { useFavorites } from "@/context/favorites-context"
import { FavoriteButton } from "@/components/favorite-button"

// Import Apollo Client for data fetching
import { useQuery } from "@apollo/client"
import { GET_LISTINGS } from "@/graphql/queries/getListings"

export default function TombstonesOnSpecial() {
  // State for UI controls (for Header component)
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

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
  const { totalFavorites } = useFavorites()

  // State for mobile sort dropdown
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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

  // Fetch real listings from GraphQL backend
  const { data, loading, error } = useQuery(GET_LISTINGS);

  // Handlers for Header component
  const handleMobileMenuToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState(prev => ({ ...prev, mobileDropdown: prev.mobileDropdown === section ? null : section }))
  }, []);

  // Map a raw listing from GraphQL to the format expected by our card components
  const mapListingToProduct = useCallback((listing) => {
    // Get the active special (we already filtered for active specials)
    const activeSpecial = listing.specials?.[0]; // Take the first active special
    
    // Format original price with proper South African formatting
    const originalPriceNum = typeof listing.price === "number"
      ? listing.price
      : parseFloat(String(listing.price).replace(/[^\d.]/g, "")) || 0;

    const formattedOriginalPrice = `R ${originalPriceNum.toLocaleString("en-ZA", { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).replace(/,/g, " ")}`;

    // Format special sale price
    const salePriceNum = activeSpecial?.sale_price || originalPriceNum;
    const formattedSalePrice = `R ${salePriceNum.toLocaleString("en-ZA", { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).replace(/,/g, " ")}`;

    // Calculate discount percentage if there's a special
    const discountPercentage = activeSpecial?.sale_price && originalPriceNum > 0 
      ? Math.round(((originalPriceNum - activeSpecial.sale_price) / originalPriceNum) * 100)
      : 0;
    
    const discount = discountPercentage > 0 ? `${discountPercentage}% OFF` : "";

    // Use special end_date for countdown timer
    const endDate = activeSpecial?.end_date 
      ? new Date(activeSpecial.end_date).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // fallback to 30 days

    // Build details string from available data
    const details = [
      listing.listing_category?.name,
      listing.productDetails?.stoneType?.[0]?.value,
      listing.productDetails?.style?.[0]?.value
    ].filter(Boolean).join(" | ") || listing.description || "";

    // Build features string from customization options
    const features = listing.productDetails?.customization?.map(c => c.value).join(" | ") || "";

    // Calculate image count
    const getImageCount = () => {
      let count = 0;
      if (listing.mainImageUrl) count += 1;
      if (listing.thumbnailUrls && Array.isArray(listing.thumbnailUrls)) {
        count += listing.thumbnailUrls.length;
      }
      return count;
    };

    return {
      id: listing.documentId,
      image: listing.mainImageUrl || "/placeholder.svg",
      originalPrice: formattedOriginalPrice,
      salePrice: formattedSalePrice,
      discount: discount,
      title: listing.title || "Untitled",
      details: details,
      tag: listing.adFlasher || "SPECIAL OFFER",
      tagColor: "bg-red-600",
      endDate: endDate,
      manufacturer: listing.company?.name || "",
      location: listing.company?.location || "",
      features: features,
      logo: listing.company?.logo?.url || "/placeholder-logo.svg",
      imageCount: getImageCount(),
    };
  }, []);

  // Process the fetched data - Filter by special.active
  const allListings = data?.listings || [];

// Debug logging for special filtering

  console.log(
    'First few listings special status:',
    allListings.slice(0, 5).map(listing => ({
      id: listing.documentId,
      title: listing.title,
      specialsType: Array.isArray(listing.specials) ? 'array' : typeof listing.specials,
      specials: listing.specials
    }))
  );

  // Filter where specials is an array AND every special is active
  const specialListings = allListings.filter(listing => {

    return (
      Array.isArray(listing.specials) &&
      listing.specials.length > 0 &&
      listing.specials.every(special => special.active === true)
    );
  });


console.log(
  'Special listings:',
  specialListings.map(listing => ({
    id: listing.documentId,
    title: listing.title,
    specials: listing.specials
  }))
);



  // Subsets from specials only
  const premiumSpecials = specialListings.filter(listing => listing?.isPremium === true);
  const featuredSpecials = specialListings.filter(listing => listing?.isFeatured === true);
  
  // For "more specials", we can use all specials or create additional logic
  const moreSpecials = specialListings;

  // Filter options
  const filterOptions = {
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    stoneType: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
    color: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
    culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
    designTheme: ["Cross", "Angel", "Heart", "Book", "Traditional", "Modern", "Custom"],
    custom: ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"],
  }

  // Toggle filter dropdown
  const toggleFilter = (filter) => {
    setShowFilters(showFilters === filter ? null : filter)
  }

  // Set filter value
  const setFilter = (category, value) => {
    setActiveFilters({
      ...activeFilters,
      [category]: value,
    })
    setShowFilters(null)
  }

  // Filter component
  const FilterDropdown = ({ name, label, options }) => {
    return (
      <div className="relative mb-4">
        <button
          onClick={() => toggleFilter(name)}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 p-2 rounded flex justify-between items-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
          aria-expanded={showFilters === name}
          aria-haspopup="true"
        >
          <span className="text-gray-700">{activeFilters[name] || label}</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showFilters === name ? "transform rotate-180" : ""}`}
          />
        </button>

        {showFilters === name && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 animate-slide-in">
            <ul className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
              {options.map((option, index) => (
                <li
                  key={index}
                  onClick={() => setFilter(name, option)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                  role="menuitem"
                >
                  {option}
                  {activeFilters[name] === option && (
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Create a new SpecialOfferCard component that uses our FavoriteButton
  const SpecialOfferCard = ({ product, featured = true }) => {
    const favoriteProduct = {
      id: product.id,
      title: product.title,
      price: product.salePrice,
      image: product.image,
      details: product.details,
      tag: product.tag,
      tagColor: product.tagColor,
      manufacturer: product.manufacturer,
      location: product.location,
      features: product.features,
    }

    return (
      <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image Container */}
        <div className="relative h-56 bg-gray-100">
          <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
          <FavoriteButton product={favoriteProduct} className="absolute top-2 right-2" />
          <div className={`absolute top-2 left-2 ${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
            {product.tag}
          </div>
          {product.discount && (
            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              {product.discount}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Price Row */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-bold text-blue-600 text-lg">{product.salePrice}</p>
              {product.originalPrice !== product.salePrice && (
                <p className="text-sm text-gray-500 line-through">{product.originalPrice}</p>
              )}
            </div>
          </div>
          
          {/* Product Title */}
          <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">
            {product.title}
          </h4>
          
          {/* Product Details */}
          <p className="text-xs text-gray-600 mb-2">
            {product.details}
          </p>
          
          {/* Manufacturer and Location (if not featured) */}
          {!featured && product.manufacturer && product.location && (
            <div className="text-xs text-gray-600 mb-2">
              <p>{product.manufacturer}</p>
              <p>{product.location}</p>
            </div>
          )}
          
          {/* Countdown Timer */}
          <div className="mb-3">
            <CountdownTimer endDate={product.endDate} compact={true} />
          </div>
          
          {/* View Details Link */}
          <div>
            <Link
              href={`/tombstones-on-special/${product.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Create a new PremiumSpecialOffer component that uses our FavoriteButton
  const PremiumSpecialOffer = ({ product }) => {
    const favoriteProduct = {
      id: product.id,
      title: product.title,
      price: product.salePrice,
      image: product.image,
      details: product.details,
      tag: product.tag,
      tagColor: product.tagColor,
      manufacturer: product.manufacturer,
      location: product.location,
      features: product.features,
    }

    return (
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto transition-all duration-300 h-full flex flex-col hover:border-b-2 hover:border-[#0090e0] hover:shadow-2xl hover:shadow-gray-400 mb-6">
        {/* Mobile Layout (up to 768px) */}
        <div className="relative flex flex-col md:hidden">
          {/* Manufacturer Logo in its own box, bottom right corner (Mobile only) */}
          <div className="absolute bottom-3 right-3 z-20 bg-gray-50 p-2 rounded-lg md:hidden">
            <Image
              src={product.logo || "/placeholder-logo.svg"}
              alt={product.manufacturer + " Logo"}
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
          {/* Main Image Container */}
          <div className="bg-white px-3 py-3">
            <div className="relative h-[350px] w-full rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw"
              />
                             {/* Camera icon and counter overlay for main image */}
               <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium z-10">
                 <Camera className="w-4 h-4" />
                 <span>{product.imageCount || 0}</span>
               </div>
            </div>
          </div>
          {/* Content (Mobile) */}
          <div className="w-full px-4 pt-4 pb-2 bg-gray-50 flex flex-col">
            {/* Price, Badge */}
            <div className="flex flex-col items-start mb-3">
              <div className="text-2xl font-bold text-blue-600">{product.salePrice}</div>
              {product.originalPrice !== product.salePrice && (
                <div className="text-sm text-gray-500 line-through">{product.originalPrice}</div>
              )}
              <div className="mt-1 mb-0">
                <span className={`text-white text-xs px-2 py-0.5 rounded ${product.tagColor || "bg-red-600"}`}>{product.tag || "Special Offer"}</span>
              </div>
              {product.discount && (
                <div className="mt-1 mb-0">
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">{product.discount}</span>
                </div>
              )}
            </div>
            {/* Title, Details, Features */}
            <h2 className="text-lg font-bold text-gray-600 mb-2 uppercase">{product.title}</h2>
            <div className="space-y-0.5 mb-2">
              <div className="text-xs text-gray-700">{product.details}</div>
              <div className="text-xs text-gray-700">{product.features}</div>
            </div>
            {/* Manufacturer Information (Mobile) */}
            <div className="flex flex-col mt-0">
              <div className="font-medium text-gray-900 text-base mb-2">{product.manufacturer}</div>
              <div className="text-xs text-gray-600 mb-1 mt-2">{product.location}</div>
            </div>
            <div className="mt-3 mb-3">
              <CountdownTimer endDate={product.endDate} compact={true} />
            </div>
            <div className="mt-2">
              <Link
                href={`/tombstones-on-special/${product.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
        {/* Desktop Layout (unchanged) */}
        <div className="hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative h-48 md:h-auto">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover rounded"
            />
            <FavoriteButton product={favoriteProduct} size="lg" className="absolute top-2 right-2" />
            <div className={`absolute top-2 left-2 ${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
              {product.tag}
            </div>
            {product.discount && (
              <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                {product.discount}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 text-xl uppercase">{product.title}</h3>
              <div>
                <p className="font-bold text-blue-600 text-xl">{product.salePrice}</p>
                {product.originalPrice !== product.salePrice && (
                  <p className="text-sm text-gray-500 line-through text-right">{product.originalPrice}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{product.details}</p>
            <p className="text-sm text-gray-600 mt-1">{product.features}</p>
            <div className="mt-3 mb-3">
              <CountdownTimer endDate={product.endDate} compact={true} />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{product.manufacturer}</p>
                <p className="text-sm text-gray-600">{product.location}</p>
              </div>
              <Link
                href={`/tombstones-on-special/${product.id}`}
                className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                View Details
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading special offers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-600">Error loading special offers. Please try again later.</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty statec

  if (specialListings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600">No special offers available at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Please check back later for new deals.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search Bar */}
      <div className="bg-[#00647A] py-4">
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
            <button className="text-gray-300 hover:text-white text-sm transition-colors">Reset</button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-700">Tombstone Specials</span>
              </li>
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tombstone Specials</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Left Side */}
            <div className="w-full md:w-1/4">
              <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                <h2 className="font-bold text-gray-800 mb-4">Price</h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={activeFilters.minPrice}
                      onChange={(e) => setActiveFilters({ ...activeFilters, minPrice: e.target.value })}
                    >
                      <option>Min Price</option>
                      <option>R 1,000</option>
                      <option>R 5,000</option>
                      <option>R 10,000</option>
                      <option>R 15,000</option>
                    </select>
                  </div>
                  <div>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={activeFilters.maxPrice}
                      onChange={(e) => setActiveFilters({ ...activeFilters, maxPrice: e.target.value })}
                    >
                      <option>Max Price</option>
                      <option>R 10,000</option>
                      <option>R 20,000</option>
                      <option>R 30,000</option>
                      <option>R 50,000</option>
                      <option>R 100,000+</option>
                    </select>
                  </div>
                </div>

                <FilterDropdown name="location" label="LOCATION" options={filterOptions.location} />
                <FilterDropdown name="stoneType" label="STONE TYPE" options={filterOptions.stoneType} />
                <FilterDropdown name="color" label="COLOUR" options={filterOptions.color} />
                <FilterDropdown name="culture" label="CULTURE" options={filterOptions.culture} />
                <FilterDropdown name="designTheme" label="DESIGN THEME" options={filterOptions.designTheme} />
                <FilterDropdown name="custom" label="CUSTOM" options={filterOptions.custom} />
              </div>
            </div>

            {/* Product Listings - Right Side */}
            <div className="w-full md:w-3/4">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">{specialListings.length} Special Offers</p>
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
                        {['Default', 'Biggest Discount', 'Ending Soon', 'Price: Low to High', 'Price: High to Low', 'Newest First'].map(option => (
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
                      <option>Biggest Discount</option>
                      <option>Ending Soon</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Featured Special Offers */}
              <div className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">
                  FEATURED SPECIAL OFFERS
                </h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Limited Time Only</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredSpecials.slice(0, 3).map((listing) => (
                    <SpecialOfferCard key={listing.documentId} product={mapListingToProduct(listing)} />
                  ))}
                </div>
              </div>

              {/* Premium Special Offers */}
              <div className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">PREMIUM SPECIAL OFFERS</h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Limited Time Only</p>

                <div className="space-y-4">
                  {premiumSpecials.map((listing) => (
                    <PremiumSpecialOffer key={listing.documentId} product={mapListingToProduct(listing)} />
                  ))}
                </div>
              </div>

              {/* More Special Offers */}
              <div>
                <h2 className="text-gray-600 border-b border-gray-300 pb-2 mb-4">MORE SPECIAL OFFERS</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moreSpecials.map((listing) => (
                    <SpecialOfferCard
                      key={`more-${listing.documentId}`}
                      product={mapListingToProduct(listing)}
                      featured={false}
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
