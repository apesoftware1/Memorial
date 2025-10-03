"use client"

import { Search, X, Filter } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const SearchBox = ({ value, onChange, onDropdownToggle, isDropdownOpen, onClear, onSubmit }) => {
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const router = useRouter();
  
  // List of search criteria that will be used for filtering
  const searchCriteria = [
    "Listing Title", "Company Name", "Style", 
    "Slab Style", "Stone Type", "Colour", "Customisation"
  ];

  const handleEnterKey = () => {
    if (onSubmit) {
      onSubmit();
    }
    // Navigate to Tombstones for Sale page
    router.push('/tombstones-for-sale');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for tombstones, mausoleum, granite..."
        className="w-full px-4 py-3 pl-10 pr-10 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all duration-200"
        onFocus={() => onDropdownToggle(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleEnterKey();
          }
        }}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      
      {/* Filter icon with tooltip */}
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
        <button
          onMouseEnter={() => setShowFilterTooltip(true)}
          onMouseLeave={() => setShowFilterTooltip(false)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Search filters"
        >
          <Filter className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
        
        {/* Filter tooltip */}
        {showFilterTooltip && (
          <div className="absolute z-50 right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Search includes:</p>
            <ul className="text-xs text-gray-600">
              {searchCriteria.map((criteria, index) => (
                <li key={index} className="mb-1 flex items-center">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
                  {criteria}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default SearchBox;