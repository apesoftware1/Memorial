"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import SearchForm from "@/components/SearchForm"
import FilterDropdown from "@/components/FilterDropdown"
import LocationModal from "@/components/LocationModal"
import CategoryTabs from "@/components/CategoryTabs.jsx"

// Default filter options with updated price ranges
const defaultFilterOptions = {
  minPrice: ["Min Price", ...Array.from({length: 100}, (_, i) => `R ${(1000 + i * 2000).toLocaleString()}`)],
  maxPrice: ["Max Price", ...Array.from({length: 100}, (_, i) => `R ${(3000 + i * 2000).toLocaleString()}`), "R 200,000+"],
  location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
  style: [
    "Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports"
  ],
  stoneType: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
  custom: ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"],
  colour: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
  bodyType: ["Full Tombstone", "Headstone", "Double Headstone", "Cremation Memorial", "Family Monument", "Child Memorial", "Custom Design"],
  culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
};

const SearchContainer = ({ 
  selectedCategory, 
  setSelectedCategory, 
  filters, 
  setFilters, 
  setSelectedTown,
  handleSearch,
  locationsData,
  filterOptions = defaultFilterOptions,
  isSearching = false,
  getSearchButtonText,
  locationModalOpen,
  handleLocationModalClose,
  parentToggleDropdown,
  categories,
  activeTab,
  setActiveTab
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

  // Internal state for search functionality if not provided
  const [internalIsSearching, setInternalIsSearching] = useState(false);

  // Default functions if not provided
  const defaultHandleSearch = useCallback(() => {
    setInternalIsSearching(true);
    setTimeout(() => setInternalIsSearching(false), 500);
  }, []);

  const defaultGetSearchButtonText = useCallback(() => {
    const searching = isSearching !== undefined ? isSearching : internalIsSearching;
    return searching ? 'Searching...' : 'Search';
  }, [isSearching, internalIsSearching]);

  // Use provided functions or defaults
  const finalHandleSearch = handleSearch || defaultHandleSearch;
  const finalGetSearchButtonText = getSearchButtonText || defaultGetSearchButtonText;
  const finalIsSearching = isSearching !== undefined ? isSearching : internalIsSearching;

  // Check if screen is desktop/laptop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Click outside functionality to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uiState.openDropdown) {
        const dropdownRef = dropdownRefs.current[uiState.openDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target)) {
          setUiState(prev => ({
            ...prev,
            openDropdown: null
          }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [uiState.openDropdown]);

  // Toggle dropdown
  const toggleDropdown = useCallback((name) => {
    if (name === 'location' && typeof window !== 'undefined' && window.innerWidth < 640) {
      if (parentToggleDropdown) {
        parentToggleDropdown('location');
      }
    } else {
      setUiState(prev => ({
        ...prev,
        openDropdown: prev.openDropdown === name ? null : name
      }));
    }
  }, [parentToggleDropdown]);

  // Select option from dropdown
  const selectOption = useCallback((name, value) => {
    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setUiState(prev => ({
      ...prev,
      openDropdown: null
    }));
  }, [setFilters]);

  return (
    <div className="w-full md:max-w-lg flex flex-col justify-between relative bg-[#005D77] ml-0 md:ml-[226px] mt-0 md:mt-20">
      {/* CategoryTabs - flush with top and sides */}
      <div className="w-full">
        <CategoryTabs categories={categories} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {/* Main content with padding below tabs */}
      <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
        {/* Search Heading */}
        <h2 className="text-xl sm:text-2xl text-[#D4AF37] font-semibold mb-0 tracking-wide leading-tight">
          Find Your Loved One A Tombstone!
        </h2>

        {/* Search Form */}
        <SearchForm 
          onSearch={(searchTerm) => {
            const searchTermLower = searchTerm.toLowerCase();
            
            if (setSelectedCategory) {
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
            }

            if (setFilters) {
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

              setFilters(newFilters);
            }
          }}
        />

        {/* Reset Link */}
        <div className="flex justify-end mb-0">
          <button
            onClick={() => {
              if (setFilters) setFilters({});
              if (setSelectedCategory) setSelectedCategory(null);
            }}
            className="text-[#D4AF37] hover:text-[#C4A027] font-medium text-sm tracking-wide transition-colors"
          >
            Reset
          </button>
        </div>

        {/* All Filters Grid */}
        <div className="grid grid-cols-2 gap-1 sm:gap-2 relative mb-2">
          <FilterDropdown
            name="minPrice"
            label="Min Price"
            options={filterOptions.minPrice}
            openDropdown={uiState.openDropdown}
            toggleDropdown={toggleDropdown}
            selectOption={selectOption}
            filters={filters || {}}
            dropdownRefs={dropdownRefs}
          />
          <FilterDropdown
            name="maxPrice"
            label="Max Price"
            options={filterOptions.maxPrice}
            openDropdown={uiState.openDropdown}
            toggleDropdown={toggleDropdown}
            selectOption={selectOption}
            filters={filters || {}}
            dropdownRefs={dropdownRefs}
          />
          <FilterDropdown
            name="location"
            label="Location"
            options={filterOptions.location}
            openDropdown={uiState.openDropdown}
            toggleDropdown={toggleDropdown}
            selectOption={selectOption}
            filters={filters || {}}
            dropdownRefs={dropdownRefs}
          />
          <FilterDropdown
            name="style"
            label="Style"
            options={filterOptions.style}
            openDropdown={uiState.openDropdown}
            toggleDropdown={toggleDropdown}
            selectOption={selectOption}
            filters={filters || {}}
            dropdownRefs={dropdownRefs}
          />
          {!isDesktop && uiState.showAllOptions && (
            <>
              <FilterDropdown
                name="stoneType"
                label="Material"
                options={filterOptions.stoneType}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="custom"
                label="Customisation"
                options={filterOptions.custom}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="colour"
                label="Colour"
                options={filterOptions.colour}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
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
              className="w-full sm:w-[180px] bg-[#0D7C99] text-white font-bold text-sm h-9 transition-colors hover:bg-[#0D7C99]/90 whitespace-nowrap shadow"
              style={{ borderRadius: '2px' }}
            >
              {moreOptionsOpen ? '- Less Options' : '+ More Options'}
            </button>
          ) : (
            <button
              onClick={() => setUiState(prev => ({ ...prev, showAllOptions: !prev.showAllOptions }))}
              className="w-full sm:w-[180px] bg-[#0D7C99] text-white font-bold text-sm h-9 transition-colors hover:bg-[#0D7C99]/90 whitespace-nowrap shadow"
              style={{ borderRadius: '2px' }}
            >
              {uiState.showAllOptions ? '- Less Options' : '+ More Options'}
            </button>
          )}
          {/* Search Button */}
          {(!isDesktop && (
            <div className={`w-full sm:w-[220px] sm:ml-auto transition-transform duration-300 ease-in-out ${moreOptionsOpen ? 'translate-x-[233%]' : 'translate-x-0'} relative z-[5] mb-4 md:mb-0`}>
              <button
                type="button"
                onClick={finalHandleSearch}
                disabled={finalIsSearching}
                className={`w-full bg-[#D4AF37] text-white rounded font-bold text-sm h-9 transition-colors ${
                  finalIsSearching ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#C4A027]'
                }`}
                style={{ borderRadius: '2px' }}
              >
                {finalGetSearchButtonText()}
              </button>
            </div>
          )) || (isDesktop && uiState.openDropdown !== 'custom' && (
            <div className={`w-full sm:w-[220px] sm:ml-auto transition-transform duration-300 ease-in-out ${moreOptionsOpen ? 'translate-x-[233%]' : 'translate-x-0'} relative z-[5] mb-4 md:mb-0`}>
              <button
                type="button"
                onClick={finalHandleSearch}
                disabled={finalIsSearching}
                className={`w-full bg-[#D4AF37] text-white rounded font-bold text-sm h-9 transition-colors ${
                  finalIsSearching ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#C4A027]'
                }`}
                style={{ borderRadius: '2px' }}
              >
                {finalGetSearchButtonText()}
              </button>
            </div>
          ))}
        </div>

      
      {/* Desktop More Options Container */}
      {isDesktop && (
        <div
          className={`absolute left-0 w-full md:max-w-lg bg-[#005D77] p-4 sm:p-6 flex flex-col transition-all duration-300 ease-in-out z-[1] 
            ${moreOptionsOpen ? 'translate-x-[100%] opacity-100 pointer-events-auto' : 'translate-x-0 opacity-0 pointer-events-none'}`}
          style={{
            top: '56px',
            bottom: 0,
            width: '100%',
            maxWidth: '32rem',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl text-[#D4AF37] font-semibold">More Options</h3>
            <button
              onClick={() => setMoreOptionsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close more options"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
            {/* Additional Filters - Reordered as requested */}
            <div className="grid grid-cols-2 gap-1 mb-2 sm:gap-2" style={{ marginTop: '102px' }}>
              <FilterDropdown
                name="stoneType"
                label="Material"
                options={filterOptions.stoneType}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="custom"
                label="Customisation"
                options={filterOptions.custom}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="colour"
                label="Colour"
                options={filterOptions.colour}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchContainer;