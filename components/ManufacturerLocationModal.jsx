"use client"

import { useState, useEffect } from 'react'
import { X, MapPin, Loader, Check } from 'lucide-react'
import Image from 'next/image'

export default function ManufacturerLocationModal({ isOpen, onClose, company, onLocationUpdate }) {
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGeolocationSupported, setIsGeolocationSupported] = useState(false)

  useEffect(() => {
    // Check if geolocation is supported
    setIsGeolocationSupported(typeof navigator !== 'undefined' && 'geolocation' in navigator)
    
    // Pre-fill with existing location if available
    if (company?.location) {
      setLocation(company.location)
    }
  }, [company])

  const handleDetectLocation = () => {
    if (!isGeolocationSupported) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLatitude(latitude.toString())
        setLongitude(longitude.toString())
        setIsLoading(false)
        
        // Reverse geocode to get address (simplified - in real app you'd use a geocoding service)
        // For now, we'll use the coordinates as location
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
      },
      (error) => {
        setIsLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access was denied. Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable')
            break
          case error.TIMEOUT:
            setError('Location request timed out')
            break
          default:
            setError('An unknown error occurred')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleSaveLocation = async () => {
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    setIsLoading(true)
    setError('')
    console.log(company.documentId, location, latitude, longitude)
    
    try {
      const response = await fetch(
        `https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/companies/${company.documentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              location: location.trim(),
              latitude: latitude ? latitude.toString() : null,
              longitude: longitude ? longitude.toString() : null
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update company location')
      }

      const result = await response.json()
      const updatedCompany = {
        ...company,
        location: location.trim(),
        latitude: latitude ? latitude.toString() : null,
        longitude: longitude ? longitude.toString() : null
      }

      // Call the callback to update the parent component
      if (onLocationUpdate) {
        onLocationUpdate(updatedCompany)
      }

      onClose()
    } catch (error) {
      console.error('Error updating company location:', error)
      setError('Failed to save location. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Set Store Location</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Your store location is required to help customers find you and calculate distances to your listings.
            </p>
            {company?.location && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <Check className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">Current location: {company.location}</span>
              </div>
            )}
          </div>
          
          {/* Location Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Address/Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your store address (e.g., 123 Main St, Johannesburg, Gauteng)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Coordinates (optional) */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (optional)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g., -26.2041"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (optional)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g., 28.0473"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isGeolocationSupported && (
              <button
                onClick={handleDetectLocation}
                disabled={isLoading}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Detect my current location
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSaveLocation}
              disabled={isLoading || !location.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Location
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Your location will be used to calculate distances for customers viewing your listings. 
              This helps customers find manufacturers closer to them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 