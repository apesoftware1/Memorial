"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, MapPin, Search, Star, ChevronRight } from "lucide-react"
import Header from "@/components/Header"

export default function ManufacturersPage() {
  // State for UI controls (for Header component)
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

  // State for active province filter
  const [activeProvince, setActiveProvince] = useState(null)
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

  // Category tabs copied from CategoryTabs.tsx
  const CATEGORY_TABS = [
    { id: 'tombstones', name: 'TOMBSTONES' },
    { id: 'premium', name: 'PREMIUM' },
    { id: 'family', name: 'FAMILY' },
    { id: 'child', name: 'CHILD' },
    { id: 'head', name: 'HEAD' },
    { id: 'cremation', name: 'CREMATION' },
  ];

  // Manufacturers data
  const manufacturers = [
    {
      id: "example-tombstone",
      name: "Example Tombstone Co.",
      logo: "",
      rating: 4.7,
      description:
        "Example Tombstone Company is based in Durban North, KZN and prides itself on quality craftsmanship and attention to detail.",
      tombstonesListed: 38,
      location: "Durban North",
      distance: "38km from you",
      province: "KwaZulu Natal",
      category: 'tombstones',
    },
    {
      id: "shine-tombstones",
      name: "Shine Tombstones",
      logo: "",
      rating: 4.7,
      description:
        "Shine Tombstones is based in Richards Bay, KZN and prides itself on innovative designs and premium materials.",
      tombstonesListed: 62,
      location: "Richards Bay",
      distance: "150km from you",
      province: "KwaZulu Natal",
      category: 'tombstones',
    },
    {
      id: "forever-tombstones",
      name: "Forever Tombstones",
      logo: "",
      rating: 4.7,
      description:
        "Forever Tombstones was founded in 1993. Each tombstone is carefully gone through a rigorous quality control process.",
      tombstonesListed: 125,
      location: "Pinetown",
      distance: "45km from you",
      province: "KwaZulu Natal",
      category: 'tombstones',
    },
    {
      id: "marble-masters",
      name: "Marble Masters",
      logo: "",
      rating: 4.5,
      description: "Marble Masters specializes in high-quality marble tombstones with custom engravings and designs.",
      tombstonesListed: 47,
      location: "Pretoria",
      distance: "15km from you",
      province: "Gauteng",
      category: 'tombstones',
    },
    {
      id: "granite-specialists",
      name: "Granite Specialists",
      logo: "",
      rating: 4.8,
      description: "Granite Specialists offers premium granite tombstones with a 25-year warranty on all products.",
      tombstonesListed: 83,
      location: "Johannesburg",
      distance: "25km from you",
      province: "Gauteng",
      category: 'tombstones',
    },
    {
      id: "cape-memorials",
      name: "Cape Memorials",
      logo: "",
      rating: 4.6,
      description:
        "Cape Memorials has been serving the Western Cape region for over 30 years with quality memorial products.",
      tombstonesListed: 56,
      location: "Cape Town",
      distance: "5km from you",
      province: "Western Cape",
      category: 'tombstones',
    },
  ]

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

  // Other manufacturer groups
  const manufacturerGroups = [
    "Royal Tombstones",
    "Aztec Tombstones",
    "SA Tombstones",
    "Premium Memorials",
    "Family Monuments",
  ]

  // Add a category field to each manufacturer (for demo, assign all to 'tombstones')
  const [activeCategory, setActiveCategory] = useState(CATEGORY_TABS[0].id)

  // Filter manufacturers by province, city and category
  const filteredManufacturers = manufacturers.filter((m) => {
    const provinceMatch = activeProvince ? m.province === activeProvince : true;
    const cityMatch = activeCity ? m.location === activeCity : true;
    const categoryMatch = activeCategory ? m.category === activeCategory : true;
    return provinceMatch && cityMatch && categoryMatch;
  });

  // Sort manufacturers based on sortOrder
  const sortedManufacturers = [...filteredManufacturers];
  if (sortOrder === "Rating: High to Low") {
    sortedManufacturers.sort((a, b) => b.rating - a.rating);
  } else if (sortOrder === "Listings: Most to Least") {
    sortedManufacturers.sort((a, b) => b.tombstonesListed - a.tombstonesListed);
  } else if (sortOrder === "Distance: Nearest First") {
    // Extract numeric distance from string (e.g., '38km from you')
    const getDistance = (m) => {
      const match = m.distance.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : Infinity;
    };
    sortedManufacturers.sort((a, b) => getDistance(a) - getDistance(b));
  } else if (sortOrder === "Alphabetical: A-Z") {
    sortedManufacturers.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get total results count
  const resultsCount = sortedManufacturers.length

  // Handle province click
  const handleProvinceClick = (provinceName) => {
    if (provinceName === activeProvince) {
      setActiveProvince(null)
      setActiveCity(null) // Reset city when province is deselected
    } else {
      setActiveProvince(provinceName)
      setActiveCity(null) // Reset city when new province is selected
    }
  }

  // Handle city click
  const handleCityClick = (cityName) => {
    setActiveCity(cityName === activeCity ? null : cityName)
  }

  // Get cities for active province
  const activeCities = activeProvince 
    ? provinces.find(p => p.name === activeProvince)?.cities || []
    : []

  // Manufacturer card component
  const ManufacturerCard = ({ manufacturer }) => (
    <div className="bg-[#fafbfc] border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4 w-full max-w-xl ml-0 mr-auto p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      {/* Logo */}
      <div className="flex-shrink-0 flex items-center justify-center w-full h-40 sm:w-28 sm:h-28 bg-white rounded-md border border-gray-100 mb-2 sm:mb-0">
        {manufacturer.logo ? (
          <Image
            src={manufacturer.logo}
            alt={manufacturer.name}
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{manufacturer.name}</h3>
          <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1 sm:mt-0">
            <Star className="h-4 w-4 text-blue-400 mr-1" />
            <span className="font-semibold text-blue-500 mr-1">{manufacturer.rating}</span>
            <span className="text-gray-500">(15 reviews)</span>
            <span className="ml-1 text-blue-400 cursor-pointer" title="More info">&#9432;</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 mt-1 truncate">{manufacturer.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1">
          <Link href="#" className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline">
            {manufacturer.tombstonesListed} Tombstones Listed
          </Link>
          <div className="flex items-center text-gray-500 text-xs mt-1 sm:mt-0">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{manufacturer.location} • {manufacturer.distance}</span>
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
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto w-full max-w-6xl mx-auto md:ml-52">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${activeCategory === tab.id ? "bg-gray-700" : ""}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="bg-gray-800 py-4">
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
            <button className="bg-amber-500 hover:bg-amber-600 text-white h-10 px-4 py-0 text-sm rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 whitespace-nowrap">
              <Search className="h-4 w-4" />
              <span className="truncate">Search for Manufacturers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 bg-gray-50 md:ml-32">
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
              {activeProvince && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                  <span className="text-gray-700">{activeProvince}</span>
                </li>
              )}
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Manufacturers in {activeProvince || "South Africa"}</h1>

          {/* Results Header and columns in same max-width container */}
          <div className="ml-0 sm:ml-0 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4 w-full bg-gray-100 px-4 py-2 pr-0 rounded">
              <span className="font-bold text-lg text-gray-800">{resultsCount}</span>
              <span className="text-gray-600 ml-2">Results</span>
              <div className="flex items-center w-full max-w-xs justify-end">
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

            {/* Two-column layout under results header */}
            <div className="flex flex-col md:flex-row gap-0 w-auto">
              {/* Left: Manufacturers List and Pagination */}
              <div className="w-auto md:w-4/5 flex flex-col space-y-4 items-start">
                {sortedManufacturers.map((manufacturer) => (
                  <ManufacturerCard key={manufacturer.id} manufacturer={manufacturer} />
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
              <div className="w-auto md:w-1/5 flex flex-col gap-4 items-start">
                <div className="bg-white border border-gray-300 rounded p-2 w-full">
                  <h2 className="font-bold text-gray-800 mb-4">
                    {activeProvince ? `Manufacturers in ${activeProvince}` : "Manufacturers by Province"}
                  </h2>
                  {/* Province filters */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Manufacturers by Province</h3>
                    <div className="space-y-2">
                      {provinces.map((province) => (
                        <div key={province.name}>
                          <button
                            onClick={() => handleProvinceClick(province.name)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              activeProvince === province.name
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span>{province.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              activeProvince === province.name ? "rotate-90" : ""
                            }`} />
                          </button>
                          
                          {/* City list - only show for active province */}
                          {activeProvince === province.name && (
                            <div className="ml-4 mt-2 space-y-1">
                              {province.cities.map((city) => (
                                <button
                                  key={city}
                                  onClick={() => handleCityClick(city)}
                                  className={`block w-full px-3 py-1.5 text-left text-sm rounded-md transition-colors ${
                                    activeCity === city
                                      ? "bg-blue-50 text-blue-700"
                                      : "hover:bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
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
        </div>
      </div>

      {/* Back to Home */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            Back to Home
          </Link>
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
                <p>Email: info@memorialhub.co.za</p>
                <p>Phone: +27 12 345 6789</p>
                <p>Address: 123 Memorial Street, Pretoria, South Africa</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
            <p>&copy; 2024 MemorialHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
