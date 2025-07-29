"use client"

import { createContext, useContext, useState, useEffect } from 'react'

const LocationContext = createContext()

export function LocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState('prompt') // 'prompt', 'granted', 'denied'
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)

  // Check if geolocation is supported
  const isGeolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  // Get user's current location
  const getUserLocation = () => {
    if (!isGeolocationSupported) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        setLocationPermission('granted')
        setIsLoadingLocation(false)
        
        // Store in localStorage for persistence
        localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }))
        localStorage.setItem('locationPermission', 'granted')
      },
      (error) => {
        setIsLoadingLocation(false)
        setLocationError(error.message)
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermission('denied')
            localStorage.setItem('locationPermission', 'denied')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out')
            break
          default:
            setLocationError('An unknown error occurred')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    )
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return Math.round(distance)
  }

  // Get distance for a listing
  const getListingDistance = (listingLat, listingLon) => {
    if (!userLocation) return null
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      listingLat,
      listingLon
    )
    
    return `${distance} km from you`
  }

  // Check if location permission is denied
  const isLocationDenied = () => {
    return locationPermission === 'denied'
  }

  // Check if location is available
  const isLocationAvailable = () => {
    return userLocation !== null && locationPermission === 'granted'
  }

  // Set manual location (for when user enters location manually)
  const setManualLocation = (locationName) => {
    // In a real app, you would geocode the location name to get coordinates
    // For now, we'll just store the location name and set a flag
    setUserLocation({ locationName, isManual: true })
    setLocationPermission('granted')
    localStorage.setItem('userLocation', JSON.stringify({ locationName, isManual: true }))
    localStorage.setItem('locationPermission', 'granted')
  }

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation')
    const savedPermission = localStorage.getItem('locationPermission')
    
    if (savedLocation) {
      const parsedLocation = JSON.parse(savedLocation)
      setUserLocation(parsedLocation)
    }
    
    if (savedPermission) {
      setLocationPermission(savedPermission)
    }
  }, [])

  const value = {
    userLocation,
    locationPermission,
    isLoadingLocation,
    locationError,
    isGeolocationSupported,
    getUserLocation,
    getListingDistance,
    isLocationDenied,
    isLocationAvailable,
    setManualLocation
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
} 