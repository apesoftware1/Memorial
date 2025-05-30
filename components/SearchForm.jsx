"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import SearchBox from "@/components/SearchBox"

const SearchForm = ({ onSearch }) => {
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
    "tombstone for sale", "cemetery headstone"
  ];

  // Function to handle search input changes
  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value);
    
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
  }, []);

  // Function to handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  }, [onSearch]);

  // Function to clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  }, []);

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
      <SearchBox 
        value={searchInput}
        onChange={handleSearchInputChange}
        onDropdownToggle={setShowSuggestions}
        isDropdownOpen={showSuggestions}
        onClear={handleClearSearch}
      />
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchForm; 