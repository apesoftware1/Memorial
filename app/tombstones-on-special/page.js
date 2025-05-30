"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Search, ChevronRight } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"

// Import the useFavorites hook and our new components
import { useFavorites } from "@/context/favorites-context"
import { FavoriteButton } from "@/components/favorite-button"

export default function TombstonesOnSpecial() {
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

  // Special offer listings data
  const specialOffers = [
    {
      id: "white-angel-special",
      image: "/placeholder.svg?height=200&width=300",
      originalPrice: "R 12 500",
      salePrice: "R 10 200",
      discount: "18% OFF",
      title: "WHITE ANGEL",
      details: "Full Tombstone | Granite | Bible Theme",
      tag: "SPECIAL OFFER",
      tagColor: "bg-red-600",
      endDate: "2025-06-15T23:59:59",
    },
    {
      id: "palace-special",
      image: "/placeholder.svg?height=200&width=300",
      originalPrice: "R 32 000",
      salePrice: "R 28 500",
      discount: "11% OFF",
      title: "PALACE",
      details: "Full Tombstone | Granite | Mausoleum Theme",
      tag: "SPECIAL OFFER",
      tagColor: "bg-red-600",
      endDate: "2025-05-20T23:59:59",
    },
    {
      id: "gold-cross-special",
      image: "/placeholder.svg?height=200&width=300",
      originalPrice: "R 23 500",
      salePrice: "R 19 900",
      discount: "15% OFF",
      title: "GOLD CROSS",
      details: "Full Tombstone | Marble | Cross Theme",
      tag: "SPECIAL OFFER",
      tagColor: "bg-red-600",
      endDate: "2025-05-05T23:59:59",
    },
  ]

  // Premium special offers data
  const premiumSpecials = [
    {
      id: "cathedral-c14-special",
      image: "/placeholder.svg?height=300&width=400",
      originalPrice: "R 10 500",
      salePrice: "R 8 820",
      discount: "16% OFF",
      title: "CATHEDRAL C14",
      details: "Full Tombstone | Granite | Cross Theme",
      features: "Photo Engraving Available | Self Install & Pick-Up Available",
      manufacturer: "Example Tombstone Co.",
      location: "Durban North, KZN",
      tag: "SPECIAL OFFER",
      tagColor: "bg-red-600",
      endDate: "2025-06-30T23:59:59",
    },
    {
      id: "grey-memorial-special",
      image: "/placeholder.svg?height=300&width=400",
      originalPrice: "R 7 800",
      salePrice: "R 6 500",
      discount: "17% OFF",
      title: "GREY MEMORIAL",
      details: "Full Tombstone | Granite | Simple Theme",
      features: "Laser Engraving | 5-Year Warranty",
      manufacturer: "Stone Masters",
      location: "Cape Town, Western Cape",
      tag: "SPECIAL OFFER",
      tagColor: "bg-red-600",
      endDate: "2025-07-15T23:59:59",
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
      <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-48">
          <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
          <FavoriteButton product={favoriteProduct} className="absolute top-2 right-2" />
          <div className={`absolute top-2 left-2 ${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
            {product.tag}
          </div>
          <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {product.discount}
          </div>
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-bold text-blue-800">{product.salePrice}</p>
              <p className="text-xs text-gray-500 line-through">{product.originalPrice}</p>
            </div>
          </div>
          <h4 className="font-bold text-gray-800 mb-1">{product.title}</h4>
          <p className="text-xs text-gray-600">{product.details}</p>
          {!featured && product.manufacturer && product.location && (
            <div className="mt-2 text-xs text-gray-600">
              <p>{product.manufacturer}</p>
              <p>{product.location}</p>
            </div>
          )}
          <div className="mt-2 mb-2">
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
      <div className="border border-gray-300 rounded bg-white p-4 hover:shadow-md transition-shadow">
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
            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              {product.discount}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 text-xl">{product.title}</h3>
              <div>
                <p className="font-bold text-blue-800 text-xl">{product.salePrice}</p>
                <p className="text-sm text-gray-500 line-through text-right">{product.originalPrice}</p>
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
    )
  }

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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors bg-amber-50"
                    >
                      TOMBSTONES ON SPECIAL
                    </Link>
                  </div>
                </div>
              </div>

              {/* Find a Manufacturer Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Manufacturer
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                      href="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      FAVOURITES
                      {totalFavorites > 0 && (
                        <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {totalFavorites}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Login/Register Dropdown */}
          <div className="hidden md:block relative group">
            <button className="text-teal-500 text-sm hover:text-teal-600 transition-colors flex items-center">
              Login / Register
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
              <div className="py-1">
                <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  MANUFACTURERS LOGIN PORTAL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                <p className="text-gray-600">15 Special Offers</p>
                <div className="flex items-center">
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

              {/* Featured Special Offers */}
              <div className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">
                  FEATURED SPECIAL OFFERS
                </h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Limited Time Only</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialOffers.map((product, index) => (
                    <SpecialOfferCard key={index} product={product} />
                  ))}
                </div>
              </div>

              {/* Premium Special Offers */}
              <div className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">PREMIUM SPECIAL OFFERS</h2>
                <p className="text-center text-xs text-gray-500 mb-4">*Limited Time Only</p>

                <div className="space-y-4">
                  {premiumSpecials.map((product, index) => (
                    <PremiumSpecialOffer key={index} product={product} />
                  ))}
                </div>
              </div>

              {/* More Special Offers */}
              <div>
                <h2 className="text-gray-600 border-b border-gray-300 pb-2 mb-4">MORE SPECIAL OFFERS</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...specialOffers, ...specialOffers].map((product, index) => (
                    <SpecialOfferCard
                      key={`more-${index}`}
                      product={{
                        ...product,
                        id: `more-${product.id}-${index}`,
                        title: `${product.title} ${index + 1}`,
                        endDate: new Date(
                          new Date().getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                      }}
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
