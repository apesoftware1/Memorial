import { useState, useEffect, useCallback } from 'react'

export const useGuestLocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const getLocation = useCallback(() => {
    // Reset before fetching
    setLoading(true)
    setError(null)

    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    if (typeof navigator === 'undefined') {
      setError('Navigator not available')
      setLoading(false)
      return
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          try {
            localStorage.setItem('guestLocation', JSON.stringify(coords))
          } catch (e) {
            console.error('Error saving to localStorage:', e)
          }

          setLocation(coords)
          setLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          let errorMessage = 'Failed to get location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                'Location access was denied. Please enable location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
            default:
              errorMessage = 'Failed to get location'
          }

          setError(errorMessage)
          setLoading(false)
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000, // cache 5 minutes
        }
      )
    } catch (error) {
      console.error('Error setting up geolocation:', error)
      setError('Failed to setup location detection')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('guestLocation')
        if (stored) {
          const parsed = JSON.parse(stored)
          setLocation(parsed)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e)
        try {
          localStorage.removeItem('guestLocation')
        } catch (clearErr) {
          console.error('Error clearing localStorage:', clearErr)
        }
      }
    }

    // No cached location, fetch fresh
    getLocation()
  }, [getLocation])

  const calculateDistanceFrom = useCallback(
    (to) => {
      if (!location || !to || typeof to.lat !== 'number' || typeof to.lng !== 'number') {
        return null
      }

      try {
        const toRad = (deg) => deg * (Math.PI / 180)
        const R = 6371 // Earth radius in km

        const dLat = toRad(to.lat - location.lat)
        const dLng = toRad(to.lng - location.lng)

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(location.lat)) *
            Math.cos(toRad(to.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      } catch (error) {
        console.error('Error calculating distance:', error)
        return null
      }
    },
    [location]
  )

  return {
    location,
    error,
    loading,
    calculateDistanceFrom,
    refreshLocation: getLocation, // 🔥 Added manual refresh
  }
}