"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, MapPin, Search, Star, ChevronRight } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ProvinceManufacturersPage({ params }) {
  const { province } = use(params)
  const decodedProvince = decodeURIComponent(province.replace(/-/g, " "))

  // State for active city filter
  const [activeCity, setActiveCity] = useState(null)

  // State for search filters
  const [searchFilters, setSearchFilters] = useState({
    manufacturerName: "",
    stoneType: "",
    location: "",
  })

  // State for sort order
  const [sortOrder, setSortOrder] = useState("Default")

  // State for UI controls (for Header component)
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

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

  // Manufacturers data
  const allManufacturers = [
    {
      id: "example-tombstone",
      name: "Example Tombstone Co.",
      logo: "/placeholder.svg?height=120&width=120&text=ET",
      rating: 4.7,
      description:
        "Example Tombstone Company is based in Durban North, KZN and prides itself on quality craftsmanship and attention to detail.",
      tombstonesListed: 38,
      location: "Durban North",
      distance: "38km from you",
      province: "KwaZulu Natal",
      city: "Durban North",
    },
    {
      id: "shine-tombstones",
      name: "Shine Tombstones",
      logo: "/placeholder.svg?height=120&width=120&text=ST",
      rating: 4.7,
      description:
        "Shine Tombstones is based in Richards Bay, KZN and prides itself on innovative designs and premium materials.",
      tombstonesListed: 62,
      location: "Richards Bay",
      distance: "150km from you",
      province: "KwaZulu Natal",
      city: "Richards Bay",
    },
    {
      id: "forever-tombstones",
      name: "Forever Tombstones",
      logo: "/placeholder.svg?height=120&width=120&text=FT",
      rating: 4.7,
      description:
        "Forever Tombstones was founded in 1993. Each tombstone is carefully gone through a rigorous quality control process.",
      tombstonesListed: 125,
      location: "Pinetown",
      distance: "45km from you",
      province: "KwaZulu Natal",
      city: "Pinetown",
    },
    {
      id: "durban-memorials",
      name: "Durban Memorials",
      logo: "/placeholder.svg?height=120&width=120&text=DM",
      rating: 4.6,
      description:
        "Durban Memorials offers personalized service and custom designs for all memorial needs in the Durban area.",
      tombstonesListed: 42,
      location: "Durban South",
      distance: "25km from you",
      province: "KwaZulu Natal",
      city: "Durban South",
    },
    {
      id: "coastal-tombstones",
      name: "Coastal Tombstones",
      logo: "/placeholder.svg?height=120&width=120&text=CT",
      rating: 4.8,
      description: "Coastal Tombstones specializes in weather-resistant designs perfect for coastal environments.",
      tombstonesListed: 56,
      location: "Ballito",
      distance: "65km from you",
      province: "KwaZulu Natal",
      city: "Ballito",
    },
    {
      id: "newcastle-monuments",
      name: "Newcastle Monuments",
      logo: "/placeholder.svg?height=120&width=120&text=NM",
      rating: 4.5,
      description:
        "Newcastle Monuments has been serving the Newcastle area for over 25 years with quality memorial products.",
      tombstonesListed: 31,
      location: "Newcastle",
      distance: "240km from you",
      province: "KwaZulu Natal",
      city: "Newcastle",
    },
  ]

  // Filter manufacturers by province
  const manufacturers = allManufacturers.filter(
    (m) => m.province.toLowerCase() === decodedProvince.toLowerCase() && (!activeCity || m.city === activeCity),
  )

  // Get total results count
  const resultsCount = manufacturers.length

  // Provinces data
  const provinces = [
    {
      name: "Gauteng",
      cities: ["Pretoria", "Johannesburg", "Centurion", "Sandton"],
    },
    {
      name: "Western Cape",
      cities: ["Cape Town", "Stellenbosch", "Paarl", "Milnerton"],
    },
    {
      name: "KwaZulu Natal",
      cities: [
        "Durban",
        "Durban North",
        "Durban South",
        "Pinetown",
        "Pietermaritzburg",
        "Ballito",
        "Richards Bay",
        "Newcastle",
        "Empangeni",
        "Port Shepstone",
      ],
    },
    {
      name: "Eastern Cape",
      cities: ["Port Elizabeth", "East London", "Grahamstown", "Mthatha"],
    },
    {
      name: "Free State",
      cities: ["Bloemfontein", "Welkom", "Bethlehem", "Boshof"],
    },
    {
      name: "Mpumalanga",
      cities: ["Nelspruit", "Witbank", "Middelburg", "Secunda"],
    },
    {
      name: "Northern Cape",
      cities: ["Kimberley", "Upington", "Springbok", "De Aar"],
    },
    {
      name: "Limpopo",
      cities: ["Polokwane", "Tzaneen", "Bela-Bela", "Mokopane"],
    },
    {
      name: "North West",
      cities: ["Rustenburg", "Potchefstroom", "Klerksdorp", "Mahikeng"],
    },
  ]

  // Get cities for the current province
  const provinceCities = provinces.find((p) => p.name.toLowerCase() === decodedProvince.toLowerCase())?.cities || []

  // Other manufacturer groups
  const manufacturerGroups = [
    "Royal Tombstones",
    "Aztec Tombstones",
    "SA Tombstones",
    "Premium Memorials",
    "Family Monuments",
  ]

  // Handle city click
  const handleCityClick = (cityName) => {
    setActiveCity(cityName === activeCity ? null : cityName)
  }

  // Manufacturer card component
  const ManufacturerCard = ({ manufacturer }) => (
    <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="flex justify-center items-center">
          <div className="relative h-32 w-32">
            <Image
              src={manufacturerLogos[manufacturer.name] || "/placeholder-logo.svg"}
              alt={manufacturer.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800 text-xl leading-tight">{manufacturer.name}</h3>
            <div className="flex items-center">
              <div className="text-sm text-gray-600 mr-1">Current Google Rating:</div>
              <div className="flex items-center">
                <span className="font-bold text-gray-800 mr-1">{manufacturer.rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">out of 5</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 my-2">{manufacturer.description}</p>

          <div className="flex justify-between items-center mt-4">
            <div className="text-blue-600 font-semibold">{manufacturer.tombstonesListed} Tombstones Listed</div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {manufacturer.location} • {manufacturer.distance}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Handlers for Header component
  const handleMobileMenuToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState(prev => ({ ...prev, mobileDropdown: prev.mobileDropdown === section ? null : section }))
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        mobileMenuOpen={uiState.mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={uiState.mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />

      {/* Category Tabs */}
      <div className="bg-gray-800 text-white">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            {["FULL TOMBSTONE", "PREMIUM", "DOUBLE / FAMILY", "CHILD", "HEAD & BASE", "CREMATION & URNS"].map(
              (tab, index) => (
                <button
                  key={index}
                  className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${index === 0 ? "bg-gray-700" : ""}`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="bg-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-2">
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
                  className="w-full p-2 pl-10 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 text-white p-2 px-4 rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <Search className="h-4 w-4" />
              <span>Search for Manufacturers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 bg-gray-50">
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
                <Link href="/manufacturers" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Manufacturers
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                <span className="text-gray-700 font-medium">{decodedProvince}</span>
              </li>
              {activeCity && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                  <span className="text-gray-700">{activeCity}</span>
                </li>
              )}
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Manufacturers in {activeCity ? `${activeCity}, ${decodedProvince}` : decodedProvince}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Manufacturers Listing - Left Side */}
            <div className="w-full lg:w-2/3">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">{resultsCount} Results</p>
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
                    <span className="text-sm text-gray-600 mr-2">Sort by</span>
                    <select
                      className="p-1 border border-gray-300 rounded text-sm"
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

              {/* Manufacturers List */}
              <div className="space-y-4">
                {manufacturers.length > 0 ? (
                  manufacturers.map((manufacturer) => (
                    <ManufacturerCard key={manufacturer.id} manufacturer={manufacturer} />
                  ))
                ) : (
                  <div className="bg-white p-6 text-center border border-gray-300 rounded">
                    <p className="text-gray-600">No manufacturers found in this location.</p>
                    <p className="text-gray-500 text-sm mt-2">Try selecting a different city or removing filters.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {resultsCount > 5 && (
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
              )}
            </div>

            {/* Sidebar - Right Side */}
            <div className="w-full lg:w-1/3">
              {/* Manufacturers in Province */}
              <div className="bg-white border border-gray-300 rounded p-4 mb-6">
                <h2 className="font-bold text-gray-800 mb-4">Manufacturers in {decodedProvince}</h2>

                <div>
                  <div className="mb-4 text-sm bg-blue-50 p-3 rounded border border-blue-100">
                    <p>By Province then by Town or City filtering</p>
                    <p className="mt-1">
                      When you click on a province, all manufacturers only relevant to that province will show up.
                    </p>
                    <p className="mt-1">
                      Then if a more specific town or city in that province is selected, only manufacturers in that town
                      or city will show up.
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {provinceCities.map((city) => (
                      <li key={city}>
                        <button
                          onClick={() => handleCityClick(city)}
                          className={`text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full ${
                            activeCity === city ? "font-bold" : ""
                          }`}
                        >
                          {city}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/manufacturers"
                    className="mt-4 text-gray-600 hover:text-gray-800 text-sm flex items-center"
                  >
                    ← Back to all provinces
                  </Link>
                </div>
              </div>

              {/* Other Manufacturer Groups */}
              <div className="bg-white border border-gray-300 rounded p-4">
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
          <Link
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
          </Link>
          <Link
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
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
