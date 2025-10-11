"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchForm({ onQueryChange, onSearchResults, onSubmit }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter criteria for mock search
  const filterCriteria = [
    "title",
    "company",
    "style",
    "slabStyle",
    "stoneType",
    "color",
    "customization",
  ];

  // Mock listings (replace with real API later)
  const mockListings = Array(30)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      title: i % 5 === 0 ? `Mausoleum Design ${i + 1}` : `Tombstone Design ${i + 1}`,
      company: { name: `Company ${Math.floor(i / 3) + 1}` },
      style: i % 3 === 0 ? "Modern" : i % 3 === 1 ? "Traditional" : "Contemporary",
      slabStyle: i % 4 === 0 ? "Flat" : i % 4 === 1 ? "Slant" : i % 4 === 2 ? "Upright" : "Bevel",
      stoneType: i % 3 === 0 ? "Granite" : i % 3 === 1 ? "Marble" : "Bronze",
      color: i % 5 === 0 ? "Black" : i % 5 === 1 ? "Gray" : i % 5 === 2 ? "White" : i % 5 === 3 ? "Blue" : "Red",
      customization: i % 2 === 0 ? "Available" : "Limited",
    }));

  // Filter listings based on query
  const filterListings = (query) => {
    if (!query.trim()) return mockListings;

    const lowerQuery = query.toLowerCase();

    return mockListings.filter((listing) =>
      filterCriteria.some((criteria) => {
        if (criteria === "company") return listing.company.name.toLowerCase().includes(lowerQuery);
        return listing[criteria] && listing[criteria].toLowerCase().includes(lowerQuery);
      })
    );
  };

  // Perform search and update results
  const performSearch = (query) => {
    setIsSearching(true);

    setTimeout(() => {
      const filtered = filterListings(query).slice(0, 19); // limit to 19 results
      setSearchResults(filtered);

      if (onSearchResults) onSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  // Handle form submission (Enter key)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onQueryChange) onQueryChange(searchQuery); // update parent with current query
    performSearch(searchQuery);
    
    // Call onSubmit handler if provided (for navigation)
    if (onSubmit) {
      onSubmit(searchQuery);
    }
  };

  // Live search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
      if (onQueryChange) onQueryChange(searchQuery); // notify parent of current query
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

      {/* Searching status */}
      {isSearching && <div className="mt-2 text-sm text-gray-500">Searching...</div>}

      {/* Search results count */}
      {!isSearching && searchQuery.trim() && (
        <div className="mt-2 text-sm text-[#333]">
          Found {searchResults.length} results for "{searchQuery}"
        </div>
      )}
    </form>
  );
}