"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useApolloClient } from "@apollo/client"
import { X, MapPin, Loader, ChevronDown, ChevronRight } from "lucide-react"
import { useGuestLocation } from "@/hooks/useGuestLocation"
import { LISTING_SEARCH_INDEX_CONNECTION_QUERY } from "@/graphql/queries/listingsProgressive"

export default function LocationModal({
  isOpen,
  onClose,
  locationsData,
  onSelectLocation,
  selectedLocations,
  locationCountBaseFilters,
  disableCountsFetch = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);
  const [geolocationStatus, setGeolocationStatus] = useState('idle');
  const [geolocationError, setGeolocationError] = useState(null);
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedCities, setExpandedCities] = useState({});
  const [selectedValues, setSelectedValues] = useState([]);

  const toggleProvince = (e, provinceName) => {
    e.stopPropagation();
    setExpandedProvinces(prev => ({
      ...prev,
      [provinceName]: !prev[provinceName]
    }));
  };

  const toggleCity = (e, provinceName, cityName) => {
    e.stopPropagation();
    const key = `${provinceName}::${cityName}`;
    setExpandedCities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Use real location data from the hook
  const { location: userLocation } = useGuestLocation();

  const apolloClient = useApolloClient();
  const [locationCountMap, setLocationCountMap] = useState({});
  const locationCountPendingRef = useRef(new Set());
  const locationCountMapRef = useRef(locationCountMap);
  useEffect(() => {
    locationCountMapRef.current = locationCountMap;
  }, [locationCountMap]);
  useEffect(() => {
    setLocationCountMap({});
    locationCountPendingRef.current = new Set();
  }, [locationCountBaseFilters]);

  const showCountPlaceholder = locationCountBaseFilters && Array.isArray(locationCountBaseFilters.and);
  const shouldFetchCounts = !disableCountsFetch && !isDesktop && isOpen && showCountPlaceholder;

  const normalizeLower = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
  const packedTokenVariants = (raw) => {
    const base = normalizeLower(raw);
    if (!base) return [];
    const kebab = base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const variants = new Set([base, kebab]);
    return Array.from(variants).filter(Boolean).map((v) => `|${v}|`);
  };

  const isEncodedLocationValue = (value) => typeof value === "string" && /^[pct]\|/.test(value);
  const decodeLocationValue = (value) => {
    if (!isEncodedLocationValue(value)) return null;
    const parts = value.split("|").map((p) => p.trim());
    const level = parts[0];
    if (level === "p") return { level: "province", province: parts[1] || "" };
    if (level === "c") return { level: "city", province: parts[1] || "", city: parts[2] || "" };
    if (level === "t") return { level: "town", province: parts[1] || "", city: parts[2] || "", town: parts[3] || "" };
    return null;
  };
  const encodeLocationValue = ({ level, province, city, town }) => {
    if (level === "province") return `p|${province}`;
    if (level === "city") return `c|${province}|${city}`;
    return `t|${province}|${city}|${town}`;
  };

  const getCount = (encoded) => {
    const v = locationCountMap?.[encoded];
    return typeof v === "number" ? v : null;
  };

  const ensureCount = useCallback(
    async (encoded) => {
      if (!shouldFetchCounts) return;
      if (!encoded || typeof encoded !== "string") return;
      if (typeof locationCountMapRef.current?.[encoded] === "number") return;
      if (locationCountPendingRef.current.has(encoded)) return;
      locationCountPendingRef.current.add(encoded);

      try {
        const decoded = decodeLocationValue(encoded);
        if (!decoded) return;

        const and = Array.isArray(locationCountBaseFilters?.and) ? [...locationCountBaseFilters.and] : [];
        if (decoded.level === "province") {
          const toks = packedTokenVariants(decoded.province);
          if (toks.length) and.push({ or: toks.map((tok) => ({ provinces: { contains: tok } })) });
        } else if (decoded.level === "city") {
          const provToks = packedTokenVariants(decoded.province);
          if (provToks.length) and.push({ or: provToks.map((tok) => ({ provinces: { contains: tok } })) });
          const cityToks = packedTokenVariants(decoded.city);
          if (cityToks.length) and.push({ or: cityToks.map((tok) => ({ cities: { contains: tok } })) });
        } else if (decoded.level === "town") {
          const provToks = packedTokenVariants(decoded.province);
          if (provToks.length) and.push({ or: provToks.map((tok) => ({ provinces: { contains: tok } })) });
          const cityToks = packedTokenVariants(decoded.city);
          if (cityToks.length) and.push({ or: cityToks.map((tok) => ({ cities: { contains: tok } })) });
          const townToks = packedTokenVariants(decoded.town);
          if (townToks.length) and.push({ or: townToks.map((tok) => ({ towns: { contains: tok } })) });
        }
        const filters = and.length ? { and } : undefined;

        const res = await apolloClient.query({
          query: LISTING_SEARCH_INDEX_CONNECTION_QUERY,
          variables: { filters, page: 1, pageSize: 1 },
          fetchPolicy: "network-only",
        });
        const total = res?.data?.listingSearchIndices_connection?.pageInfo?.total;
        if (typeof total === "number") {
          setLocationCountMap((prev) => ({ ...(prev || {}), [encoded]: total }));
        }
      } finally {
        locationCountPendingRef.current.delete(encoded);
      }
    },
    [apolloClient, locationCountBaseFilters, shouldFetchCounts]
  );

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Enhanced locations data with real coordinates and distance calculations
  const enhancedLocationsData = useMemo(() => {
    if (!Array.isArray(locationsData)) return [];
    
    return locationsData.map(location => {
      let distance = null;
      let coordinates = null;
      
      // If location has coordinates, calculate distance from user
      if (location.lat && location.lng && userLocation) {
        coordinates = { lat: location.lat, lng: location.lng };
        distance = calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng);
      }
      
      // If location has a company with coordinates, use those
      if (location.company?.latitude && location.company?.longitude && userLocation) {
        coordinates = { 
          lat: parseFloat(location.company.latitude), 
          lng: parseFloat(location.company.longitude) 
        };
        distance = calculateDistance(userLocation.lat, userLocation.lng, coordinates.lat, coordinates.lng);
      }
      
      return {
        id: location.id || location.name,
        ...location,
        coordinates,
        distance,
        displayDistance: distance && !isNaN(distance) ? `${Math.round(distance)}km` : null
      };
    });
  }, [locationsData, userLocation]);

  // Filter locations based on search term and sort by distance
  const filteredLocations = useMemo(() => {
    let filtered = enhancedLocationsData.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort by distance (closest first) if user has location
    if (userLocation) {
      filtered.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }
    
    return filtered;
  }, [enhancedLocationsData, searchTerm, userLocation]);

  useEffect(() => {
    if (!shouldFetchCounts) return;
    for (const location of filteredLocations) {
      ensureCount(encodeLocationValue({ level: "province", province: location.name }));
      if (expandedProvinces?.[location.name] && Array.isArray(location.cities)) {
        for (const city of location.cities) {
          ensureCount(encodeLocationValue({ level: "city", province: location.name, city: city.name }));
          const cityKey = `${location.name}::${city.name}`;
          if (expandedCities?.[cityKey] && Array.isArray(city.towns)) {
            for (const town of city.towns) {
              ensureCount(
                encodeLocationValue({
                  level: "town",
                  province: location.name,
                  city: city.name,
                  town: town.name,
                })
              );
            }
          }
        }
      }
    }
  }, [ensureCount, expandedCities, expandedProvinces, filteredLocations, shouldFetchCounts]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedLocations === undefined) return;
    if (!selectedLocations || selectedLocations === 'Any' || selectedLocations === 'All') {
      setSelectedValues([]);
      return;
    }
    setSelectedValues(Array.isArray(selectedLocations) ? selectedLocations : [selectedLocations]);
  }, [isOpen, selectedLocations]);

  const isSelected = (name) => selectedValues.includes(name);
  const toggleSelected = (name) => {
    setSelectedValues((prev) => {
      if (prev.includes(name)) return prev.filter((v) => v !== name);
      return [...prev, name];
    });
  };

  const applySelection = () => {
    if (selectedValues.length === 0) {
      onSelectLocation('Any');
    } else if (selectedValues.length === 1) {
      onSelectLocation(selectedValues[0]);
    } else {
      onSelectLocation(selectedValues);
    }
    onClose();
  };

  const clearSelection = () => {
    setSelectedValues([]);
    onSelectLocation('Any');
    onClose();
  };

  if (!isOpen || isDesktop) return null;

  // Handle "Near me" click - use the hook's location if available
  const handleNearMeClick = () => {
    if (userLocation) {
      // User already has location, use it directly
      setGeolocationStatus('success');
      onSelectLocation({ type: 'coords', lat: userLocation.lat, lng: userLocation.lng });
      onClose();
    } else {
      // Fallback to manual geolocation if hook doesn't have location
      if (navigator.geolocation) {
        setGeolocationStatus('loading');
        setGeolocationError(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setGeolocationStatus('success');
            onSelectLocation({ type: 'coords', lat: latitude, lng: longitude });
            onClose();
          },
          (error) => {
            setGeolocationStatus('error');
            let message = 'Unable to retrieve your location.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location permission denied. Please enable location access in your browser settings.';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                message = 'The request to get user location timed out.';
                break;
              default:
                message = 'An unknown error occurred while fetching your location.';
                break;
            }
            setGeolocationError(message);
          }
        );
      } else {
        setGeolocationStatus('error');
        setGeolocationError('Geolocation is not supported by your browser.');
      }
    }
  };

  return (
    <div className={`flex flex-col ${!isDesktop ? 'fixed inset-0 z-[100] bg-white' : ''}`}>
      {/* Modal Header */}
      <div className="bg-[#333] text-white py-3 px-4 flex justify-between items-center rounded-t-lg">
        <h3 className="text-base font-semibold">Select Location</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#444] transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Enter province, city or suburb"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Geolocation Status/Error Message */}
      {geolocationStatus === 'loading' && (
        <div className="px-4 py-2 text-sm text-gray-700 flex items-center justify-center">
          <Loader className="h-4 w-4 mr-2 animate-spin" /> Getting your location...
        </div>
      )}
      {geolocationStatus === 'error' && geolocationError && (
        <div className="px-4 py-2 text-sm text-red-600">
          {geolocationError}
        </div>
      )}

      {/* Location List */}
      <div className={`overflow-y-auto bg-white ${isDesktop ? 'max-h-[400px] rounded-b-lg' : 'flex-1'}`}>
        {/* Near me option */}
        <button
          onClick={handleNearMeClick}
          className="w-full text-left py-3 px-4 border-b border-gray-100 hover:bg-gray-50 focus:outline-none transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={geolocationStatus === 'loading'}
        >
          <div>
            <div className="text-gray-800 text-base font-medium">
              Near me {userLocation ? '(50km radius)' : ''}
              {userLocation && <span className="text-blue-500 text-sm font-normal ml-2">• Location detected</span>}
            </div>
          </div>
          {geolocationStatus === 'loading' ? (
             <Loader className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
          ) : (
            <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
          )}
        </button>
        {filteredLocations.map((location) => (
          <div key={location.id} className="border-b border-gray-100">
            <div className="flex w-full items-center hover:bg-gray-50 transition-colors">
              <button
                onClick={() => toggleSelected(location.name)}
                className="flex-grow text-left py-3 px-4 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 text-base font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-4 w-4 flex items-center justify-center border border-gray-400 ${isSelected(location.name) ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
                          {isSelected(location.name) ? (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : null}
                        </span>
                        <span>{location.name}</span>
                      </span>
                      {(() => {
                        const encoded = encodeLocationValue({ level: "province", province: location.name });
                        const fetched = getCount(encoded);
                        const display =
                          typeof fetched === "number"
                            ? fetched
                            : shouldFetchCounts
                              ? "..."
                              : showCountPlaceholder
                                ? "..."
                                : location.count;
                        return display !== null && display !== undefined ? (
                          <span className="text-gray-500 text-sm font-normal ml-1">({display})</span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm mr-2">
                    {location.id !== 'all' && !location.cities ? 'Province' : ''}
                    {location.displayDistance && location.id !== 'all' && (
                      <span className="text-blue-500 font-medium"> • {location.displayDistance}</span>
                    )}
                  </div>
                </div>
              </button>
              
              {/* Expand Button for Cities */}
              {location.cities && location.cities.length > 0 && (
                <button
                  onClick={(e) => toggleProvince(e, location.name)}
                  className="p-3 mr-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {expandedProvinces[location.name] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            
            {/* Cities List */}
            {expandedProvinces[location.name] && location.cities && (
              <div className="bg-gray-50 border-t border-gray-100">
                {location.cities.map((city) => {
                  const cityKey = `${location.name}::${city.name}`;
                  const hasTowns = Array.isArray(city.towns) && city.towns.length > 0;
                  const showTownsDropdown =
                    hasTowns && !(city.towns.length === 1 && city.towns[0]?.name === city.name);

                  return (
                    <div key={city.name} className="border-b border-gray-100 last:border-b-0">
                      <div className="w-full text-left py-2.5 pl-8 pr-2 hover:bg-gray-100 focus:outline-none transition-colors flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => toggleSelected(city.name)}
                          className="flex-1 text-left pr-3"
                        >
                          <span className="text-gray-700 text-sm font-medium inline-flex items-center gap-2">
                            <span className={`h-4 w-4 flex items-center justify-center border border-gray-400 ${isSelected(city.name) ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
                              {isSelected(city.name) ? (
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : null}
                            </span>
                            <span>{city.name}</span>
                          </span>
                        </button>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const encoded = encodeLocationValue({ level: "city", province: location.name, city: city.name });
                            const fetched = getCount(encoded);
                            const display =
                              typeof fetched === "number"
                                ? fetched
                                : shouldFetchCounts
                                  ? "..."
                                  : showCountPlaceholder
                                    ? "..."
                                    : city.count;
                            return <span className="text-gray-400 text-xs">({display ?? 0})</span>;
                          })()}
                          {showTownsDropdown ? (
                            <button
                              type="button"
                              onClick={(e) => toggleCity(e, location.name, city.name)}
                              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              {expandedCities[cityKey] ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {showTownsDropdown && expandedCities[cityKey] ? (
                        <div className="bg-white border-t border-gray-100">
                          {city.towns.map((town) => (
                            <button
                              key={`${city.name}-${town.name}`}
                              onClick={() => toggleSelected(town.name)}
                              className="w-full text-left py-2.5 pl-12 pr-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 focus:outline-none transition-colors flex justify-between items-center"
                            >
                              <span className="text-gray-700 text-sm font-medium inline-flex items-center gap-2">
                                <span className={`h-4 w-4 flex items-center justify-center border border-gray-400 ${isSelected(town.name) ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
                                  {isSelected(town.name) ? (
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : null}
                                </span>
                                <span>{town.name}</span>
                              </span>
                              {(() => {
                                const encoded = encodeLocationValue({
                                  level: "town",
                                  province: location.name,
                                  city: city.name,
                                  town: town.name,
                                });
                                const fetched = getCount(encoded);
                                const display =
                                  typeof fetched === "number"
                                    ? fetched
                                    : shouldFetchCounts
                                      ? "..."
                                      : showCountPlaceholder
                                        ? "..."
                                        : town.count;
                                return <span className="text-gray-400 text-xs">({display ?? 0})</span>;
                              })()}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 bg-white p-3 flex gap-2">
        <button
          type="button"
          onClick={clearSelection}
          className="flex-1 h-11 border border-gray-300 text-gray-700 font-semibold"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={applySelection}
          className="flex-1 h-11 bg-[#D4AF37] text-white font-semibold"
        >
          Apply{selectedValues.length > 0 ? ` (${selectedValues.length})` : ''}
        </button>
      </div>
    </div>
  );
} 
