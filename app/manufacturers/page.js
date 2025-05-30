"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, MapPin, Search, Star, ChevronRight } from "lucide-react"

export default function ManufacturersPage() {
  // State for active province filter
  const [activeProvince, setActiveProvince] = useState(null)

  // State for search filters
  const [searchFilters, setSearchFilters] = useState({
    manufacturerName: "",
    stoneType: "",
    location: "",
  })

  // State for sort order
  const [sortOrder, setSortOrder] = useState("Default")

  // Manufacturers data
  const manufacturers = [
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
    },
    {
      id: "marble-masters",
      name: "Marble Masters",
      logo: "/placeholder.svg?height=120&width=120&text=MM",
      rating: 4.5,
      description: "Marble Masters specializes in high-quality marble tombstones with custom engravings and designs.",
      tombstonesListed: 47,
      location: "Pretoria",
      distance: "15km from you",
      province: "Gauteng",
    },
    {
      id: "granite-specialists",
      name: "Granite Specialists",
      logo: "/placeholder.svg?height=120&width=120&text=GS",
      rating: 4.8,
      description: "Granite Specialists offers premium granite tombstones with a 25-year warranty on all products.",
      tombstonesListed: 83,
      location: "Johannesburg",
      distance: "25km from you",
      province: "Gauteng",
    },
    {
      id: "cape-memorials",
      name: "Cape Memorials",
      logo: "/placeholder.svg?height=120&width=120&text=CM",
      rating: 4.6,
      description:
        "Cape Memorials has been serving the Western Cape region for over 30 years with quality memorial products.",
      tombstonesListed: 56,
      location: "Cape Town",
      distance: "5km from you",
      province: "Western Cape",
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

  // Filter manufacturers by province
  const filteredManufacturers = activeProvince
    ? manufacturers.filter((m) => m.province === activeProvince)
    : manufacturers

  // Get total results count
  const resultsCount = filteredManufacturers.length

  // Handle province click
  const handleProvinceClick = (provinceName) => {
    setActiveProvince(provinceName === activeProvince ? null : provinceName)
  }

  // Manufacturer card component
  const ManufacturerCard = ({ manufacturer }) => (
    <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="flex justify-center items-center">
          <div className="relative h-32 w-32">
            <Image
              src={manufacturer.logo || "/placeholder.svg"}
              alt={manufacturer.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800 text-xl">{manufacturer.name}</h3>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              MemorialHub
            </Link>

            {/* Desktop Navigation with Dropdowns */}
            <nav className="ml-8 hidden md:flex">
              {/* Find a Tombstone Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Tombstone
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/tombstones-for-sale"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONES FOR SALE
                    </Link>
                    <Link
                      href="/tombstones-on-special"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONES ON SPECIAL
                    </Link>
                  </div>
                </div>
              </div>

              {/* Find a Manufacturer Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center">
                  Find a Manufacturer
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/manufacturers"
                      className="block px-4 py-2 text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors"
                    >
                      MANUFACTURERS
                    </Link>
                  </div>
                </div>
              </div>

              {/* Services Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Services
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      LET US HANDLE EVERYTHING
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONE FINANCE
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONE INSTALLATION GUIDE
                    </Link>
                  </div>
                </div>
              </div>

              {/* Favourites Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Favourites
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      FAVOURITES
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Login/Register */}
          <div className="hidden md:block">
            <Link href="/login" className="text-teal-500 text-sm hover:text-teal-600 transition-colors">
              Login / Register
            </Link>
          </div>
        </div>
      </header>

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

              {/* Manufacturers List */}
              <div className="space-y-4">
                {filteredManufacturers.map((manufacturer) => (
                  <ManufacturerCard key={manufacturer.id} manufacturer={manufacturer} />
                ))}
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
              {/* Manufacturers by Province */}
              <div className="bg-white border border-gray-300 rounded p-4 mb-6">
                <h2 className="font-bold text-gray-800 mb-4">
                  {activeProvince ? `Manufacturers in ${activeProvince}` : "Manufacturers by Province"}
                </h2>

                {!activeProvince ? (
                  // Show all provinces
                  <ul className="space-y-2">
                    {provinces.map((province) => (
                      <li key={province.name}>
                        <button
                          onClick={() => handleProvinceClick(province.name)}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full"
                        >
                          {province.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Show cities in the active province
                  <div>
                    <div className="mb-4 text-sm bg-blue-50 p-3 rounded border border-blue-100">
                      <p>By Province then by Town or City filtering</p>
                      <p className="mt-1">
                        When you click on a province, all manufacturers only relevant to that province will show up.
                      </p>
                      <p className="mt-1">
                        Then if a more specific town or city in that province is selected, only manufacturers in that
                        town or city will show up.
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {provinces
                        .find((p) => p.name === activeProvince)
                        ?.cities.map((city) => (
                          <li key={city}>
                            <button className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full">
                              {city}
                            </button>
                          </li>
                        ))}
                    </ul>

                    <button
                      onClick={() => setActiveProvince(null)}
                      className="mt-4 text-gray-600 hover:text-gray-800 text-sm flex items-center"
                    >
                      ← Back to all provinces
                    </button>
                  </div>
                )}
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
