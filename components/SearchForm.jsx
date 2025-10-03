"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import SearchBox from "@/components/SearchBox"
import { Loader } from "@/components/ui/loader"

const SearchForm = ({ onSearch, onSearchSubmit }) => {
  // State for search input and suggestions
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchFormRef = useRef(null);

  // Search suggestions data
  const searchSuggestions = [
    "tombstone", "headstone", "gravestone", "grave marker", "memorial stone",
    "grave headstone", "granite tombstone", "marble headstone", "custom tombstone",
    "engraved headstone", "cemetery stone", "funeral stone", "affordable tombstone",
    "cheap headstone", "baby tombstone", "pet tombstone", "family headstone",
    "double headstone", "upright tombstone", "flat marker", "cross headstone",
    "black granite", "white marble", "angel tombstone", "Christian headstone",
    "Muslim tombstone", "personalized tombstone", "traditional tombstone",
    "modern headstone", "classic tombstone", "photo headstone", "cemetery monument",
    "memorial plaque", "burial stone", "tombstone engraving", "engraved plaque",
    "cremation memorial", "grave design", "headstone shop", "tombstone supplier",
    "buy tombstone", "headstone prices", "tombstone catalogue", "gravestone near me",
    "headstone for child", "veteran headstone", "memorial design", "online tombstone",
    "tombstone for sale", "cemetery headstone", "mausoleum"
  ];

  // Search filter criteria
  const filterCriteria = [
    { name: "title", label: "Listing Title" },
    { name: "company", label: "Company Name" },
    { name: "style", label: "Style" },
    { name: "slabStyle", label: "Slab Style" },
    { name: "stoneType", label: "Stone Type" },
    { name: "color", label: "Colour" },
    { name: "customization", label: "Customisation" }
  ];

  // Function to handle search input changes
  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value);
    
    // Update search filter in real-time as user types
    if (onSearch) {
      // Pass search value, filter criteria, and immediate flag for real-time updates
      onSearch(value, filterCriteria.map(c => c.name), true);
    }
    
    if (value.trim()) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show top 5 matches
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onSearch, filterCriteria]);

  // Function to handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      // Pass selected suggestion and filter criteria
      onSearch(suggestion, filterCriteria.map(c => c.name), true); // true for immediate search
    }
    
    // Also trigger the search submission
    if (onSearchSubmit) {
      onSearchSubmit(suggestion, filterCriteria.map(c => c.name));
    }
  }, [onSearch, onSearchSubmit, filterCriteria]);

  // Function to handle search form submission
  const handleSearchSubmit = useCallback(() => {
    if (searchInput.trim() && onSearchSubmit) {
      // Pass search input and filter criteria for comprehensive search
      onSearchSubmit(searchInput.trim(), filterCriteria.map(c => c.name));
    }
  }, [searchInput, onSearchSubmit, filterCriteria]);

  // Function to handle search button click
  const handleSearchButtonClick = useCallback(() => {
    if (searchInput.trim() && onSearchSubmit) {
      // Pass search input and filter criteria for comprehensive search
      onSearchSubmit(searchInput.trim(), filterCriteria.map(c => c.name));
      
      // Trigger immediate search without waiting for debounce
      if (onSearch) {
        onSearch(searchInput.trim(), filterCriteria.map(c => c.name), true); // true indicates immediate search
      }
    }
  }, [searchInput, onSearchSubmit, onSearch, filterCriteria]);

  // Function to clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    
    // Clear search results by passing empty string
    if (onSearch) {
      onSearch("", []);
    }
  }, [onSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchFormRef}>
      <div className="flex gap-2">
        <SearchBox 
          value={searchInput}
          onChange={handleSearchInputChange}
          onDropdownToggle={setShowSuggestions}
          isDropdownOpen={showSuggestions}
          onClear={handleClearSearch}
          onSubmit={handleSearchSubmit}
        />
        <button
          onClick={handleSearchButtonClick}
          disabled={!searchInput.trim()}
          className="px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-md hover:bg-[#C4A027] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          Search
        </button>
      </div>
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              <Loader size="sm" variant="dots" text="Searching..." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchForm;