"use client"

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

export default function SearchForm({ onSearchResults }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Define filter criteria for search
  const filterCriteria = [
    "title", "company", "style", "slabStyle", 
    "stoneType", "color", "customization"
  ]

  // Mock data for demonstration - in a real app, this would come from an API
  const mockListings = Array(30).fill().map((_, i) => ({
    id: i + 1,
    title: i % 5 === 0 ? `Mausoleum Design ${i+1}` : `Tombstone Design ${i+1}`,
    company: {
      name: `Company ${Math.floor(i/3) + 1}`
    },
    style: i % 3 === 0 ? 'Modern' : i % 3 === 1 ? 'Traditional' : 'Contemporary',
    slabStyle: i % 4 === 0 ? 'Flat' : i % 4 === 1 ? 'Slant' : i % 4 === 2 ? 'Upright' : 'Bevel',
    stoneType: i % 3 === 0 ? 'Granite' : i % 3 === 1 ? 'Marble' : 'Bronze',
    color: i % 5 === 0 ? 'Black' : i % 5 === 1 ? 'Gray' : i % 5 === 2 ? 'White' : i % 5 === 3 ? 'Blue' : 'Red',
    customization: i % 2 === 0 ? 'Available' : 'Limited'
  }))

  // Function to filter listings based on search query and criteria
  const filterListings = (query) => {
    if (!query.trim()) {
      return mockListings
    }

    const lowercaseQuery = query.toLowerCase()
    
    return mockListings.filter(listing => {
      // Check if any of the filter criteria match the query
      return filterCriteria.some(criteria => {
        if (criteria === 'company') {
          return listing.company.name.toLowerCase().includes(lowercaseQuery)
        } else if (listing[criteria]) {
          return listing[criteria].toLowerCase().includes(lowercaseQuery)
        }
        return false
      })
    })
  }

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  // Perform search and update results
  const performSearch = (query) => {
    setIsSearching(true)
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      const filteredResults = filterListings(query)
      // Limit to 19 results as per requirements
      const limitedResults = filteredResults.slice(0, 19)
      setSearchResults(limitedResults)
      
      // Pass results to parent component if callback exists
      if (onSearchResults) {
        onSearchResults(limitedResults)
      }
      
      setIsSearching(false)
    }, 300)
  }

  // Real-time search as user types (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for tombstones, mausoleum, granite..."
          className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 p-2 bg-white rounded-lg text-gray-700 hover:text-gray-900 transition-colors"
          disabled={isSearching}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      
      {/* Search status indicator */}
      {isSearching && (
        <div className="mt-2 text-sm text-gray-500">Searching...</div>
      )}
      
      {/* Search results count */}
      {!isSearching && searchQuery.trim() && (
        <div className="mt-2 text-sm text-gray-600">
          Found {searchResults.length} results for "{searchQuery}"
        </div>
      )}
    </form>
  )
}