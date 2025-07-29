import { useState, useEffect } from 'react'

export const useGuestLocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Check if navigator is available
    if (typeof navigator === 'undefined') {
      setError('Navigator not available')
      setLoading(false)
      return
    }

    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      setError('LocalStorage not available')
      setLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem('guestLocation')
      if (stored) {
        const parsed = JSON.parse(stored)
        setLocation(parsed)
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      try {
        localStorage.removeItem('guestLocation')
      } catch (e) {
        console.error('Error clearing localStorage:', e)
      }
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
          setError('Failed to get location')
          setLoading(false)
        }
      )
    } catch (error) {
      console.error('Error setting up geolocation:', error)
      setError('Failed to setup location detection')
      setLoading(false)
    }
  }, [])

  const calculateDistanceFrom = (to) => {
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
  }

  return {
    location,
    error,
    loading,
    calculateDistanceFrom,
  }
} 