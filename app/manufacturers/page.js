"use client"

import { useQuery } from '@apollo/client';
import { GET_MANUFACTURERS } from '@/graphql/queries/getManufacturers';
import ManufacturerCard from '../components/ManufacturerCard';
import Header from "@/components/Header";
import { useState, useCallback } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function ManufacturersPage() {
  const { loading, error, data } = useQuery(GET_MANUFACTURERS);

  // State for UI controls (for Header component)
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

  // State for search filters
  const [searchFilters, setSearchFilters] = useState({
    manufacturerName: "",
    stoneType: "",
    location: "",
  });

  // State for sort dropdown visibility
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // State for sort order
  const [sortOrder, setSortOrder] = useState("Default");
  // State for active province
  const [activeProvince, setActiveProvince] = useState(null);
  // State for active city
  const [activeCity, setActiveCity] = useState(null);

  // Provinces data
  const provinces = [];

  // Manufacturer groups for sidebar
  const manufacturerGroups = [
    "Royal Tombstones",
    "Aztec Tombstones",
    "SA Tombstones",
    "Premium Memorials",
    "Family Monuments",
  ];

  // Handlers for province and city selection
  const handleProvinceClick = (provinceName) => {
    if (provinceName === activeProvince) {
      setActiveProvince(null);
      setActiveCity(null); // Reset city when province is deselected
    } else {
      setActiveProvince(provinceName);
      setActiveCity(null); // Reset city when new province is selected
    }
  };

  const handleCityClick = (cityName) => {
    setActiveCity(cityName === activeCity ? null : cityName);
  };

  const handleMobileMenuToggle = useCallback(() => {
    setUiState((prev) => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState((prev) => ({
      ...prev,
      mobileDropdown: prev.mobileDropdown === section ? null : section,
    }));
  }, []);

  if (loading) return <div>Loading manufacturers...</div>;
  if (error) return <div>Error loading manufacturers{console.error("GraphQL Error:", error)}</div>;

  // Prepare sorted manufacturers and results count
  const sortedManufacturers = Array.isArray(data?.companies) ? [...data.companies] : [];
  const resultsCount = sortedManufacturers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative z-50 w-full">
        <Header
          mobileMenuOpen={uiState.mobileMenuOpen}
          handleMobileMenuToggle={handleMobileMenuToggle}
          mobileDropdown={uiState.mobileDropdown}
          handleMobileDropdownToggle={handleMobileDropdownToggle}
        />
      </div>
    {/* Search Filters */}
    <div className="bg-[#00647A] py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex flex-col md:flex-row gap-2 w-full max-w-4xl justify-center items-center">
            <div className="relative flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Manufacturer Name"
                  className="w-full p-2 pl-10 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchFilters.manufacturerName}
                  onChange={(e) => setSearchFilters({ ...searchFilters, manufacturerName: e.target.value })}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="relative flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Stone Type"
                  className="w-full p-2 pl-10 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchFilters.stoneType}
                  onChange={(e) => setSearchFilters({ ...searchFilters, stoneType: e.target.value })}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 11H4C3.44772 11 3 11.4477 3 12V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="relative flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full p-2 pl-10 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer bg-white"
                  value={searchFilters.location}
                  readOnly
                  // onClick={() => setLocationModalOpen(true)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                {/*
                {locationModalOpen && isClient &&
                  createPortal(
                    <LocationModal
                      isOpen={locationModalOpen}
                      onClose={() => setLocationModalOpen(false)}
                      locationsData={locationsData}
                      onSelectLocation={(loc) => {
                        setSearchFilters({ ...searchFilters, location: typeof loc === 'string' ? loc : 'Near me' });
                        setLocationModalOpen(false);
                      }}
                    />, document.body
                  )
                }
                */}
              </div>
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 text-white h-10 px-4 py-0 text-sm rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 whitespace-nowrap">
              <Search className="h-4 w-4" />
              <span className="truncate">Search for Manufacturers</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-0 py-4 bg-gray-50 md:ml-32">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                <span className="text-gray-700 font-medium">Manufacturers</span>
              </li>
              {/* activeProvince is not defined in this component, so this block is commented out */}
              {/* {activeProvince && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                  <span className="text-gray-700">{activeProvince}</span>
                </li>
              )} */}
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Manufacturers in South Africa</h1>
        </div>
      </div>
      {/* Results Header and columns in same max-width container */}
      <div className="ml-0 sm:ml-0 w-full max-w-4xl md:ml-56">
        <div className="flex justify-between items-center mb-4 w-full bg-gray-100 px-4 py-2 pr-0 rounded">
          <span className="font-bold text-lg text-gray-800">{resultsCount}</span>
          <span className="text-gray-600 ml-2">Results</span>
          <div className="flex items-center w-full max-w-xs justify-end">
            {/* Mobile Sort Button */}
            <div className="sm:hidden flex items-center text-blue-600 font-semibold cursor-pointer select-none" onClick={() => setShowSortDropdown(!showSortDropdown)}>
              <span className="mr-1">Sort</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {/* Mobile Sort Modal */}
            {showSortDropdown && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 sm:hidden">
                <div ref={sortModalRef} className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up">
                  {['Default', 'Rating: High to Low', 'Listings: Most to Least', 'Distance: Nearest First', 'Alphabetical: A-Z'].map(option => (
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
              <span className="text-sm font-semibold text-gray-700 mr-2">Sort by</span>
              <select
                className="p-1 border border-gray-300 rounded text-sm font-semibold text-blue-600 bg-white"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option>Default</option>
                <option>Rating: High to Low</option>
                <option>Listings: Most to Least</option>
                <option>Distance: Nearest First</option>
                <option>Alphabetical: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Two-column layout under results header */}
        <div className="flex flex-col md:flex-row gap-0 w-auto">
          {/* Left: Manufacturers List and Pagination */}
          <div className="w-auto md:w-4/5 flex flex-col space-y-4 items-start">
            {Array.isArray(data?.companies) && data.companies.map((company) => (
          <ManufacturerCard
            key={company.documentId}
            manufacturer={{
              ...company,
              logo: company.logoUrl || '',
              rating: company.googleRating,
            }}
          />
        ))}
            {resultsCount > 5 && (
              <div className="mt-8 flex justify-start w-auto">
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
            )}
          </div>
          {/* Right: Sidebar */}
          <div className="w-auto md:w-1/5 flex flex-col gap-4 items-start mt-6 md:mt-0">
            <div className="bg-white border border-gray-300 rounded p-2 w-full">
              <h2 className="font-bold text-gray-800 mb-4">
                {activeProvince ? `Manufacturers in ${activeProvince}` : "Manufacturers by Province"}
              </h2>
              {/* Province filters */}
              <div className="mb-6">
                <div className="space-y-2">
                  {/* Province and city buttons will be rendered here when real data is available */}
                </div>
              </div>
              {/* Other manufacturer groups */}
              <div className="bg-white border border-gray-300 rounded p-2 w-full">
                <h2 className="font-bold text-gray-800 mb-4">Other Manufacturer Groups</h2>
                <ul className="space-y-2">
                  {manufacturerGroups.map((group) => (
                    <li key={group}>
                      <Link href="#" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                        {group}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Back to Manufacturers */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <a
            href="/manufacturers"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Manufacturers
          </a>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">About MemorialHub</h4>
              <p className="text-gray-300 text-sm">
                MemorialHub connects you with trusted tombstone manufacturers and suppliers across South Africa.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "Find a Tombstone", "Find a Manufacturer", "Services", "Contact Us"].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <address className="text-gray-300 text-sm not-italic">
                <p>Email: info@memorialhub.co.za</p>
                <p>Phone: +27 12 345 6789</p>
                <p>Address: 123 Memorial Street, Pretoria, South Africa</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} MemorialHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

