"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import SearchForm from "@/components/SearchForm"
import FilterDropdown from "@/components/FilterDropdown"
import LocationModal from "@/components/LocationModal"

const SearchContainer = ({ 
  selectedCategory, 
  setSelectedCategory, 
  filters, 
  setFilters, 
  setSelectedTown,
  handleSearch,
  locationsData,
  filterOptions,
  isSearching,
  getSearchButtonText,
  locationModalOpen,
  handleLocationModalClose,
  parentToggleDropdown
}) => {
  // State for UI controls
  const [uiState, setUiState] = useState({
    openDropdown: null,
    showAllOptions: false,
  });

  // State for location search
  const [searchTerm, setSearchTerm] = useState('');

  // Refs for dropdowns
  const dropdownRefs = useRef({});

  // Check if screen is desktop/laptop
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if screen is desktop/laptop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Toggle dropdown
  const toggleDropdown = useCallback((name) => {
    if (name === 'location' && typeof window !== 'undefined' && window.innerWidth < 640) {
      parentToggleDropdown('location');
    } else {
      setUiState(prev => ({
        ...prev,
        openDropdown: prev.openDropdown === name ? null : name
      }));
    }
  }, [parentToggleDropdown]);

  // Select option from dropdown
  const selectOption = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setUiState(prev => ({
      ...prev,
      openDropdown: null
    }));
  }, [setFilters]);

  return (
    <div className="w-full md:max-w-lg flex flex-col gap-3 sm:gap-4 justify-between relative p-4 sm:p-6 bg-[#333]">
      {/* Search Heading */}
      <h2 className="text-xl sm:text-2xl text-[#D4AF37] font-semibold mb-0 tracking-wide leading-tight">
        Find Your Loved One A Tombstone!
      </h2>

      {/* Search Form */}
      <SearchForm 
        onSearch={(searchTerm) => {
          const searchTermLower = searchTerm.toLowerCase();
          
          if (searchTermLower.includes('premium')) {
            setSelectedCategory("PREMIUM");
          } else if (searchTermLower.includes('family')) {
            setSelectedCategory("FAMILY");
          } else if (searchTermLower.includes('child')) {
            setSelectedCategory("CHILD");
          } else if (searchTermLower.includes('head')) {
            setSelectedCategory("HEAD");
          } else if (searchTermLower.includes('cremation')) {
            setSelectedCategory("CREMATION");
          }

          const newFilters = { ...filters };
          
          if (searchTermLower.includes('cheap') || searchTermLower.includes('affordable')) {
            newFilters.minPrice = "R 5,001";
            newFilters.maxPrice = "R 15,000";
          }

          if (searchTermLower.includes('granite')) {
            newFilters.stoneType = "Granite";
          } else if (searchTermLower.includes('marble')) {
            newFilters.stoneType = "Marble";
          }
        }}
      />

      {/* Reset Link */}
      <div className="flex justify-end mb-0">
        <button
          onClick={() => {
            setFilters({});
            setSelectedCategory(null);
          }}
          className="text-[#D4AF37] hover:text-[#C4A027] font-medium text-sm tracking-wide transition-colors"
        >
          Reset
        </button>
      </div>

      {/* All Filters Grid */}
      <div className="grid grid-cols-2 gap-1 sm:gap-2 relative mb-2">
        {/* Primary Filters */}
        <FilterDropdown
          name="minPrice"
          label="Min Price"
          options={filterOptions.minPrice}
          openDropdown={uiState.openDropdown}
          toggleDropdown={toggleDropdown}
          selectOption={selectOption}
          filters={filters}
          dropdownRefs={dropdownRefs}
        />
        <FilterDropdown
          name="maxPrice"
          label="Max Price"
          options={filterOptions.maxPrice}
          openDropdown={uiState.openDropdown}
          toggleDropdown={toggleDropdown}
          selectOption={selectOption}
          filters={filters}
          dropdownRefs={dropdownRefs}
        />
        <FilterDropdown
          name="location"
          label="Location"
          options={filterOptions.location}
          openDropdown={uiState.openDropdown}
          toggleDropdown={toggleDropdown}
          selectOption={selectOption}
          filters={filters}
          dropdownRefs={dropdownRefs}
        />
        <FilterDropdown
          name="bodyType"
          label="Body Type"
          options={filterOptions.bodyType}
          openDropdown={uiState.openDropdown}
          toggleDropdown={toggleDropdown}
          selectOption={selectOption}
          filters={filters}
          dropdownRefs={dropdownRefs}
        />
        {!isDesktop && uiState.showAllOptions && (
          <>
            <FilterDropdown
              name="designTheme"
              label="Design Theme"
              options={filterOptions.designTheme}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
            <FilterDropdown
              name="stoneType"
              label="Stone Type"
              options={filterOptions.stoneType}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
            <FilterDropdown
              name="culture"
              label="Culture"
              options={filterOptions.culture}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
            <FilterDropdown
              name="custom"
              label="Custom"
              options={filterOptions.custom}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
          </>
        )}
      </div>

      {/* Action Buttons Container */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 w-full">
        {/* More Options Button */}
        {isDesktop ? (
          <button
            onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
            className="w-full sm:w-[180px] bg-[#333] text-white font-bold text-sm h-9 transition-colors border border-[#555555] hover:bg-[#444] whitespace-nowrap"
            style={{ borderRadius: '2px' }}
          >
            {moreOptionsOpen ? '- Less Options' : '+ More Options'}
          </button>
        ) : (
          <button
            onClick={() => setUiState(prev => ({ ...prev, showAllOptions: !prev.showAllOptions }))}
            className="w-full sm:w-[180px] bg-[#333] text-white font-bold text-sm h-9 transition-colors border border-[#555555] hover:bg-[#444] whitespace-nowrap"
            style={{ borderRadius: '2px' }}
          >
            {uiState.showAllOptions ? '- Less Options' : '+ More Options'}
          </button>
        )}
        {/* Search Button */}
        <div className={`w-full sm:w-[220px] sm:ml-auto transition-transform duration-300 ease-in-out ${moreOptionsOpen ? 'translate-x-[233%]' : 'translate-x-0'} relative z-[5] mb-4 md:mb-0`}>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className={`w-full bg-[#D4AF37] text-white rounded font-bold text-sm h-9 transition-colors ${
              isSearching ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#C4A027]'
            }`}
            style={{ borderRadius: '2px' }}
          >
            {getSearchButtonText()}
          </button>
        </div>
      </div>

      {/* Desktop More Options Container */}
      {isDesktop && (
        <div
          className={`absolute top-0 left-0 w-full md:max-w-lg h-full bg-[#333] p-4 sm:p-6 transition-all duration-300 ease-in-out z-[1] 
            ${moreOptionsOpen ? 'translate-x-[100%] opacity-100 pointer-events-auto' : 'translate-x-0 opacity-0 pointer-events-none'}`}
          style={{
            width: '100%',
            maxWidth: '32rem',
            height: '100%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-[#D4AF37] font-semibold">More Options</h3>
            <button
              onClick={() => setMoreOptionsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close more options"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          {/* Additional Filters */}
          <div className="grid grid-cols-2 gap-1 mb-2 sm:gap-2 mt-28">
            <FilterDropdown
              name="designTheme"
              label="Design Theme"
              options={filterOptions.designTheme}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
            <FilterDropdown
              name="stoneType"
              label="Stone Type"
              options={filterOptions.stoneType}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
            <FilterDropdown
              name="culture"
              label="Culture"
              options={filterOptions.culture}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
            <FilterDropdown
              name="custom"
              label="Custom"
              options={filterOptions.custom}
              openDropdown={uiState.openDropdown}
              toggleDropdown={toggleDropdown}
              selectOption={selectOption}
              filters={filters}
              dropdownRefs={dropdownRefs}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchContainer;