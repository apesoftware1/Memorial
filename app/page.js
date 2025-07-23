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
import FilterDropdown from "@/components/FilterDropdown"
import SearchForm from "@/components/SearchForm"
import SearchContainer from "@/components/SearchContainer.jsx";



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

  const premium = strapiListings.filter(l => l.isPremium);
  const featured = strapiListings.filter(l => l.isFeatured);
  const standard = strapiListings.filter(l =>
    typeof l.isStandard === 'boolean'
      ? l.isStandard
      : !l.isPremium && !l.isFeatured
  );

  setPremListings(premium);
  setFeaturedListings(featured);
  setStdListings(standard);
}, [strapiListings, loading, error]);

if (_loading) return <div>Loading...</div>
  return (
    <div>
      {/* 1. Header */}
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />

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
        />
      </section>
      
      {/* 3. FAQ Section */}
      <div className="container mx-auto px-4 mb-4">
        <div className="max-w-4xl mx-auto">
          <FaqSection />
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <BannerAd />
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