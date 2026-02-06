"use client"

import { useState, useEffect, useMemo } from "react"
import { X, MapPin, Loader, ChevronDown, ChevronUp } from "lucide-react"
import { useGuestLocation } from "@/hooks/useGuestLocation"

export default function LocationModal({ isOpen, onClose, locationsData, onSelectLocation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);
  const [geolocationStatus, setGeolocationStatus] = useState('idle');
  const [geolocationError, setGeolocationError] = useState(null);
  const [expandedProvinces, setExpandedProvinces] = useState({});

  const toggleProvince = (e, provinceName) => {
    e.stopPropagation();
    setExpandedProvinces(prev => ({
      ...prev,
      [provinceName]: !prev[provinceName]
    }));
  };
  
  // Use real location data from the hook
  const { location: userLocation } = useGuestLocation();

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
                onClick={() => onSelectLocation(location.name)}
                className="flex-grow text-left py-3 px-4 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 text-base font-medium">
                      {location.name} 
                      {location.count !== undefined && (
                        <span className="text-gray-500 text-sm font-normal ml-1">({location.count})</span>
                      )}
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
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            
            {/* Cities List */}
            {expandedProvinces[location.name] && location.cities && (
              <div className="bg-gray-50 border-t border-gray-100">
                {location.cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => onSelectLocation(city.name)}
                    className="w-full text-left py-2.5 pl-8 pr-4 border-b border-gray-100 hover:bg-gray-100 focus:outline-none transition-colors flex justify-between items-center"
                  >
                    <span className="text-gray-700 text-sm font-medium">{city.name}</span>
                    <span className="text-gray-400 text-xs">({city.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 