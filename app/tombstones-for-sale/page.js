"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Search, ChevronRight } from "lucide-react"

// Import the useFavorites hook and our new components
import { useFavorites } from "@/context/favorites-context"
import { ProductCard } from "@/components/product-card"
import { PremiumListingCard } from "@/components/premium-listing-card"

// Import premium listings from lib/data.js
import { premiumListings } from '@/lib/data';

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

  // Featured listings data
  const featuredListings = [
    {
      id: "white-angel",
      image: "/placeholder.svg?height=200&width=300",
      price: "R 10 200",
      title: "WHITE ANGEL",
      details: "Full Tombstone | Granite | Bible Theme",
      tag: "Great Price",
      tagColor: "bg-green-500",
    },
    {
      id: "palace",
      image: "/placeholder.svg?height=200&width=300",
      price: "R 28 500",
      title: "PALACE",
      details: "Full Tombstone | Granite | Mausoleum Theme",
      tag: "Great Price",
      tagColor: "bg-green-500",
    },
    {
      id: "gold-cross",
      image: "/placeholder.svg?height=200&width=300",
      price: "R 19 900",
      title: "GOLD CROSS",
      details: "Full Tombstone | Marble | Cross Theme",
      tag: "Great Price",
      tagColor: "bg-green-500",
    },
  ]

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

  // Product card component
  // Replace the ProductCard component with our new one
  // Find this code:
  // const ProductCard = ({ product, featured = true }) => (
  //   <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow">
  //     <div className="relative h-48">
  //       <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
  //       <button className="absolute top-2 right-2 bg-white hover:bg-gray-100 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
  //         <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
  //       </button>
  //       <div className={`absolute bottom-2 left-2 ${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
  //         {product.tag}
  //       </div>
  //     </div>
  //     <div className="p-3">
  //       <div className="flex justify-between items-center mb-2">
  //         <p className="font-bold text-blue-800">{product.price}</p>
  //       </div>
  //       <h4 className="font-bold text-gray-800 mb-1">{product.title}</h4>
  //       <p className="text-xs text-gray-600">{product.details}</p>
  //       {!featured && (
  //         <div className="mt-2 text-xs text-gray-600">
  //           <p>{product.manufacturer}</p>
  //           <p>{product.location}</p>
  //         </div>
  //       )}
  //       <div className="mt-3">
  //         <Link
  //           href={`/tombstones-for-sale/${product.id}`}
  //           className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
  //         >
  //           View Details
  //         </Link>
  //       </div>
  //     </div>
  //   </div>
  // )

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-gray-600">2769 Results</p>
                <div className="flex items-center">
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

              {/* Featured Listings */}
              <div className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">FEATURED LISTINGS</h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

                {/* Update the featured listings section to use our new ProductCard component */}
                {/* Find this code: */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredListings.map((product, index) => (
                    <ProductCard key={index} product={product} />
                  ))}
                </div> */}

                {/* And replace it with: */}
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
                      {premiumListings.map((listing) => (
                        <PremiumListingCard key={listing.id} listing={listing} href={`/memorial/${listing.id}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Regular Listings */}
              <div>
                <h2 className="text-gray-600 border-b border-gray-300 pb-2 mb-4">ALL TOMBSTONES</h2>

                {/* Update the regular listings section */}
                {/* Find this code: */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...featuredListings, ...featuredListings].map((product, index) => (
                    <ProductCard
                      key={`regular-${index}`}
                      product={{ ...product, id: `regular-${product.id}-${index}` }}
                    />
                  ))}
                </div> */}

                {/* And replace it with: */}
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
