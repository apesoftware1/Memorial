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

  // NEW: Check if screen is desktop/laptop
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // NEW: Check if screen is desktop/laptop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768); // 768px is typical md breakpoint
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Toggle dropdown
  const toggleDropdown = useCallback((name) => {
    if (name === 'location' && typeof window !== 'undefined' && window.innerWidth < 640) {
      // On small screens, use the parent's toggleDropdown to open the modal
      parentToggleDropdown('location');
    } else {
      // For other dropdowns or on larger screens, manage state internally
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
      <h2 className="text-xl sm:text-2xl text-[#D4AF37] font-semibold mb-3 sm:mb-4">
        FIND YOUR LOVED ONE A TOMBSTONE!
      </h2>

      {/* Search Form */}
      <SearchForm 
        onSearch={(searchTerm) => {
          // Update filters based on search term
          const searchTermLower = searchTerm.toLowerCase();
          
          // Check if search term matches any filter categories
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

          // Update other filters based on search term
          const newFilters = { ...filters };
          
          // Check for price-related terms
          if (searchTermLower.includes('cheap') || searchTermLower.includes('affordable')) {
            newFilters.minPrice = "R 5,001";
            newFilters.maxPrice = "R 15,000";
          }

          // Check for material types
          if (searchTermLower.includes('granite')) {
            newFilters.stoneType = "Granite";
          } else if (searchTermLower.includes('marble')) {
            newFilters.stoneType = "Marble";
          }

          // Check for design themes
          if (searchTermLower.includes('cross')) {
            newFilters.designTheme = "Cross";
          } else if (searchTermLower.includes('angel')) {
            newFilters.designTheme = "Angel";
          }

          // Update filters state
          setFilters(newFilters);

          // Trigger search with updated filters
          handleSearch();
        }}
      />

      {/* Reset Link */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => {
            setFilters({
              minPrice: null,
              maxPrice: null,
              colour: null,
              designTheme: null,
              location: null,
              stoneType: null,
              culture: null,
              custom: null,
            });
            setSelectedTown(null);
          }}
          className="text-[#D4AF37] hover:text-[#C4A027] text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      {/* All Filters Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2 sm:gap-4 relative">
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
        {/* Integrated Location Filter Dropdown */}
        <div className="relative" ref={(el) => (dropdownRefs.current['location'] = el)}>
          <button
            onClick={() => toggleDropdown('location')}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-haspopup="true"
            aria-expanded={uiState.openDropdown === 'location'}
          >
            <span>
              {filters.location && typeof filters.location === 'object' && filters.location.type === 'coords'
                ? 'Near me'
                : filters.location || 'Location'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${uiState.openDropdown === 'location' ? "transform rotate-180" : ""}`} />
          </button>
          {uiState.openDropdown === 'location' && (
            <>
              {isDesktop ? (
                <div className="absolute z-[100] w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 mt-1">
                  <LocationModal
                    isOpen={uiState.openDropdown === 'location'}
                    onClose={() => toggleDropdown('location')}
                    locationsData={locationsData.map(loc => ({
                      id: loc.id,
                      name: loc.name,
                      count: loc.count,
                      type: loc.id !== 'all' ? 'Province' : null
                    }))}
                    onSelectLocation={(location) => selectOption('location', location)}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </div>
              ) : (
                <LocationModal
                  isOpen={uiState.openDropdown === 'location'}
                  onClose={() => toggleDropdown('location')}
                  locationsData={locationsData.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    count: loc.count,
                    type: loc.id !== 'all' ? 'Province' : null
                  }))}
                  onSelectLocation={(location) => selectOption('location', location)}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}
            </>
          )}
        </div>
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
        {/* Additional Filters - Show under main filters on mobile */}
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 w-full">
        {/* More Options Button - Only show on desktop/laptop */}
        {isDesktop ? (
          <button
            onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
            className="w-full sm:w-[220px] bg-[#555555] text-white rounded font-bold text-base h-12 transition-colors hover:bg-[#666666] whitespace-nowrap"
            style={{ borderRadius: '8px' }}
          >
            {moreOptionsOpen ? '- Less Options' : '+ More Options'}
          </button>
        ) : (
          <button
            onClick={() => setUiState(prev => ({ ...prev, showAllOptions: !prev.showAllOptions }))}
            className="w-full sm:w-[220px] bg-[#555555] text-white rounded font-bold text-base h-12 transition-colors hover:bg-[#666666] whitespace-nowrap"
            style={{ borderRadius: '8px' }}
          >
            {uiState.showAllOptions ? '- Less Options' : '+ More Options'}
          </button>
        )}
        {/* Search Button */}
        <div className={`w-full sm:w-[220px] sm:ml-auto transition-transform duration-300 ease-in-out ${moreOptionsOpen ? 'translate-x-[233%]' : 'translate-x-0'} relative z-[5]`}>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className={`w-full bg-[#D4AF37] text-white rounded font-bold text-base h-12 transition-colors ${
              isSearching ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#C4A027]'
            }`}
            style={{ borderRadius: '8px' }}
          >
            {getSearchButtonText()}
          </button>
        </div>
      </div>

      {/* More Options Container (slides in from left) - Only on desktop/laptop */}
      {isDesktop && (
        <div
          className={`absolute top-0 left-0 w-full md:max-w-lg h-full bg-[#333] p-4 sm:p-6 transition-all duration-300 ease-in-out z-[1] 
            ${moreOptionsOpen ? 'translate-x-[100%] opacity-100 pointer-events-auto' : 'translate-x-0 opacity-0 pointer-events-none'}`}
          style={{
            width: '100%',
            maxWidth: '32rem', // matches md:max-w-lg
            height: '100%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-[#D4AF37] font-semibold"></h3>
            <button
              onClick={() => setMoreOptionsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close more options"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          {/* Additional Filters */}
          <div className="grid grid-cols-2 gap-2 mb-2 sm:gap-4 mt-32">
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