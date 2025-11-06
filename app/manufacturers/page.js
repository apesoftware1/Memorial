"use client"

import { useQuery } from '@apollo/client';
import { GET_MANUFACTURERS } from '@/graphql/queries/getManufacturers';
import ManufacturerCard from '../components/ManufacturerCard';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Search, Check } from "lucide-react";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import locationsData from '@/sa_locations_expanded.json';
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery"
import {
  MANUFACTURERS_INITIAL_QUERY,
  MANUFACTURERS_FULL_QUERY,
  MANUFACTURERS_DELTA_QUERY,
} from '@/graphql/queries/getManufacturers';

export default function ManufacturersPage() {

  const { loading, error, data } = useProgressiveQuery({
      initialQuery: MANUFACTURERS_INITIAL_QUERY,
      fullQuery: MANUFACTURERS_FULL_QUERY,
      deltaQuery: MANUFACTURERS_DELTA_QUERY,
      variables: { limit: 5 },
      storageKey: 'manufacturers:lastUpdated',
      refreshInterval: 3000,
    });
  const sortModalRef = useRef(null);
  const locationDropdownRef = useRef(null);

  // State for UI controls (for Header component)
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

  // State for search filters
  const [searchFilters, setSearchFilters] = useState({
    manufacturerName: "",
    stoneType: "",
    location: "",
  });
  
  // State for suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const suggestionsRef = useRef(null);

  // State for sort dropdown visibility
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // State for sort order
  const [sortOrder, setSortOrder] = useState("Default");
  
  // State for filtered manufacturers
  const [filteredManufacturers, setFilteredManufacturers] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  
  // State for location dropdown
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  // State for expanded provinces and cities in dropdown
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedCities, setExpandedCities] = useState({});
  // State for selected location items
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);
  
  // Handle click outside of sort modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortModalRef.current && !sortModalRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
      
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    if (showSortDropdown || showLocationDropdown || showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown, showLocationDropdown, showSuggestions]);
  
  // Filter suggestions based on input
  const handleSearchInputChange = (e) => {
    const userInput = e.target.value;
    setSearchFilters({ ...searchFilters, manufacturerName: userInput });
    
    if (!data?.companies || !Array.isArray(data.companies)) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Filter companies based on input
    if (userInput.trim() === '') {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    } else {
      const filteredOptions = data.companies
        .filter(company => 
          company.name.toLowerCase().includes(userInput.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 suggestions
      
      setFilteredSuggestions(filteredOptions);
      setShowSuggestions(true);
      setActiveSuggestionIndex(0);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // If no suggestions or not showing suggestions, return
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    
    // Arrow Up
    if (e.keyCode === 38) {
      if (activeSuggestionIndex === 0) {
        return;
      }
      setActiveSuggestionIndex(activeSuggestionIndex - 1);
    }
    // Arrow Down
    else if (e.keyCode === 40) {
      if (activeSuggestionIndex === filteredSuggestions.length - 1) {
        return;
      }
      setActiveSuggestionIndex(activeSuggestionIndex + 1);
    }
    // Enter
    else if (e.keyCode === 13) {
      e.preventDefault();
      setSearchFilters({ 
        ...searchFilters, 
        manufacturerName: filteredSuggestions[activeSuggestionIndex].name 
      });
      setShowSuggestions(false);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchFilters({ ...searchFilters, manufacturerName: suggestion.name });
    setShowSuggestions(false);
  };
  
  // State for active province
  const [activeProvince, setActiveProvince] = useState(null);
  // State for active city
  const [activeCity, setActiveCity] = useState(null);

  // Provinces data from imported JSON
  const provinces = locationsData.provinces || [];

  // Manufacturer groups for sidebar
  const manufacturerGroups = [
    "Royal Tombstones",
    "Aztec Tombstones",
    "SA Tombstones",
    "Premium Memorials",
    "Family Monuments",
  ];
  
  // Toggle province expansion in dropdown
  const toggleProvince = (provinceName) => {
    setExpandedProvinces(prev => ({
      ...prev,
      [provinceName]: !prev[provinceName]
    }));
  };
  
  // Toggle city expansion in dropdown
  const toggleCity = (cityName, provinceName) => {
    setExpandedCities(prev => ({
      ...prev,
      [`${provinceName}-${cityName}`]: !prev[`${provinceName}-${cityName}`]
    }));
  };
  
  // Filter manufacturers based on search criteria
  const filterManufacturers = () => {
    if (!data?.companies || !Array.isArray(data.companies)) {
      return;
    }
    
    const nameFilter = searchFilters.manufacturerName.toLowerCase().trim();
    const locationFilter = (searchFilters.location || '').toLowerCase().replace(/\s*,\s*/g, ',').split(',').pop().trim();

    
    const filtered = data.companies.filter(company => {
      const nameMatch = nameFilter === '' || 
        (company.name && company.name.toLowerCase().includes(nameFilter));
      
      const locationMatch = locationFilter === '' || 
        (company.location && company.location.toLowerCase().includes(locationFilter));
    
      
      return nameMatch && locationMatch;
    });
    
    setFilteredManufacturers(filtered);
    setIsFiltered(true);
  };
  
  // Handle search button click
  const handleSearchClick = () => {
    filterManufacturers();
  };
  
  // Handle selection of province, city, or town
  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedTown(null);
    setSearchFilters(prev => ({
      ...prev,
      location: province.name
    }));
    setShowLocationDropdown(false);
  };
  
  const handleCitySelect = (city, province) => {
    setSelectedProvince(province);
    setSelectedCity(city);
    setSelectedTown(null);
    setSearchFilters(prev => ({
      ...prev,
      location: `${province.name}, ${city.name}`
    }));
    setShowLocationDropdown(false);
  };
  
  const handleTownSelect = (town, city, province) => {
    setSelectedProvince(province);
    setSelectedCity(city);
    setSelectedTown(town);
    setSearchFilters(prev => ({
      ...prev,
      location: `${province.name}, ${city.name}, ${town}`
    }));
    setShowLocationDropdown(false);
  };

  // Handlers for province and city selection
  const handleProvinceClick = (provinceName) => {
    if (provinceName === activeProvince) {
      setActiveProvince(null);
      setActiveCity(null); // Reset city when province is deselected
    } else {
      setActiveProvince(provinceName);
      setActiveCity(null); // Reset city when new province is selected
    }
  };

  const handleCityClick = (cityName) => {
    setActiveCity(cityName === activeCity ? null : cityName);
  };

  // Reset button handler for the locations dropdown
  const resetLocationDropdown = useCallback(() => {
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedTown(null);
    setExpandedProvinces({});
    setExpandedCities({});
    setSearchFilters(prev => ({ ...prev, location: "" }));
  }, []);
  const handleMobileMenuToggle = useCallback(() => {
    setUiState((prev) => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState((prev) => ({
      ...prev,
      mobileDropdown: prev.mobileDropdown === section ? null : section,
    }));
  }, []);

  if (loading) return <div>Loading manufacturers...</div>;
  if (error) return <div>Error loading manufacturers{console.error("GraphQL Error:", error)}</div>;

  // Prepare sorted manufacturers and results count
  let sortedManufacturers = Array.isArray(data?.companies) ? [...data.companies] : [];
  
  // Apply sorting logic based on sortOrder
  if (sortOrder === "Alphabetical: A-Z") {
    sortedManufacturers.sort((a, b) => {
      const nameA = a.name ? a.name.toLowerCase() : '';
      const nameB = b.name ? b.name.toLowerCase() : '';
      return nameA.localeCompare(nameB);
    });
  } else if (sortOrder === "Rating: High to Low") {
    sortedManufacturers.sort((a, b) => {
      const ratingA = a.googleRating ? parseFloat(a.googleRating) : 0;
      const ratingB = b.googleRating ? parseFloat(b.googleRating) : 0;
      return ratingB - ratingA;
    });
  } else if (sortOrder === "Listings: Most to Least") {
    sortedManufacturers.sort((a, b) => {
      const listingsA = a.listings ? a.listings.length : 0;
      const listingsB = b.listings ? b.listings.length : 0;
      return listingsB - listingsA;
    });
  } else if (sortOrder === "Distance: Nearest First") {
    // For now, keep default order as we don't have distance calculation
    // This could be implemented later with geolocation
  }
  
  const resultsCount = sortedManufacturers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative z-50 w-full">
        <Header
          mobileMenuOpen={uiState.mobileMenuOpen}
          handleMobileMenuToggle={handleMobileMenuToggle}
          mobileDropdown={uiState.mobileDropdown}
          handleMobileDropdownToggle={handleMobileDropdownToggle}
        />
      </div>
      {/* Search Filters */}
      <div className="bg-[#00647A] py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex flex-col md:flex-row gap-2 w-full max-w-4xl justify-center items-center">
            <div className="relative flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Manufacturer Name"
                  className="w-full p-2 pl-10 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchFilters.manufacturerName}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  onClick={() => {
                    if (searchFilters.manufacturerName && data?.companies) {
                      handleSearchInputChange({ target: { value: searchFilters.manufacturerName } });
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
                  >
                    <ul className="py-1">
                      {filteredSuggestions.map((suggestion, index) => (
                        <li
                          key={suggestion.id || index}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            index === activeSuggestionIndex ? 'bg-amber-50 text-amber-700' : ''
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
     
              
            <div className="relative flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full p-2 pl-10 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer bg-white"
                  value={selectedTown || selectedCity?.name || selectedProvince?.name || ''}
                  readOnly
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Hierarchical Location Dropdown */}
                {showLocationDropdown && (
                  <div 
                    ref={locationDropdownRef}
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto"
                  >
                    <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-gray-200 flex justify-end">
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        onClick={(e) => { e.stopPropagation(); resetLocationDropdown(); }}
                      >
                        reset
                      </button>
                    </div>
                    {/* Provinces */}
                    {provinces.map((province) => (
                      <div key={province.name} className="border-b border-gray-100 last:border-b-0">
                        <div 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleProvince(province.name)}
                        >
                          <div 
                            className="flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProvinceSelect(province);
                            }}
                          >
                            <input
                              type="checkbox"
                              className="mr-2 h-4 w-4"
                              checked={selectedProvince?.name === province.name && !selectedCity && !selectedTown}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedProvince(province);
                                  setSelectedCity(null);
                                  setSelectedTown(null);
                                  setSearchFilters(prev => ({ ...prev, location: province.name }));
                                } else {
                                  setSelectedProvince(null);
                                  setSelectedCity(null);
                                  setSelectedTown(null);
                                  setSearchFilters(prev => ({ ...prev, location: "" }));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium">{province.name}</span>
                            {selectedProvince?.name === province.name && !selectedCity && (
                              <span className="ml-2 text-xs text-blue-600">({province.cities.length} cities)</span>
                            )}
                          </div>
                          <ChevronDown 
                            className={`h-4 w-4 text-gray-400 transition-transform ${expandedProvinces[province.name] ? 'rotate-180' : ''}`} 
                          />
                        </div>

                        {/* Cities */}
                        {expandedProvinces[province.name] && (
                          <div className="pl-4 border-t border-gray-100">
                            {province.cities.map((city) => (
                              <div key={city.name} className="border-b border-gray-100 last:border-b-0">
                                <div 
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => toggleCity(city.name, province.name)}
                                >
                                  <div 
                                    className="flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCitySelect(city, province);
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      className="mr-2 h-4 w-4"
                                      checked={selectedCity?.name === city.name && selectedProvince?.name === province.name && !selectedTown}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        if (selectedCity?.name === city.name && selectedProvince?.name === province.name) {
                                          setSelectedCity(null);
                                          setSelectedTown(null);
                                          setSearchFilters(prev => ({ ...prev, location: province.name }));
                                        } else {
                                          setSelectedProvince(province);
                                          setSelectedCity(city);
                                          setSelectedTown(null);
                                          setSearchFilters(prev => ({ ...prev, location: `${province.name}, ${city.name}` }));
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span>{city.name}</span>
                                    {selectedCity?.name === city.name && selectedProvince?.name === province.name && !selectedTown && (
                                      <span className="ml-2 text-xs text-blue-600">({city.towns.length} towns)</span>
                                    )}
                                  </div>
                                  <ChevronDown 
                                    className={`h-4 w-4 text-gray-400 transition-transform ${expandedCities[`${province.name}-${city.name}`] ? 'rotate-180' : ''}`} 
                                  />
                                </div>

                                {/* Towns */}
                                {expandedCities[`${province.name}-${city.name}`] && (
                                  <div className="pl-4 border-t border-gray-100">
                                    {city.towns.map((town) => (
                                      <div 
                                        key={town}
                                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleTownSelect(town, city, province)}
                                      >
                                        <input
                                          type="checkbox"
                                          className="mr-2 h-4 w-4"
                                          checked={selectedTown === town && selectedCity?.name === city.name && selectedProvince?.name === province.name}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            if (selectedTown === town && selectedCity?.name === city.name && selectedProvince?.name === province.name) {
                                              setSelectedTown(null);
                                              setSearchFilters(prev => ({ ...prev, location: `${province.name}, ${city.name}` }));
                                            } else {
                                              setSelectedProvince(province);
                                              setSelectedCity(city);
                                              setSelectedTown(town);
                                              setSearchFilters(prev => ({ ...prev, location: `${province.name}, ${city.name}, ${town}` }));
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-sm">{town}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={handleSearchClick}
              className="bg-amber-500 hover:bg-amber-600 text-white h-10 px-4 py-0 text-sm rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 whitespace-nowrap">
              <Search className="h-4 w-4" />
              <span className="truncate">Search for Manufacturers</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-0 md:px-0 py-4 bg-gray-50 md:ml-32">
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                <span className="text-gray-700 font-medium">Manufacturers</span>
              </li>
              {/* activeProvince is not defined in this component, so this block is commented out */}
              {/* {activeProvince && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                  <span className="text-gray-700">{activeProvince}</span>
                </li>
              )} */}
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Manufacturers in South Africa</h1>
        </div>
      </div>

      {/* Results Header and columns in same max-width container */}
      <div className="container mx-auto px-0 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4 w-full bg-gray-100 px-4 py-2 pr-0 rounded">
          <span className="font-bold text-lg text-gray-800">{isFiltered ? filteredManufacturers.length : resultsCount}</span>
          <span className="text-gray-600 ml-2">Results</span>
          <div className="flex items-center w-full max-w-xs justify-end">
            {/* Mobile Sort Button */}
            <div className="sm:hidden flex items-center text-blue-600 font-semibold cursor-pointer select-none" onClick={() => setShowSortDropdown(!showSortDropdown)}>
              <span className="mr-1">Sort</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {/* Mobile Sort Modal */}
            {showSortDropdown && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 sm:hidden">
                <div ref={sortModalRef} className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up">
                  {['Default', 'Rating: High to Low', 'Listings: Most to Least', 'Distance: Nearest First', 'Alphabetical: A-Z'].map(option => (
                    <div
                      key={option}
                      className={`flex items-center justify-between px-2 py-4 text-lg border-b border-[#333] last:border-b-0 cursor-pointer ${sortOrder === option ? 'text-white font-bold' : 'text-gray-200'}`}
                      onClick={() => { setSortOrder(option); setShowSortDropdown(false); }}
                    >
                      <span>{option}</span>
                      <span className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${sortOrder === option ? 'border-blue-500' : 'border-gray-500'}`}
                            style={{ background: sortOrder === option ? '#2196f3' : 'transparent' }}>
                        {sortOrder === option && <span className="block w-3 h-3 bg-white rounded-full"></span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center">
              <span className="text-sm font-semibold text-gray-700 mr-2">Sort by</span>
              <select
                className="p-1 border border-gray-300 rounded text-sm font-semibold text-blue-600 bg-white"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option>Default</option>
                <option>Rating: High to Low</option>
                <option>Listings: Most to Least</option>
                <option>Alphabetical: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Two-column layout under results header */}
        <div className="flex flex-col md:flex-row gap-0 w-auto">
          {/* Left: Manufacturers List and Pagination */}
          <div className="w-auto md:w-4/5 flex flex-col space-y-4 items-start">
            {Array.isArray(isFiltered ? filteredManufacturers : data?.companies) && 
              (isFiltered ? filteredManufacturers : data?.companies).map((company) => (
                <ManufacturerCard
                  key={company.documentId}
                  manufacturer={{
                    ...company,
                    logo: company.logoUrl || '',
                    rating: company.googleRating,
                  }}
                />
              ))}
            {resultsCount > 5 && (
              <div className="mt-8 flex justify-start w-auto">
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
            )}
          </div>
          {/* Right: Sidebar */}
          <div className="w-auto md:w-1/5 flex flex-col gap-4 items-start mt-6 md:mt-0">
            <div className="bg-white border border-gray-300 rounded p-2 w-full">
              <h2 className="font-bold text-gray-800 mb-4">
                {activeProvince ? `Manufacturers in ${activeProvince}` : "Manufacturers by Province"}
              </h2>
              {/* Province filters */}
              <div className="mb-6">
                <div className="space-y-2">
                  {/* Province and city buttons will be rendered here when real data is available */}
                </div>
              </div>
              {/* Other manufacturer groups */}
              <div className="bg-white border border-gray-300 rounded p-2 w-full">
                <h2 className="font-bold text-gray-800 mb-4">Other Manufacturer Groups</h2>
                <ul className="space-y-2">
                  {manufacturerGroups.map((group) => (
                    <li key={group}>
                      <Link href="#" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                        {group}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Back to Manufacturers */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <a
            href="/manufacturers"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Manufacturers
          </a>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

