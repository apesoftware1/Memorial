"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { ChevronDown, Search, ChevronRight, Menu, X } from "lucide-react"
import Header from "@/components/Header"
import Image from "next/image"
// Import the useFavorites hook and our new components
import { useFavorites } from "@/context/favorites-context.jsx"
import FeaturedListings from "@/components/FeaturedListings"
import { PremiumListingCard } from "@/components/premium-listing-card"
import { PremiumListingCardModal } from "@/components/premium-listing-card-modal"
import TombstonesForSaleFilters from "@/components/TombstonesForSaleFilters"
import FeaturedManufacturer from '@/components/FeaturedManufacturer';
import BannerAd from '@/components/BannerAd';
import Pagination from '@/components/Pagination';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageLoader, CardSkeleton } from "@/components/ui/loader";

// Import GraphQL queries
import { useProgressiveQuery } from '@/hooks/useProgressiveQuery';
import {
  LISTINGS_INITIAL_QUERY,
  LISTINGS_FULL_QUERY,
  LISTINGS_DELTA_QUERY,
} from '@/graphql/queries';
import { useListingCategories } from "@/hooks/use-ListingCategories"
export default function Home() {
  const { categories, loading: categoriesLoading } = useListingCategories();
  // URL query params
  const searchParams = useSearchParams();
  // Derive a stable key from search params to avoid re-running effects due to object identity changes
  const searchParamsKey = searchParams ? searchParams.toString() : '';
  
  // GraphQL data
  // Replace Apollo useQuery(GET_LISTINGS) with progressive hook
  const { data,loading, error } = useProgressiveQuery({
    initialQuery: LISTINGS_INITIAL_QUERY,
    fullQuery: LISTINGS_FULL_QUERY,
    deltaQuery: LISTINGS_DELTA_QUERY,
    variables: { limit: 10 },
    storageKey: 'listings:lastUpdated',
    refreshInterval: 3000,
  });
  const listings = data?.listings || [];
  // State for featured listings pagination
  const [featuredActiveIndex, setFeaturedActiveIndex] = useState(0);
  const featuredScrollRef = useRef(null);
  const router = useRouter();
  
  // Removed DOM-scanning MutationObserver to avoid forced reflows
  
  // Function to handle featured listings scroll
  const handleFeaturedScroll = () => {
    if (featuredScrollRef.current) {
      const scrollLeft = featuredScrollRef.current.scrollLeft;
      const cardWidth = 320; // Card width + gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setFeaturedActiveIndex(Math.min(newIndex, 2)); // Max 3 cards (0, 1, 2)
    }
  };

  // Function to scroll to specific featured card
  const scrollToFeaturedCard = (index) => {
    if (featuredScrollRef.current) {
      const cardWidth = 320;
      featuredScrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = featuredScrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleFeaturedScroll);
      return () => {
        container.removeEventListener('scroll', handleFeaturedScroll);
      };
    }
  }, []);
  
  // Use only backend data
  // const allListings = listings || [];
  const allListings = useMemo(() => {
    // Filter out listings where specials.active is true
    return Array.isArray(listings) 
      ? listings.filter(listing => {
          // Check if listing has specials array and if any special is active
          return !(listing.specials && Array.isArray(listing.specials) && 
                  listing.specials.some(special => special.active === true));
        })
      : [];
  }, [listings]);
  const featuredManufacturers = [];
  const seenManufacturers = new Set();
  if (Array.isArray(listings)) {
    listings.forEach(l => {
      if (l.company?.isFeatured && !seenManufacturers.has(l.company.name)) {
        featuredManufacturers.push(l.company);
        seenManufacturers.add(l.company.name);
      }
    });
  }
  const topFeaturedManufacturers = featuredManufacturers.slice(0, 3);

  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false)

  // State for active filters
  const [activeFilters, setActiveFilters] = useState({
    minPrice: "Min Price",
    maxPrice: "Max Price",
    location: null,
    stoneType: null,
    color: null,
    style: null,
    custom: null,
    colour: null,
    // removed: culture, bodyType, designTheme
    category: null,
  })

  // State for filtered listings
  const [filteredListings, setFilteredListings] = useState([]);

  // Branch selection modal state
  const [showBranchesModal, setShowBranchesModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // When user clicks a listing: if multiple branches -> open modal directly, if one -> go to product showcase
  const handleListingPrimaryClick = (listing) => {
    try {
      const branches = Array.isArray(listing?.branches) ? listing.branches : [];
      if (branches.length > 1) {
        setSelectedListing(listing);
        setShowBranchesModal(true);
        return true; // handled here; prevent internal navigation
      }
      if (branches.length === 1) {
        const branchId = branches[0]?.id || branches[0]?.documentId;
        const listingId = listing?.documentId || listing?.id;
        if (listingId && branchId) {
          router.push(`/product/${listingId}?branch=${branchId}`);
          return true; // handled
        }
      }
    } catch (e) {
      console.error('Failed handling primary click for listing', e);
    }
    return false; // not handled; allow default navigation
  };

  // When a branch is selected in the modal
  const handleBranchSelect = (branch) => {
    try {
      const listingId = selectedListing?.documentId || selectedListing?.id;
      const branchId = branch?.id || branch?.documentId;
      if (listingId && branchId) {
        setShowBranchesModal(false);
        // Pass the full branch object as a serialized JSON string in the query
        const branchData = encodeURIComponent(JSON.stringify(branch));
        router.push(`/product/${listingId}?branch=${branchId}&branchData=${branchData}`);
      }
    } catch (e) {
      console.error('Failed to navigate to product showcase from branch selection', e);
    }
  };
  
  // Helper to get active category name
  const getActiveCategory = () => {
    if (!categories || !categories.length) return '';
    if (activeFilters.category && activeFilters.category !== 'All Categories') return activeFilters.category;
    return '';
  };

  // Generic filter function that accepts a filters object
  const filterListingsFrom = (filtersObj) => {
    let filtered = [...allListings];
    const f = filtersObj || activeFilters;
    
    // Search parameter (against comprehensive product details)
    if (f.search && f.search !== '') {
      const searchQuery = f.search.toLowerCase();
      filtered = filtered.filter(listing => {
        // Basic listing information
        const title = (listing?.title || '').toLowerCase();
        const description = (listing?.description || '').toLowerCase();
        const companyName = (listing?.company?.name || '').toLowerCase();
        const companyLocation = (listing?.company?.location || '').toLowerCase();
        
        // Product details from productDetails object
        const stoneType = ((listing?.productDetails?.stoneType || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
        
        const color = ((listing?.productDetails?.color || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
          
        const style = ((listing?.productDetails?.style || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
          
        const slabStyle = ((listing?.productDetails?.slabStyle || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
          
        const customization = ((listing?.productDetails?.customization || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
          
        // Additional details that might be present
        const dimensions = ((listing?.productDetails?.dimensions || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
          
        const material = ((listing?.productDetails?.material || [])
          .map(item => item?.value || '')
          .join(' ')).toLowerCase();
          
        const category = (listing?.listing_category?.name || '').toLowerCase();
        
        // Check if search query matches any of the fields
        return title.includes(searchQuery) || 
               description.includes(searchQuery) || 
               companyName.includes(searchQuery) || 
               companyLocation.includes(searchQuery) || 
               stoneType.includes(searchQuery) || 
               color.includes(searchQuery) || 
               style.includes(searchQuery) || 
               slabStyle.includes(searchQuery) || 
               customization.includes(searchQuery) || 
               dimensions.includes(searchQuery) || 
               material.includes(searchQuery) || 
               category.includes(searchQuery);
      });
    }
    
    // Category (exact)
    if (f.category && f.category !== 'All Categories' && f.category !== '') {
      filtered = filtered.filter(listing => (listing.listing_category?.name || '').toLowerCase() === f.category.toLowerCase());
    }
    // Location (partial)
    if (f.location && f.location !== 'All' && f.location !== '') {
      filtered = filtered.filter(listing => (listing.company?.location || '').toLowerCase().includes(f.location.toLowerCase()));
    }
    // Stone Type (partial from productDetails)
    if (f.stoneType && f.stoneType !== 'All' && f.stoneType !== '') {
      filtered = filtered.filter(listing => ((listing.productDetails?.stoneType?.[0]?.value || '').toLowerCase().includes(f.stoneType.toLowerCase())));
    }
    // Color (partial from productDetails) - support both color and colour externally
    const colorQuery = f.color || f.colour;
    if (colorQuery && colorQuery !== 'All' && colorQuery !== '') {
      filtered = filtered.filter(listing => ((listing.productDetails?.color?.[0]?.value || '').toLowerCase().includes(colorQuery.toLowerCase())));
    }
    // Style (partial)
    if (f.style && f.style !== 'All' && f.style !== '') {
      filtered = filtered.filter(listing => ((listing.productDetails?.style?.[0]?.value || '').toLowerCase().includes(f.style.toLowerCase())));
    }
    // Slab Style (partial)
    if (f.slabStyle && f.slabStyle !== 'All' && f.slabStyle !== '') {
      filtered = filtered.filter(listing => ((listing.productDetails?.slabStyle?.[0]?.value || '').toLowerCase().includes(f.slabStyle.toLowerCase())));
    }
    // Custom (partial)
    if (f.custom && f.custom !== 'All' && f.custom !== '') {
      filtered = filtered.filter(listing => ((listing.productDetails?.customization?.[0]?.value || '').toLowerCase().includes(f.custom.toLowerCase())));
    }
    // Min Price
    if (f.minPrice && f.minPrice !== 'Min Price' && f.minPrice !== '') {
      const min = parsePrice(f.minPrice);
      filtered = filtered.filter(listing => {
        if (!listing.price) return false;
        return parsePrice(listing.price) >= min;
      });
    }
    // Max Price
    if (f.maxPrice && f.maxPrice !== 'Max Price' && f.maxPrice !== '') {
      const max = parsePrice(f.maxPrice);
      filtered = filtered.filter(listing => {
        if (!listing.price) return false;
        return parsePrice(listing.price) <= max;
      });
    }
    return filtered;
  };

  // Convenience wrapper using current state
  const filterListings = () => filterListingsFrom(activeFilters);

  // Search button handler
  const handleSearch = () => {
    setFilteredListings(filterListings());
    setCurrentPage(1);
  };

  // Update filtered listings on mount and when allListings changes
  useEffect(() => {
    setFilteredListings(allListings);
  }, [allListings]);

  // Read URL params and apply filters on page load and when params change
  useEffect(() => {
    if (!searchParams) return;
    const nextFilters = { ...activeFilters };
    // Map URL params to our filter keys (support multiple synonyms)
    const query = searchParams.get('query');
    const search = searchParams.get('search');
    const cat = searchParams.get('category');
    const colour = searchParams.get('colour') || searchParams.get('color');
    const mat = searchParams.get('material') || searchParams.get('stoneType');
    const sty = searchParams.get('style');
    const cus = searchParams.get('customization') || searchParams.get('custom');
    const loc = searchParams.get('location');
    const minP = searchParams.get('minPrice');
    const maxP = searchParams.get('maxPrice');

    // Use search parameter if present, otherwise fall back to query parameter
    if (search) nextFilters.search = search;
    else if (query) nextFilters.search = query;
    
    if (cat) nextFilters.category = cat;
    if (colour) { nextFilters.colour = colour; nextFilters.color = colour; }
    if (mat) nextFilters.stoneType = mat;
    if (sty) nextFilters.style = sty;
    if (cus) nextFilters.custom = cus;
    if (loc) nextFilters.location = loc;
    if (minP) nextFilters.minPrice = minP;
    if (maxP) nextFilters.maxPrice = maxP;

    // Apply filters
    const filtered = filterListingsFrom(nextFilters);
    if (!filtersShallowEqual(activeFilters, nextFilters)) {
      setActiveFilters(nextFilters);
    }
    setFilteredListings(filtered);
    if (currentPage !== 1) setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey, allListings]);

  // Update filtered listings live when activeFilters change (for live search count)
  useEffect(() => {
    if (allListings && allListings.length > 0) {
      const filtered = filterListingsFrom(activeFilters);
      setFilteredListings(filtered);
    }
  }, [activeFilters, allListings]);

  // State for sort order
  const [sortOrder, setSortOrder] = useState("Default");

  // --- SORTING LOGIC ---
  let sortedListings = [...filteredListings];
  if (sortOrder === "Price: Low to High") {
    sortedListings.sort((a, b) => {
      const priceA = a.price ? parsePrice(a.price) : 0;
      const priceB = b.price ? parsePrice(b.price) : 0;
      return priceA - priceB;
    });
  } else if (sortOrder === "Price: High to Low") {
    sortedListings.sort((a, b) => {
      const priceA = a.price ? parsePrice(a.price) : 0;
      const priceB = b.price ? parsePrice(b.price) : 0;
      return priceB - priceA;
    });
  } else if (sortOrder === "Newest First") {
    // If you have a date field, use it. Otherwise, sort by id descending as a fallback.
    sortedListings.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 20;

  // Helper to get the correct slice for the current page
  function getPageListings(listings, page) {
    const start = (page - 1) * listingsPerPage;
    const end = start + listingsPerPage;
    return listings.slice(start, end);
  }

  const paginatedListings = getPageListings(sortedListings, currentPage);

  // Fallback card generator
  const fallbackCard = (type = "listing") => (
    <CardSkeleton className="h-full" />
  );

  // Helper to chunk listings for the custom flow
  function getCustomFlow(listings) {
    let idx = 0;
    const flow = [];
    // 3 featured listings
    flow.push(
      <div key="featured-listings" className="mb-8">
        <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">FEATURED LISTINGS</h2>
        <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>
        
        {/* Mobile: Horizontal scrolling cards */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide" ref={featuredScrollRef}>
            {listings?.filter(l => l.isFeatured).length > 0
              ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, i) => (
                  <div key={product.id || i} className="flex-shrink-0 w-80 snap-start">
                    <FeaturedListings listing={product} />
                  </div>
                ))
              : (
                <div className="flex-shrink-0 w-80 snap-start flex justify-center">
                  {fallbackCard("featured listings")}
                </div>
              )}
          </div>
          {/* Pagination Dots - Mobile only */}
          <div className="flex justify-center mt-4 space-x-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => scrollToFeaturedCard(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === featuredActiveIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to card ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings?.filter(l => l.isFeatured).length > 0
            ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, i) => (
                <FeaturedListings key={product.id || i} listing={product} />
              ))
            : fallbackCard("featured listings")}
        </div>
      </div>
    );
    // 1 banner
    flow.push(<div key="banner-1" className="my-6"><BannerAd /></div>);
    // 5 listings
    flow.push(
      <div key="listings-1" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => <PremiumListingCard compact={true} key={listing.id || i} listing={listing} href={`/tombstones-for-sale/${listing.documentId || listing.id}`} onPrimaryClick={(e) => handleListingPrimaryClick(listing, e)} />)
          : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    // 1 banner
    flow.push(<div key="banner-2" className="my-6"><BannerAd /></div>);
    // 5 listings
    flow.push(
      <div key="listings-2" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => (
              <PremiumListingCard
                compact={true}
                key={listing.id || i}
                listing={listing}
                href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                onPrimaryClick={() => handleListingPrimaryClick(listing)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    // featured manufacturercon  
    let randomFeaturedManufacturer = null;
    if (topFeaturedManufacturers.length > 0) {
      const randomIndex = Math.floor(Math.random() * topFeaturedManufacturers.length);
      randomFeaturedManufacturer = topFeaturedManufacturers[randomIndex];
    }
    if (randomFeaturedManufacturer) {
      flow.push(
        <FeaturedManufacturer key={`featured-manufacturer`} manufacturer={randomFeaturedManufacturer} />
      );
    } else {
      flow.push(
        <div key="fallback-featured-manufacturer" className="flex-1 flex justify-center">
          {fallbackCard("featured manufacturer")}
        </div>
      );
    }
    // 5 listings
    flow.push(
      <div key="listings-3" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => (
              <PremiumListingCard
                compact={true}
                key={listing.id || i}
                listing={listing}
                href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                onPrimaryClick={() => handleListingPrimaryClick(listing)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    // 1 banner
    flow.push(<div key="banner-3" className="my-6"><BannerAd /></div>);
    // 5 listings
    flow.push(
      <div key="listings-4" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => (
              <PremiumListingCard
                compact={true}
                key={listing.id || i}
                listing={listing}
                href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                onPrimaryClick={() => handleListingPrimaryClick(listing)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    return flow;
  }

  const customFlow = getCustomFlow(paginatedListings);

  // Pagination controls
  const totalPages = Math.ceil(sortedListings.length / listingsPerPage);
  
  // Remove useEffect that sets activeFilters on mount (was causing update depth error)

  // Add the useFavorites hook to the component
  // Add this near the top of the component, with the other useState declarations:
  const { totalFavorites } = useFavorites()

  // Filter options
  const filterOptions = {
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    stoneType: [
      "Biodegradable", "Brass", "Ceramic/Porcelain", "Composite", "Concrete", "Copper", "Glass", "Granite", "Limestone", "Marble", "Perspex", "Quartzite", "Sandstone", "Slate", "Steel", "Stone", "Tile", "Wood"
    ],
    slabStyle: [
      "Curved Slab", "Frame with Infill", "Full Slab", "Glass Slab", "Half Slab", "Stepped Slab", "Tiled Slab"
    ],
    style: [
      "Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports"
    ],
    custom: [
      "Bronze/Stainless Plaques", "Ceramic Photo Plaques", "Flower Vases", "Gold Lettering", "Inlaid Glass", "Photo Laser-Edging", "QR Code"
    ],
    colour: [
      "Black", "Blue", "Green", "Grey-Dark", "Grey-Light", "Maroon", "Pearl", "Red", "White"
    ],
    color: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
    culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
    designTheme: ["Cross", "Angel", "Heart", "Book", "Traditional", "Modern", "Custom"],
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

  // Hamburger menu state and handlers for mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const handleMobileMenuToggle = () => setMobileMenuOpen((open) => !open);
  const handleMobileDropdownToggle = (section) => setMobileDropdown((prev) => prev === section ? null : section);

  // --- FILTERING LOGIC ---
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    
    // Handle different data types
    if (typeof priceStr === 'number') return priceStr;
    if (typeof priceStr === 'string') {
      return Number(priceStr.replace(/[^\d]/g, ""));
    }
    
    // If it's an object or other type, try to convert to string first
    try {
      const str = String(priceStr);
      return Number(str.replace(/[^\d]/g, ""));
    } catch (error) {
      console.warn('Failed to parse price:', priceStr, error);
      return 0;
    }
  }

  // Store the initial total count for display
  const totalListingsCount = filteredListings.length;
  
  // Loading and error states
  if (loading) return <PageLoader text="Loading listings..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-red-600 font-medium mb-4">Error loading listings</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
      {showBranchesModal && (
        <PremiumListingCardModal
          listing={selectedListing}
          onClose={() => { setShowBranchesModal(false); setSelectedListing(null); }}
          onBranchSelect={handleBranchSelect}
        />
      )}
    </div>
  );

  // Filtering
  const filteredPremiumListings = filteredListings.filter(listing => {
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
      if (!listing.price || parsePrice(listing.price) < min) return false;
    }
    // Max Price
    if (activeFilters.maxPrice && activeFilters.maxPrice !== "Max Price" && activeFilters.maxPrice !== "") {
      const max = parsePrice(activeFilters.maxPrice);
      if (!listing.price || parsePrice(listing.price) > max) return false;
    }
    return true;
  });

  // --- RESET FILTERS ---
  function handleResetFilters() {
    setActiveFilters({
      minPrice: "Min Price",
      maxPrice: "Max Price",
      location: null,
      stoneType: null,
      color: null,
      style: null,
      custom: null,
      colour: null,
      category: null,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
        onMobileFilterClick={() => setMobileFilterOpen(true)}
      />
      
      {/* Branch selection modal - only show when a listing with multiple branches is clicked */}
      {showBranchesModal && selectedListing && (
        <PremiumListingCardModal
          listing={selectedListing}
          onClose={() => {
            setShowBranchesModal(false);
            setSelectedListing(null);
          }}
          onBranchSelect={handleBranchSelect}
        />
      )}
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleMobileMenuToggle}
        ></div>
      )}
      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <span className="font-bold text-lg">Filters</span>
            <button
              className="p-2 rounded-full hover:bg-gray-100 touch-manipulation"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close Filters"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-6">
            <TombstonesForSaleFilters
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filterOptions={filterOptions}
              filteredListings={filteredListings}
              handleSearch={handleSearch}
              getActiveCategory={getActiveCategory}
            />
          </div>
        </div>
      )}
      {/* Search Bar */}
      <div className="bg-[#00647A] py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search Location, Colour, Manufacturer..."
                className="w-full p-2 pr-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={activeFilters.search || ''}
                onChange={e => setActiveFilters({ ...activeFilters, search: e.target.value })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button 
              className="bg-amber-500 hover:bg-amber-600 text-white p-2 px-4 rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              <span>{`Search (${filteredListings.length}) ${getActiveCategory()} Tombstones`}</span>
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2">
            <button className="text-gray-300 hover:text-white text-sm transition-colors" onClick={() => { handleResetFilters(); if (typeof window !== 'undefined') { window.dispatchEvent(new Event('searchform:reset')); } }}>Reset</button>
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
                <span className="text-gray-700">Tombstones For Sale</span>
              </li>
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tombstones For Sale</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Left Side */}
            <div className="w-full md:w-1/4 hidden sm:block md:sticky md:top-20 md:self-start">
              <TombstonesForSaleFilters
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterOptions={filterOptions}
                filteredListings={filteredListings}
                handleSearch={handleSearch}
                getActiveCategory={getActiveCategory}
              />
            </div>

            {/* Product Listings - Right Side */}
            <div className="w-full md:w-3/4">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4 bg-gray-100 rounded px-4 py-2 shadow-sm">
                <p className="text-gray-600">
                  {filteredListings.length === 0
                    ? `No results found for your filters.`
                    : filteredListings.length === allListings.length
                    ? `${allListings.length} Listings For Sale`
                    : `${filteredListings.length} Results (of ${allListings.length})`}
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
              <div id="featured-listings" className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">FEATURED LISTINGS</h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

                {/* Mobile: Horizontal scrolling cards */}
                <div className="md:hidden">
                  <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide" ref={featuredScrollRef}>
                    {console.log(listings.listings)}
                    {listings?.filter(l => l.isFeatured).length > 0
                      ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, index) => (
                          Array.isArray(product.branches) && product.branches.length > 0 ? (
                            // Map through branches if they exist
                            product.branches.map((branch) => (
                              <div key={`${product.documentId || product.id}-${branch.documentId || branch.id}`} className="flex-shrink-0 w-80 snap-start">
                                <FeaturedListings listing={{...product, currentBranch: branch}} />
                              </div>
                            ))
                          ) : (
                            <div key={product.id || index} className="flex-shrink-0 w-80 snap-start">
                              <FeaturedListings listing={product} />
                            </div>
                          )
                        ))
                      : (
                        <div className="flex-shrink-0 w-80 snap-start flex justify-center">
                          {fallbackCard("featured listings")}
                        </div>
                      )}
                  </div>
                  {/* Pagination Dots - Mobile only */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => scrollToFeaturedCard(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                          index === featuredActiveIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to card ${index + 1}`}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings?.filter(l => l.isFeatured).length > 0
                    ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, index) => (
                        <FeaturedListings key={index} listing={product} />
                      ))
                    : fallbackCard("featured listings")}
                </div>
              </div>

              {/* Premium Listings */}
              <section className="py-4">
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4 text-base font-bold">PREMIUM LISTINGS SPONSORED</h3>
                    <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

                    <div className="space-y-6">
                      {paginatedListings.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No tombstones found for your selected filters.</div>
                      ) : (
                        paginatedListings.map((listing) => (
                          <PremiumListingCard compact={true} key={listing.documentId} listing={listing} href={`/tombstones-for-sale/${listing.documentId || listing.id}`} onPrimaryClick={(e) => handleListingPrimaryClick(listing, e)} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Shallow compare helper to avoid unnecessary filter state updates
function filtersShallowEqual(a, b) {
  const keys = ['category','colour','color','stoneType','style','slabStyle','custom','location','minPrice','maxPrice'];
  for (const k of keys) {
    if ((a?.[k] ?? null) !== (b?.[k] ?? null)) return false;
  }
  return true;
}
